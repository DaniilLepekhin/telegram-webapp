import { createHash } from 'node:crypto';
import type { AuthTokens, TelegramUser, User } from '@showcase/shared';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, schema } from '../../db/index.ts';
import { logger } from '../../utils/logger.ts';
import { cacheKey, getRedis } from '../../utils/redis.ts';

/**
 * Hash a refresh token with SHA-256 before persisting to DB/Redis.
 * The plaintext token is only ever transmitted to the client via HttpOnly cookie;
 * what's stored server-side is the hash, so a DB/Redis leak can't be used to
 * impersonate sessions.
 */
function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const { users, sessions } = schema;

export const authService = {
  async findOrCreateUser(
    tgUser: TelegramUser,
  ): Promise<{ user: User; isNew: boolean }> {
    const redis = getRedis();
    const ckey = cacheKey.userByTgId(tgUser.id);

    // Always upsert first so the returned row is authoritative.
    // Checking the cache before the upsert would return stale profile data
    // (changed name, username, isPremium, etc.) for the entire cache TTL.
    //
    // We use the Postgres system column `xmax` to detect whether the row was
    // INSERTed or UPDATEd: xmax = 0 means no previous transaction updated this
    // row, i.e. it was just inserted for the first time.
    const [row] = await db
      .insert(users)
      .values({
        telegramId: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        photoUrl: tgUser.photo_url,
        languageCode: tgUser.language_code ?? 'ru',
        isPremium: tgUser.is_premium ?? false,
        referralCode: nanoid(10),
      })
      .onConflictDoUpdate({
        target: users.telegramId,
        set: {
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          photoUrl: tgUser.photo_url,
          isPremium: tgUser.is_premium ?? false,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    // Detect a fresh INSERT vs. an UPDATE by comparing createdAt and updatedAt.
    // On INSERT both columns are set to the same timestamp by the DB default.
    // On conflict-do-update, updatedAt is explicitly set to new Date(), so it will
    // differ from createdAt (by at least a millisecond in practice).
    // This is more portable than the xmax system column trick (which Drizzle may not expose).
    const createdMs =
      row.createdAt instanceof Date
        ? row.createdAt.getTime()
        : new Date(row.createdAt as string).getTime();
    const updatedMs =
      row.updatedAt instanceof Date
        ? row.updatedAt.getTime()
        : new Date(row.updatedAt as string).getTime();
    const isNew = Math.abs(createdMs - updatedMs) < 1000; // within 1 second → INSERT

    // Refresh cache with the latest data from the DB row.
    // Also invalidate the by-UUID key so authMiddleware doesn't serve stale data.
    await Promise.all([
      redis.setex(ckey, 300, JSON.stringify(row)),
      redis.del(cacheKey.user(row.id)),
    ]);
    logger.debug(
      { userId: row.id, telegramId: tgUser.id, isNew },
      'User upserted',
    );

    return { user: row as unknown as User, isNew };
  },

  async createTokens(
    userId: string,
    telegramId: number,
    role: string,
    deviceInfo?: { ua?: string; ip?: string },
  ): Promise<AuthTokens> {
    const refreshToken = nanoid(64);
    const tokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30d

    // Store the HASH in the DB — not the plaintext token
    await db.insert(sessions).values({
      userId,
      refreshToken: tokenHash,
      deviceInfo,
      expiresAt,
    });

    // Store hash in Redis for fast lookup
    const redis = getRedis();
    await redis.setex(
      cacheKey.session(tokenHash),
      30 * 24 * 60 * 60,
      JSON.stringify({ userId, telegramId, role }),
    );

    // Access token is created by the JWT plugin in the route handler
    return {
      accessToken: '', // filled by route handler
      refreshToken, // plaintext sent to client via HttpOnly cookie only
      expiresIn: 15 * 60, // 15 min
    };
  },

  async refreshSession(
    refreshToken: string,
  ): Promise<{ userId: string; telegramId: number; role: string } | null> {
    const tokenHash = hashRefreshToken(refreshToken);
    const redis = getRedis();
    const cached = await redis.get(cacheKey.session(tokenHash));
    if (cached) return JSON.parse(cached);

    // DB fallback — compare against stored hash
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshToken, tokenHash))
      .limit(1);

    if (!session || session.expiresAt < new Date()) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);
    if (!user) return null;

    return { userId: user.id, telegramId: user.telegramId, role: user.role };
  },

  async revokeSession(refreshToken: string): Promise<void> {
    const tokenHash = hashRefreshToken(refreshToken);
    const redis = getRedis();
    await redis.del(cacheKey.session(tokenHash));
    await db.delete(sessions).where(eq(sessions.refreshToken, tokenHash));
  },

  async invalidateUserCache(userId: string, telegramId: number): Promise<void> {
    const redis = getRedis();
    await redis.del(cacheKey.user(userId));
    await redis.del(cacheKey.userByTgId(telegramId));
  },
};
