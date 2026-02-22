import { Redis } from 'ioredis';
import { config } from '../config/index.ts';
import { logger } from './logger.ts';

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
    });

    redisInstance.on('connect', () => logger.info('Redis connected'));
    redisInstance.on('error', (err) => logger.error({ err }, 'Redis error'));
    redisInstance.on('close', () => logger.warn('Redis connection closed'));
  }
  return redisInstance;
}

// Key builders — centralized naming
export const cacheKey = {
  user: (id: string) => `user:${id}`,
  userByTgId: (tgId: number) => `user:tg:${tgId}`,
  session: (token: string) => `session:${token}`,
  rateLimit: (key: string) => `rl:${key}`,
  replayNonce: (nonce: string) => `nonce:${nonce}`,
  gamification: (userId: string) => `gamification:${userId}`,
  leaderboard: () => 'leaderboard:global',
  scenarioMetrics: (id: string) => `scenario:metrics:${id}`,
  liveMetrics: () => 'live:metrics',
} as const;

// Distributed lock
export async function withLock<T>(
  redis: Redis,
  key: string,
  ttlMs: number,
  fn: () => Promise<T>,
): Promise<T | null> {
  const lockKey = `lock:${key}`;
  const token = crypto.randomUUID();
  const acquired = await redis.set(lockKey, token, 'PX', ttlMs, 'NX');
  if (!acquired) return null;

  try {
    return await fn();
  } finally {
    // Atomic release
    const current = await redis.get(lockKey);
    if (current === token) await redis.del(lockKey);
  }
}
