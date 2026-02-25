import Elysia from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { jwt } from '@elysiajs/jwt';
import { config, corsOrigins, isDev } from './config/index.ts';
import { logger } from './utils/logger.ts';
import { getRedis } from './utils/redis.ts';
import { db } from './db/index.ts';

// Modules
import { authModule } from './modules/auth/routes.ts';
import { trackingModule, trackingRedirectModule } from './modules/tracking/routes.ts';
import { gamificationModule } from './modules/gamification/routes.ts';
import { showcaseModule } from './modules/showcase/routes.ts';
import { analyticsModule } from './modules/analytics/routes.ts';
import { subscriptionsModule } from './modules/subscriptions/routes.ts';
import { usersModule } from './modules/users/routes.ts';

// Middleware
import { auditMiddleware } from './middlewares/audit.ts';
import { rateLimit } from './middlewares/rateLimit.ts';

const app = new Elysia()
  // ─── Global plugins ──────────────────────────────────────────────────────
  .use(cors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }))
  .use(jwt({
    name: 'jwt',
    secret: config.JWT_SECRET,
    exp: config.JWT_ACCESS_TTL,
  }))
  .use(isDev ? swagger({
    documentation: {
      info: { title: 'Showcase Platform API', version: '2.0.0', description: 'Telegram WebApp Showcase' },
      tags: [
        { name: 'Auth', description: 'Авторизация' },
        { name: 'Tracking', description: 'Трекинг-ссылки' },
        { name: 'Gamification', description: 'Геймификация' },
        { name: 'Showcase', description: 'Demo сценарии' },
        { name: 'Analytics', description: 'Аналитика' },
      ],
    },
  }) : new Elysia())
  .use(auditMiddleware)

  // ─── Security headers ─────────────────────────────────────────────────────
  .onRequest(({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff';
    set.headers['X-Frame-Options'] = 'SAMEORIGIN';
    set.headers['X-XSS-Protection'] = '1; mode=block';
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  })

  // ─── Health checks ────────────────────────────────────────────────────────
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .get('/health/ready', async ({ set }) => {
    try {
      await db.execute(sql`SELECT 1` as any);
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
  )

  // ─── Global error handler ─────────────────────────────────────────────────
  .onError(({ code, error, set }) => {
    logger.error({ code, error: String(error) }, 'Unhandled error');

    if (code === 'VALIDATION') {
      set.status = 400;
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Неверные данные запроса', details: error.message } };
    }
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { success: false, error: { code: 'NOT_FOUND', message: 'Маршрут не найден' } };
    }

    set.status = 500;
    return { success: false, error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } };
  })

  .listen({ port: parseInt(config.PORT), hostname: config.HOST });

// ─── Startup logs ─────────────────────────────────────────────────────────
logger.info(`
╔═══════════════════════════════════════════╗
║     🚀 Showcase Platform Backend          ║
║     Port: ${config.PORT.padEnd(5)}                        ║
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

// Fix missing import
import { sql } from 'drizzle-orm';
