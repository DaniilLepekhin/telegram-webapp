import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, schema } from '../utils/db.ts';
import { getRedis } from '../utils/redis.ts';
import type { User as GrammyUser } from 'grammy/types';

const { users, referrals, xpHistory } = schema;

export const userService = {
  async upsert(tgUser: GrammyUser, startParam?: string): Promise<typeof users.$inferSelect> {
    const redis = getRedis();
    const cacheKey = `bot:user:${tgUser.id}`;

    // Cache check
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Resolve referrer
    let referredById: string | undefined;
    if (startParam?.startsWith('ref_')) {
      const refCode = startParam.replace('ref_', '');
      const [referrer] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, refCode))
        .limit(1);
      if (referrer) referredById = referrer.id;
    }

    const [user] = await db
      .insert(users)
      .values({
        telegramId: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        languageCode: tgUser.language_code ?? 'ru',
        isPremium: (tgUser as { is_premium?: boolean }).is_premium ?? false,
        referralCode: nanoid(10),
        referredById,
      })
      .onConflictDoUpdate({
        target: users.telegramId,
        set: {
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          isPremium: (tgUser as { is_premium?: boolean }).is_premium ?? false,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    // Process referral reward (first time only)
    if (referredById && user.referredById) {
      const existingReferral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referredId, user.id))
        .limit(1);

      if (existingReferral.length === 0) {
        await db.insert(referrals).values({
          referrerId: referredById,
          referredId: user.id,
          xpRewarded: 150,
          energyRewarded: 50,
          isRewarded: true,
        });

        // Award XP to referrer
        await db.insert(xpHistory).values({
          userId: referredById,
          amount: 150,
          reason: `Реферал: @${tgUser.username ?? tgUser.first_name}`,
          actionType: 'referral',
        });

        // Update referrer XP
        const sql = (await import('drizzle-orm')).sql;
        await db
          .update(users)
          .set({ xp: sql`${users.xp} + 150`, updatedAt: new Date() })
          .where(eq(users.id, referredById));
      }
    }

    await redis.setex(cacheKey, 300, JSON.stringify(user));
    return user;
  },

  getReferralLink(refCode: string, botUsername: string): string {
    return `https://t.me/${botUsername}?start=ref_${refCode}`;
  },

  async getReferralStats(userId: string): Promise<{ count: number; totalXp: number }> {
    const refs = await db
      .select({ xpRewarded: referrals.xpRewarded })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    return {
      count: refs.length,
      totalXp: refs.reduce((s, r) => s + (r.xpRewarded ?? 0), 0),
    };
  },
};
