import api from './api';

export const fetchNotifications = async (page = 1, limit = 20) => {
  const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const markAsRead = async (notificationId: string) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data.data;
};