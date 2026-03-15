import { Redis } from 'ioredis';
import { cfg } from '../config.ts';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis(cfg.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    _redis.on('error', (e) => console.error('[Redis]', e.message));
  }
  return _redis;
}

// Scheduler: delayed tasks via Redis sorted set
// Uses ZPOPMIN with score filter via Lua for atomic pop — prevents duplicate delivery
// on multi-instance deploys.
const POLL_SCRIPT = `
  local now = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local items = redis.call("ZRANGEBYSCORE", KEYS[1], "-inf", now, "LIMIT", 0, limit)
  if #items == 0 then return {} end
  redis.call("ZREM", KEYS[1], unpack(items))
  return items
`;

export const scheduler = {
  async schedule(
    taskType: string,
    payload: unknown,
    delayMs: number,
  ): Promise<void> {
    const redis = getRedis();
    const score = Date.now() + delayMs;
    const value = JSON.stringify({
      type: taskType,
      payload,
      id: crypto.randomUUID(),
    });
    await redis.zadd('bot:scheduler', score, value);
  },

  async poll(
    handler: (task: { type: string; payload: unknown }) => Promise<void>,
  ): Promise<void> {
    const redis = getRedis();
    const now = Date.now();
    // Atomically pop up to 10 due tasks — safe for multi-instance deploys
    const rawTasks = (await redis.eval(
      POLL_SCRIPT,
      1,
      'bot:scheduler',
      now,
      10,
    )) as string[];
    if (!rawTasks || rawTasks.length === 0) return;

    for (const t of rawTasks) {
      try {
        await handler(JSON.parse(t));
      } catch (e) {
        console.error('[Scheduler] task error:', e);
      }
    }
  },

  /**
   * Check if a task of a given type for a given user is already scheduled.
   *
   * Previously this fetched the entire sorted set (O(N)) on every /start command.
   * Now we maintain a small Redis Set per taskType so deduplication is O(1).
   *
   * The dedup key is auto-expired via a TTL that matches the maximum scheduling
   * horizon (24 h) so stale entries don't accumulate.
   */
  async hasScheduled(taskType: string, userId: string): Promise<boolean> {
    const redis = getRedis();
    return (await redis.sismember(`bot:scheduled:${taskType}`, userId)) === 1;
  },

  /** Mark a (taskType, userId) pair as scheduled. Call this alongside schedule(). */
  async markScheduled(
    taskType: string,
    userId: string,
    ttlSecs = 86400,
  ): Promise<void> {
    const redis = getRedis();
    const key = `bot:scheduled:${taskType}`;
    await redis.sadd(key, userId);
    // Refresh TTL so the key doesn't outlive the longest possible delay
    await redis.expire(key, ttlSecs);
  },

  /** Remove the dedup marker once a task has been delivered. */
  async unmarkScheduled(taskType: string, userId: string): Promise<void> {
    const redis = getRedis();
    await redis.srem(`bot:scheduled:${taskType}`, userId);
  },
};
