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

// Distributed lock with atomic Lua-script release (prevents TOCTOU race)
const RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

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
    // Atomic compare-and-delete via Lua — prevents releasing another holder's lock
    await redis.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, token);
  }
}
