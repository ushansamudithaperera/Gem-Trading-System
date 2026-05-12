import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis';
import { logger } from '../config/logger';

export const liveness = (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
};

export const readiness = async (_req: Request, res: Response) => {
  const checks = {
    database: false,
    redis: false,
  };

  // Check MongoDB
  if (mongoose.connection.readyState === 1) {
    checks.database = true;
  }

  // Check Redis (optional)
  const redisClient = getRedisClient();
  if (redisClient) {
    try {
      await redisClient.ping();
      checks.redis = true;
    } catch (err) {
      logger.warn('Redis health check failed');
    }
  } else {
    checks.redis = true; // Not configured, skip
  }

  const isReady = checks.database && checks.redis;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    status: isReady ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString(),
  });
};