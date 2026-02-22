import Elysia from 'elysia';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.ts';
import { getRedis, cacheKey } from '../utils/redis.ts';
import type { JWTPayload, UserRole } from '@showcase/shared';

const { users } = schema;

/**
 * Auth middleware — validates JWT from Authorization header or cookie
 */
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .derive({ as: 'scoped' }, async ({ jwt, headers, cookie: { accessToken }, set }) => {
    const token = headers.authorization?.replace('Bearer ', '') ?? accessToken?.value;
    if (!token) return { user: null, isAuthenticated: false };

    const payload = await jwt.verify(token) as JWTPayload | false;
    if (!payload) return { user: null, isAuthenticated: false };

    // Try cache first
    const redis = getRedis();
    const cached = await redis.get(cacheKey.user(payload.sub));
    if (cached) {
      return { user: JSON.parse(cached), isAuthenticated: true };
    }

    // DB lookup
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user) return { user: null, isAuthenticated: false };

    await redis.setex(cacheKey.user(user.id), 300, JSON.stringify(user));
    return { user, isAuthenticated: true };
  });

/**
 * Require authenticated user — returns 401 if not authenticated
 */
export const requireAuth = new Elysia({ name: 'require-auth' })
  .use(authMiddleware)
  .onBeforeHandle({ as: 'scoped' }, ({ isAuthenticated, set }) => {
    if (!isAuthenticated) {
      set.status = 401;
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } };
    }
  });

/**
 * Require specific role
 */
export function requireRole(...roles: UserRole[]) {
  return new Elysia({ name: `require-role-${roles.join('-')}` })
    .use(requireAuth)
    .onBeforeHandle({ as: 'scoped' }, ({ user, set }) => {
      if (!user || !roles.includes(user.role as UserRole)) {
        set.status = 403;
        return { success: false, error: { code: 'FORBIDDEN', message: 'Недостаточно прав' } };
      }
    });
}
