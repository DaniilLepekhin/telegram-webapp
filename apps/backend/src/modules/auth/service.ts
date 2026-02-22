import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, schema } from '../../db/index.ts';
import { getRedis, cacheKey } from '../../utils/redis.ts';
import { config } from '../../config/index.ts';
import { logger } from '../../utils/logger.ts';
import type { TelegramUser, User, AuthTokens } from '@showcase/shared';

const { users, sessions } = schema;

export const authService = {
  async findOrCreateUser(tgUser: TelegramUser): Promise<User> {
    const redis = getRedis();
    const ckey = cacheKey.userByTgId(tgUser.id);

    // Check cache
    const cached = await redis.get(ckey);
    if (cached) return JSON.parse(cached) as User;

    // Upsert user
    const [user] = await db
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

    // Cache for 5 minutes
    await redis.setex(ckey, 300, JSON.stringify(user));
    logger.debug({ userId: user.id, telegramId: tgUser.id }, 'User upserted');

    return user as unknown as User;
  },

  async createTokens(
    userId: string,
    telegramId: number,
    role: string,
    deviceInfo?: { ua?: string; ip?: string },
  ): Promise<AuthTokens> {
    const refreshToken = nanoid(64);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30d

    await db.insert(sessions).values({
      userId,
      refreshToken,
      deviceInfo,
      expiresAt,
    });

    // Store refresh token in Redis for fast lookup
    const redis = getRedis();
    await redis.setex(
      cacheKey.session(refreshToken),
      30 * 24 * 60 * 60,
      JSON.stringify({ userId, telegramId, role }),
    );

    // Access token is created by the JWT plugin in the route handler
    return {
      accessToken: '', // filled by route handler
      refreshToken,
      expiresIn: 15 * 60, // 15 min
    };
  },

  async refreshSession(refreshToken: string): Promise<{ userId: string; telegramId: number; role: string } | null> {
    const redis = getRedis();
    const cached = await redis.get(cacheKey.session(refreshToken));
    if (cached) return JSON.parse(cached);

    // DB fallback
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshToken, refreshToken))
      .limit(1);

    if (!session || session.expiresAt < new Date()) return null;

    const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (!user) return null;

    return { userId: user.id, telegramId: user.telegramId, role: user.role };
  },

  async revokeSession(refreshToken: string): Promise<void> {
    const redis = getRedis();
    await redis.del(cacheKey.session(refreshToken));
    await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));
  },

  async invalidateUserCache(userId: string, telegramId: number): Promise<void> {
    const redis = getRedis();
    await redis.del(cacheKey.user(userId));
    await redis.del(cacheKey.userByTgId(telegramId));
  },
};
