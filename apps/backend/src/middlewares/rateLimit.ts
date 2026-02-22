import Elysia from 'elysia';
import { getRedis, cacheKey } from '../utils/redis.ts';
import { logger } from '../utils/logger.ts';

interface RateLimitOptions {
  max: number;        // Max requests per window
  windowMs: number;   // Window in milliseconds
  keyPrefix?: string;
}

export function rateLimit(opts: RateLimitOptions) {
  return new Elysia({ name: `rate-limit-${opts.keyPrefix ?? 'default'}` })
    .derive({ as: 'scoped' }, async ({ request, set }) => {
      const redis = getRedis();
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      const key = cacheKey.rateLimit(`${opts.keyPrefix ?? 'api'}:${ip}`);
      const windowSecs = Math.ceil(opts.windowMs / 1000);

      const current = await redis.incr(key);
      if (current === 1) await redis.expire(key, windowSecs);

      const remaining = Math.max(0, opts.max - current);
      const ttl = await redis.ttl(key);

      set.headers['X-RateLimit-Limit'] = String(opts.max);
      set.headers['X-RateLimit-Remaining'] = String(remaining);
      set.headers['X-RateLimit-Reset'] = String(Date.now() + ttl * 1000);

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
