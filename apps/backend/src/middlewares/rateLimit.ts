import Elysia from 'elysia';
import { getRedis, cacheKey } from '../utils/redis.ts';
import { logger } from '../utils/logger.ts';

// Lua script: atomic SET NX with TTL + INCR in one round-trip.
// Returns [current_count, ttl_seconds]
const RATE_LIMIT_SCRIPT = `
  local key = KEYS[1]
  local window = tonumber(ARGV[1])
  -- Try to initialise the key (NX = only if not exists)
  redis.call("SET", key, 0, "PX", window * 1000, "NX")
  local current = redis.call("INCR", key)
  local pttl = redis.call("PTTL", key)
  return {current, pttl}
`;

interface RateLimitOptions {
  max: number;        // Max requests per window
  windowMs: number;   // Window in milliseconds
  keyPrefix?: string;
  /** Custom key extractor — defaults to IP. Return string to use as rate-limit bucket key. */
  keyBy?: (ctx: { request: Request; user?: { id: string } }) => string;
}

export function rateLimit(opts: RateLimitOptions) {
  return new Elysia({ name: `rate-limit-${opts.keyPrefix ?? 'default'}` })
    .derive({ as: 'scoped' }, async (ctx) => {
      // @ts-ignore — Elysia context type is dynamic; destructure after cast
      const { request, set } = ctx as { request: Request; set: { headers: Record<string, string>; status: number } };
      const redis = getRedis();
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      // biome-ignore lint/suspicious/noExplicitAny: Elysia context is dynamically typed by .derive() chain
      const ctxUser = (ctx as any).user as { id: string } | undefined;
      const bucketKey = opts.keyBy
        ? opts.keyBy({ request, user: ctxUser })
        : ip;
      const key = cacheKey.rateLimit(`${opts.keyPrefix ?? 'api'}:${bucketKey}`);
      const windowSecs = Math.ceil(opts.windowMs / 1000);

      // Single atomic round-trip: init key if new, increment, get TTL.
      // If Redis is unavailable, fail open (pass the request through) rather than
      // bringing down the entire API. Log the error so it surfaces in monitoring.
      let current: number;
      let pttlMs: number;
      try {
        [current, pttlMs] = await redis.eval(
          RATE_LIMIT_SCRIPT, 1, key, windowSecs,
        ) as [number, number];
      } catch (err) {
        logger.error({ err }, 'Rate limiter: Redis unavailable — passing request through');
        return { rateLimited: false };
      }

      const remaining = Math.max(0, opts.max - current);
      // X-RateLimit-Reset: Unix timestamp in seconds (per HTTP spec draft)
      const resetUnixSecs = Math.floor((Date.now() + Math.max(pttlMs, 0)) / 1000);

      set.headers['X-RateLimit-Limit'] = String(opts.max);
      set.headers['X-RateLimit-Remaining'] = String(remaining);
      set.headers['X-RateLimit-Reset'] = String(resetUnixSecs);

      if (current > opts.max) {
        logger.warn({ ip, key, current }, 'Rate limit exceeded');
        set.status = 429;
        return {
          rateLimited: true,
          response: {
            success: false,
            error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Слишком много запросов. Попробуйте позже.' },
          },
        };
      }

      return { rateLimited: false };
    })
    .onBeforeHandle({ as: 'scoped' }, ({ rateLimited, response }) => {
      if (rateLimited) return response;
    });
}
