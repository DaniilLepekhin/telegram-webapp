import Elysia from 'elysia';
import { jwtVerify } from 'jose';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.ts';
import { getRedis, cacheKey } from '../utils/redis.ts';
import { config } from '../config/index.ts';
import type { JWTPayload, UserRole } from '@showcase/shared';

const { users } = schema;

/** Verify a JWT token string using jose */
async function verifyJwt(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Auth middleware — validates JWT from Authorization header or cookie.
 * Uses jose directly to avoid Elysia plugin type inference limitations.
 */
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .derive({ as: 'scoped' }, async ({ headers, cookie: { accessToken } }: any) => {
    // Match only a leading "Bearer " prefix to prevent stripping it from mid-string values.
    const token = headers.authorization?.match(/^Bearer\s+(.+)$/)?.[1] ?? accessToken?.value;
    if (!token) return { user: null, isAuthenticated: false };

    const secret = config.JWT_SECRET;
    const payload = await verifyJwt(token as string, secret);
    if (!payload) return { user: null, isAuthenticated: false };

    // Try cache first
    const redis = getRedis();
    const cached = await redis.get(cacheKey.user(payload.sub as string));
    if (cached) {
      return { user: JSON.parse(cached), isAuthenticated: true };
    }

    // DB lookup
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub as string)).limit(1);
    if (!user) return { user: null, isAuthenticated: false };

    await redis.setex(cacheKey.user(user.id), 300, JSON.stringify(user));
    return { user, isAuthenticated: true };
  });

/**
 * Require authenticated user — returns 401 if not authenticated
 */
export const requireAuth = new Elysia({ name: 'require-auth' })
  .use(authMiddleware)
  .onBeforeHandle({ as: 'scoped' }, ({ isAuthenticated, set }: any) => {
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
    .onBeforeHandle({ as: 'scoped' }, ({ user, set }: any) => {
      if (!user || !roles.includes(user.role as UserRole)) {
        set.status = 403;
        return { success: false, error: { code: 'FORBIDDEN', message: 'Недостаточно прав' } };
      }
    });
}
