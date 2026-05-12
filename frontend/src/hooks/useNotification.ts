import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { fetchNotifications, markAsRead, markAllAsRead } from '../services/notification.service';
import { Notification } from '../components/notifications/NotificationBell';

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket, on, off } = useSocket();

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications(1, 50);
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    on('new_notification', handleNewNotification);
    return () => {
      off('new_notification', handleNewNotification);
    };
  }, [socket, on, off]);

  const markAsReadHandler = async (notificationId: string) => {
    await markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => (n._id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsReadHandler = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const addLocalNotification = (title: string, message: string) => {
    const tempNotif: Notification = {
      _id: Date.now().toString(),
      title,
      message,
      read: false,
      type: 'ORDER_CREATED',
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [tempNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: markAsReadHandler,
    markAllAsRead: markAllAsReadHandler,
    addLocalNotification,
    refresh: loadNotifications,
  };
};