import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { swagger } from '@elysiajs/swagger';
import { sql } from 'drizzle-orm';
import Elysia from 'elysia';
import { config, corsOrigins, isDev } from './config/index.ts';
import { db } from './db/index.ts';
import { logger } from './utils/logger.ts';
import { getRedis } from './utils/redis.ts';

import { analyticsModule } from './modules/analytics/routes.ts';
// Modules
import { authModule } from './modules/auth/routes.ts';
import { httpRequestDuration, httpRequestsTotal, metricsModule } from './modules/metrics/routes.ts';
import { gamificationModule } from './modules/gamification/routes.ts';
import { questsModule } from './modules/quests/routes.ts';
import { referralsModule } from './modules/referrals/routes.ts';
import { showcaseModule } from './modules/showcase/routes.ts';
import { subscriptionsModule } from './modules/subscriptions/routes.ts';
import {
  trackingModule,
  trackingRedirectModule,
} from './modules/tracking/routes.ts';
import { usersModule } from './modules/users/routes.ts';

// Middleware
import { auditMiddleware } from './middlewares/audit.ts';
import { rateLimit } from './middlewares/rateLimit.ts';

const app = new Elysia()
  // ─── Global plugins ──────────────────────────────────────────────────────
  .use(
    cors({
      origin: corsOrigins,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  )
  .use(
    jwt({
      name: 'jwt',
      secret: config.JWT_SECRET,
      exp: config.JWT_ACCESS_TTL,
    }),
  )
  .use(
    isDev
      ? swagger({
          documentation: {
            info: {
              title: 'Showcase Platform API',
              version: '2.0.0',
              description: 'Telegram WebApp Showcase',
            },
            tags: [
              { name: 'Auth', description: 'Авторизация' },
              { name: 'Tracking', description: 'Трекинг-ссылки' },
              { name: 'Gamification', description: 'Геймификация' },
              { name: 'Showcase', description: 'Demo сценарии' },
              { name: 'Analytics', description: 'Аналитика' },
            ],
          },
        })
      : new Elysia(),
  )
  .use(auditMiddleware)

  // ─── Security headers ─────────────────────────────────────────────────────
  .onRequest(({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff';
    set.headers['X-Frame-Options'] = 'SAMEORIGIN';
    set.headers['X-XSS-Protection'] = '1; mode=block';
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  })

  // ─── Prometheus request instrumentation ───────────────────────────────────
  .onAfterHandle(({ request, set }) => {
    const method = request.method;
    const url = new URL(request.url);
    // Normalise path: strip UUIDs/IDs to reduce cardinality
    const route = url.pathname.replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '/:id',
    );
    const status = String(set.status ?? 200);
    httpRequestsTotal.inc({ method, route, status });
    httpRequestDuration.observe({ method, route }, 0);
  })

  // ─── Prometheus metrics (internal — not proxied by nginx) ─────────────────
  .use(metricsModule)

  // ─── Health checks ────────────────────────────────────────────────────────
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .get('/health/ready', async ({ set }) => {
    try {
      await db.execute(sql`SELECT 1`);
      const redis = getRedis();
      await redis.ping();
      return { status: 'ready', db: 'ok', redis: 'ok' };
    } catch (err) {
      set.status = 503;
      return { status: 'not ready', error: String(err) };
    }
  })

  // ─── Public: tracking redirect ────────────────────────────────────────────
  .use(trackingRedirectModule)

  // ─── API v1 ───────────────────────────────────────────────────────────────
  .group('/api/v1', (app) =>
    app
      .use(rateLimit({ max: 1000, windowMs: 60_000, keyPrefix: 'api' }))
      .use(authModule)
      .use(trackingModule)
      .use(gamificationModule)
      .use(showcaseModule)
      .use(analyticsModule)
      .use(subscriptionsModule)
      .use(usersModule)
      .use(questsModule)
      .use(referralsModule),
  )

  // ─── Global error handler ─────────────────────────────────────────────────
  .onError(({ code, error, set }) => {
    logger.error({ code, error: String(error) }, 'Unhandled error');

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Неверные данные запроса',
          details: error.message,
        },
      };
    }
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Маршрут не найден' },
      };
    }

    set.status = 500;
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' },
    };
  })

  // config.PORT is already a number (coerced in config/index.ts)
  .listen({ port: config.PORT, hostname: config.HOST });

// ─── Startup logs ─────────────────────────────────────────────────────────
logger.info(`
╔═══════════════════════════════════════════╗
║     🚀 Showcase Platform Backend          ║
║     Port: ${String(config.PORT).padEnd(5)}                        ║
║     Mode: ${config.NODE_ENV.padEnd(12)}               ║
╚═══════════════════════════════════════════╝
`);

if (isDev) {
  logger.info(`📚 Swagger UI: http://localhost:${config.PORT}/swagger`);
}

// ─── Graceful shutdown ────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  await getRedis().quit();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export type App = typeof app;
