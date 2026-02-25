import { desc, eq, sql } from 'drizzle-orm';
import Elysia from 'elysia';
import { config } from '../../config/index.ts';
import { db, schema } from '../../db/index.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { logger } from '../../utils/logger.ts';
import { gamificationService } from '../gamification/service.ts';

const { users, referrals } = schema;

// ─── Reward tiers per referral level ─────────────────────────────────────────
// Level 1: direct referral, Level 2: referral of referral, etc.
const LEVEL_REWARDS: Record<number, { xp: number; energy: number }> = {
  1: { xp: 150, energy: 50 },
  2: { xp: 75, energy: 25 },
  3: { xp: 30, energy: 10 },
  4: { xp: 15, energy: 5 },
  5: { xp: 5, energy: 2 },
};

/**
 * Walk up the referral chain (up to MAX_LEVELS deep) and award XP + energy
 * to each ancestor. Called when a new user is registered via a referral link.
 */
export async function processReferralChain(
  newUserId: string,
  directReferrerId: string,
  newUserName: string,
): Promise<void> {
  const MAX_LEVELS = 5;
  let currentId: string | null = directReferrerId;
  let level = 1;
  // Cycle detection: track all visited ancestor IDs to prevent infinite loops
  // if referral relationships somehow form a cycle in the DB.
  const visited = new Set<string>([newUserId]);

  while (currentId && level <= MAX_LEVELS) {
    // Cycle guard: stop if we've already processed this ancestor
    if (visited.has(currentId)) {
      logger.warn(
        { newUserId, currentId, level },
        'Referral cycle detected — aborting chain',
      );
      break;
    }
    visited.add(currentId);

    const reward = LEVEL_REWARDS[level];
    if (!reward) break;

    // Insert referral record atomically. Use .returning() to detect whether the
    // row was actually inserted or skipped by onConflictDoNothing — this prevents
    // awarding rewards when the record already existed (double-reward bug).
    let inserted: { id: string }[] = [];
    try {
      inserted = await db
        .insert(referrals)
        .values({
          referrerId: currentId,
          referredId: newUserId,
          level,
          xpRewarded: reward.xp,
          energyRewarded: reward.energy,
          isRewarded: true,
        })
        .onConflictDoNothing()
        .returning({ id: referrals.id });
    } catch {
      // referrals_referred_id_unique constraint: user can only be referred once overall
      break;
    }

    // Only award rewards if a new record was actually inserted
    if (inserted.length === 0) {
      logger.debug(
        { newUserId, referrerId: currentId, level },
        'Referral already processed — skipping reward',
      );
      break;
    }

    // Award XP to this ancestor
    await gamificationService.awardXp(
      currentId,
      reward.xp,
      level === 1
        ? `Реферал L1: @${newUserName}`
        : `Реферал L${level} (через цепочку)`,
      'referral',
    );

    // Award energy
    if (reward.energy > 0) {
      await db
        .update(users)
        .set({
          energyBalance: sql`${users.energyBalance} + ${reward.energy}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, currentId));
    }

    logger.info(
      { newUserId, referrerId: currentId, level },
      'Referral reward issued',
    );

    // Walk up one level: find who referred currentId
    const [ancestor] = await db
      .select({ referredById: users.referredById })
      .from(users)
      .where(eq(users.id, currentId))
      .limit(1);

    currentId = ancestor?.referredById ?? null;
    level++;
  }
}

// ─── API module ───────────────────────────────────────────────────────────────
export const referralsModule = new Elysia({ prefix: '/referrals' })
  .use(requireAuth)

  // My referral dashboard
  .get('/me', (async (ctx: any) => {
    const { user, set } = ctx as {
      user: { id: string } | null;
      set: { status: number };
    };
    if (!user) {
      set.status = 401;
      return { success: false, error: { code: 'UNAUTHORIZED' } };
    }
    const userId = user.id;

    const [u] = await db
      .select({ referralCode: users.referralCode })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const refs = await db
      .select({
        id: referrals.id,
        referredId: referrals.referredId,
        level: referrals.level,
        xpRewarded: referrals.xpRewarded,
        energyRewarded: referrals.energyRewarded,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, user.id))
      .orderBy(desc(referrals.createdAt));

    const referralLink = `https://t.me/${config.BOT_USERNAME}?start=ref_${u?.referralCode}`;

    // Group by level
    const byLevel = refs.reduce<Record<number, typeof refs>>((acc, r) => {
      const lvl = r.level ?? 1;
      acc[lvl] = acc[lvl] ?? [];
      acc[lvl].push(r);
      return acc;
    }, {});

    return {
      success: true,
      data: {
        referralCode: u?.referralCode,
        referralLink,
        totalReferrals: refs.filter((r) => r.level === 1).length,
        totalChainReferrals: refs.length,
        totalXpEarned: refs.reduce((s, r) => s + (r.xpRewarded ?? 0), 0),
        totalEnergyEarned: refs.reduce(
          (s, r) => s + (r.energyRewarded ?? 0),
          0,
        ),
        byLevel,
        recentReferrals: refs.slice(0, 10),
      },
    };
  }) as any)

  // Top referrers leaderboard — single JOIN query (no N+1)
  .get('/leaderboard', async () => {
    const top = await db
      .select({
        referrerId: referrals.referrerId,
        count: sql<number>`cast(count(*) as int)`,
        totalXp: sql<number>`cast(sum(${referrals.xpRewarded}) as int)`,
        firstName: users.firstName,
        username: users.username,
        photoUrl: users.photoUrl,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referrerId, users.id))
      .groupBy(
        referrals.referrerId,
        users.firstName,
        users.username,
        users.photoUrl,
      )
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    return {
      success: true,
      data: top.map((r) => ({
        referrerId: r.referrerId,
        count: r.count,
        totalXp: r.totalXp,
        user: {
          firstName: r.firstName,
          username: r.username,
          photoUrl: r.photoUrl,
        },
      })),
    };
  });
