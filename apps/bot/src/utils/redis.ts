import { Redis } from 'ioredis';
import { cfg } from '../config.ts';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(cfg.REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true });
    _redis.on('error', (e) => console.error('[Redis]', e.message));
  }
  return _redis;
}

// Scheduler: delayed tasks via Redis sorted set
export const scheduler = {
  async schedule(taskType: string, payload: unknown, delayMs: number): Promise<void> {
    const redis = getRedis();
    const score = Date.now() + delayMs;
    const value = JSON.stringify({ type: taskType, payload, id: crypto.randomUUID() });
    await redis.zadd('bot:scheduler', score, value);
  },

  async poll(handler: (task: { type: string; payload: unknown }) => Promise<void>): Promise<void> {
    const redis = getRedis();
    const now = Date.now();
    const tasks = await redis.zrangebyscore('bot:scheduler', '-inf', now, 'LIMIT', 0, 10);
    if (tasks.length === 0) return;

    // Remove and process atomically
    const pipeline = redis.pipeline();
    for (const t of tasks) pipeline.zrem('bot:scheduler', t);
    await pipeline.exec();

    for (const t of tasks) {
      try {
        await handler(JSON.parse(t));
      } catch (e) {
        console.error('[Scheduler] task error:', e);
      }
    }
  },
};
