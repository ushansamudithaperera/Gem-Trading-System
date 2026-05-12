import http from 'http';
import app from './app';
import { connectDB } from './config/database';
import { initSocket } from './sockets/index';
import { env } from './config/env';
import { logger } from './config/logger';
import { getRedisClient } from './config/redis';

const PORT = env.PORT;

let server: http.Server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ MongoDB connected');

    // Test Redis connection (optional)
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        await redisClient.connect();
        await redisClient.ping();
        logger.info('✅ Redis connected');
      } catch (redisErr) {
        logger.warn('⚠️ Redis connection failed, continuing without cache:', redisErr);
      }
    } else {
      logger.warn('⚠️ Redis not configured, continuing without cache');
    }

    // Create HTTP server
    server = http.createServer(app);
    
    // Initialize Socket.IO
    initSocket(server);
    logger.info('✅ Socket.IO initialized');

    // Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
      logger.info(`📡 Socket.IO ready`);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing gracefully...');
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      // Close database connection
      const mongoose = await import('mongoose');
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
      
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();