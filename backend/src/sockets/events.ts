import { Server as SocketServer, Socket } from 'socket.io';
import { logger } from '../config/logger';

// Custom event handlers
export const handleEvents = (_io: SocketServer, socket: Socket) => {
  // Join a specific order room for real-time updates
  socket.on('join-order', (orderId: string) => {
    const room = `order:${orderId}`;
    socket.join(room);
    logger.debug(`Socket ${socket.id} joined room ${room}`);
    socket.emit('joined-order', { orderId });
  });
  
  // Leave order room
  socket.on('leave-order', (orderId: string) => {
    const room = `order:${orderId}`;
    socket.leave(room);
    logger.debug(`Socket ${socket.id} left room ${room}`);
  });
  
  // Join cutting job room
  socket.on('join-cutting', (jobId: string) => {
    const room = `cutting:${jobId}`;
    socket.join(room);
    socket.emit('joined-cutting', { jobId });
  });
  
  // Ping (keep-alive)
  socket.on('ping', (callback?: () => void) => {
    if (callback) callback();
  });
  
  // Client ready
  socket.on('ready', () => {
    logger.debug(`Socket ${socket.id} is ready`);
    socket.emit('connected', { timestamp: new Date().toISOString() });
  });
};

// Helper functions to emit events from outside
export const emitOrderUpdate = (io: SocketServer, orderId: string, status: string, data?: any) => {
  io.to(`order:${orderId}`).emit('order-updated', { orderId, status, data, timestamp: new Date().toISOString() });
};

export const emitCuttingProgress = (io: SocketServer, jobId: string, progress: any) => {
  io.to(`cutting:${jobId}`).emit('cutting-progress', { jobId, ...progress, timestamp: new Date().toISOString() });
};

export const emitNotification = (io: SocketServer, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('new-notification', notification);
};