/**
 * Socket.IO event names used throughout the application
 */
export const SOCKET_EVENTS = {
  // Client → Server
  AUTHENTICATE: 'authenticate',
  JOIN_ORDER: 'join-order',
  LEAVE_ORDER: 'leave-order',
  JOIN_CUTTING: 'join-cutting',
  LEAVE_CUTTING: 'leave-cutting',
  PING: 'ping',
  READY: 'ready',

  // Server → Client
  CONNECTED: 'connected',
  NEW_NOTIFICATION: 'new-notification',
  ORDER_UPDATED: 'order-updated',
  CUTTING_PROGRESS: 'cutting-progress',
  JOINED_ORDER: 'joined-order',
  JOINED_CUTTING: 'joined-cutting',
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

/**
 * Helper to emit events with consistent structure
 */
export const emitWithTimestamp = (event: string, data?: any) => ({
  event,
  data,
  timestamp: new Date().toISOString(),
});