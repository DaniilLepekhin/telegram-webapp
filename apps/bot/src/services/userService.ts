import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, schema } from '../utils/db.ts';
import { getRedis } from '../utils/redis.ts';
import type { User as GrammyUser } from 'grammy/types';

const { users, referrals, xpHistory } = schema;

// ─── Reward tiers per referral level ─────────────────────────────────────────
const LEVEL_REWARDS: Record<number, { xp: number; energy: number }> = {
  1: { xp: 150, energy: 50 },
  2: { xp: 75, energy: 25 },
  3: { xp: 30, energy: 10 },
  4: { xp: 15, energy: 5 },
  5: { xp: 5, energy: 2 },
};

/**
 * Walk up the referral chain (up to 5 levels) and reward each ancestor.
 * Level 1 = direct referrer, Level 2 = referrer's referrer, etc.
 *
 * Cycle detection prevents an infinite loop if the referredById chain
 * somehow forms a cycle in the DB (e.g. from a bad data migration).
 */
async function processReferralChain(newUserId: string, directReferrerId: string, newUserName: string): Promise<void> {
  const MAX_LEVELS = 5;
  let currentId: string | null = directReferrerId;
  let level = 1;
  // Include the new user so we detect if they somehow appear in their own chain
  const visited = new Set<string>([newUserId]);

  while (currentId && level <= MAX_LEVELS) {
    if (visited.has(currentId)) {
      console.warn(`[Referral] cycle detected at ${currentId} for newUser ${newUserId} — aborting chain`);
      break;
    }
    visited.add(currentId);

    const reward = LEVEL_REWARDS[level];
    if (!reward) break;

    let inserted: { id: string }[] = [];
    try {
      inserted = await db.insert(referrals).values({
        referrerId: currentId,
        referredId: newUserId,
        level,
        xpRewarded: reward.xp,
        energyRewarded: reward.energy,
        isRewarded: true,
      }).onConflictDoNothing().returning({ id: referrals.id });
    } catch {
      break; // unique constraint on referredId — already processed
    }

    // Only award XP if the referral row was actually inserted.
    // Without this check two concurrent /start requests both walk the chain
    // and both award XP, because onConflictDoNothing does not abort the loop.
    if (inserted.length === 0) break;

    // Award XP
    await db.insert(xpHistory).values({
      userId: currentId,
      amount: reward.xp,
      reason: level === 1
        ? `Реферал L1: @${newUserName}`
        : `Реферал L${level} (через цепочку)`,
      actionType: 'referral',
    });
    await db
      .update(users)
      .set({ xp: sql`${users.xp} + ${reward.xp}`, updatedAt: new Date() })
      .where(eq(users.id, currentId));

    // Award energy
    if (reward.energy > 0) {
      await db
        .update(users)
        .set({ energyBalance: sql`${users.energyBalance} + ${reward.energy}`, updatedAt: new Date() })
        .where(eq(users.id, currentId));
    }

    // Walk up one level
    const [ancestor] = await db
      .select({ referredById: users.referredById })
      .from(users)
      .where(eq(users.id, currentId))
      .limit(1);

    currentId = ancestor?.referredById ?? null;
    level++;
  }
}

export const userService = {
  async upsert(tgUser: GrammyUser, startParam?: string): Promise<typeof users.$inferSelect> {
    const redis = getRedis();
    const cacheKey = `bot:user:${tgUser.id}`;

    // Cache check — guard against corrupted Redis data
    const cached = await redis.get(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch { /* stale/corrupt — fall through to DB */ }
    }

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

    // Process multi-level referral chain (first time only — chain walk stops at unique constraint)
    if (referredById && user.referredById) {
      const newUserName = tgUser.username ?? tgUser.first_name;
      await processReferralChain(user.id, referredById, newUserName);
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
