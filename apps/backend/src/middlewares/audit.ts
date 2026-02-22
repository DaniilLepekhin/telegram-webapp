import Elysia from 'elysia';
import { db, schema } from '../db/index.ts';
import { logger } from '../utils/logger.ts';

const { auditLog } = schema;

const SENSITIVE_PATHS = ['/auth/', '/subscriptions/', '/admin/'];

export const auditMiddleware = new Elysia({ name: 'audit-middleware' })
  .onAfterResponse({ as: 'global' }, async ({ request, user, response }) => {
    const url = new URL(request.url);
    const isSensitive = SENSITIVE_PATHS.some((p) => url.pathname.includes(p));
    if (!isSensitive) return;

    try {
      await db.insert(auditLog).values({
        userId: (user as { id?: string })?.id,
        action: `${request.method}:${url.pathname}`,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: request.headers.get('user-agent') ?? undefined,
        details: { status: (response as Response)?.status },
      });
    } catch (err) {
      logger.error({ err }, 'Failed to write audit log');
    }
  });
