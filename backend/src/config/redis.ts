import Redis from 'ioredis';
import { logger } from './logger';
import { env } from './env';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (!env.REDIS_URL) {
    logger.warn('REDIS_URL not set, running without Redis cache');
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      tls: env.REDIS_URL.includes('upstash.io') ? {} : undefined,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 10) {
          logger.error('Redis max retries reached, giving up');
          return null; // stop retrying
        }
        const delay = Math.min(times * 100, 3000);
        logger.warn(`Redis retry attempt ${times}, delaying ${delay}ms`);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis error: ${err}`);
    });
  }

  return redisClient;
};

// Helper functions
export const cacheGet = async (key: string): Promise<any | null> => {
  const client = getRedisClient();
  if (!client) return null;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheSet = async (key: string, value: any, ttlSeconds = 3600): Promise<void> => {
  const client = getRedisClient();
  if (!client) return;
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

export const cacheDel = async (key: string): Promise<void> => {
  const client = getRedisClient();
  if (!client) return;
  await client.del(key);
};