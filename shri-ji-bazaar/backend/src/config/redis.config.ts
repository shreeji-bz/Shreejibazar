/**
 * Shri Ji Bazaar - Redis Configuration
 */

import { createClient, RedisClientType } from 'redis';
import { config } from './app.config';
import { logger } from '../common/utils/logger';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
      },
      password: redisConfig.password || undefined,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis disconnected');
    }
  } catch (error) {
    logger.error('Redis disconnection error:', error);
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export default redisClient;
