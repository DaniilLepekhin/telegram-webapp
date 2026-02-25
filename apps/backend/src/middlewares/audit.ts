import Elysia from 'elysia';
import { db, schema } from '../db/index.ts';
import { logger } from '../utils/logger.ts';

const { auditLog } = schema;

const SENSITIVE_PATHS = [
  '/auth/',
  '/subscriptions/',
  '/admin/',
  '/tracking/',
  '/gamification/',
];

export const auditMiddleware = new Elysia({ name: 'audit-middleware' })
  // biome-ignore lint/suspicious/noExplicitAny: onAfterResponse context carries dynamic .derive() props
  .onAfterResponse({ as: 'global' }, async ({ request, set, ...ctx }: any) => {
    const user = (ctx as Record<string, unknown>).user as
      | { id?: string }
      | null
      | undefined;
    const url = new URL(request.url);
    const isSensitive = SENSITIVE_PATHS.some((p) => url.pathname.includes(p));
    if (!isSensitive) return;

    try {
      await db.insert(auditLog).values({
        userId: user?.id ?? undefined,
        action: `${request.method}:${url.pathname}`,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: request.headers.get('user-agent') ?? undefined,
        // `set.status` holds the HTTP response status code in Elysia
        details: { status: (set as { status?: number })?.status ?? 200 },
      });
    } catch (err) {
      logger.error({ err }, 'Failed to write audit log');
    }
  });
