import Elysia from 'elysia';
import { eq, desc } from 'drizzle-orm';
import { db, schema } from '../../db/index.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { getLevelFromXp, getXpToNextLevel, LEVEL_NAMES } from '@showcase/shared';
import { config } from '../../config/index.ts';

const { users, referrals, xpHistory } = schema;

type AuthCtx = { user: { id: string } | null; set: { status: number } };

export const usersModule = new Elysia({ prefix: '/users' })
  .use(requireAuth)

  // ─── My profile ───────────────────────────────────────────────────────────
  .get('/me', async ({ user, set }: AuthCtx) => {
    if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
    const userId = user.id;
    const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!u) { set.status = 404; return { success: false, error: { code: 'NOT_FOUND', message: 'Пользователь не найден' } }; }

    const level = getLevelFromXp(u.xp);
    const xpToNext = getXpToNextLevel(u.xp);

    return {
      success: true,
      data: {
        id: u.id,
        telegramId: u.telegramId,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        photoUrl: u.photoUrl,
        isPremium: u.isPremium,
        role: u.role,
        xp: u.xp,
        level,
        levelName: LEVEL_NAMES[level],
        xpToNextLevel: xpToNext,
        streak: u.streak,
        longestStreak: u.longestStreak,
        energyBalance: u.energyBalance,
        referralCode: u.referralCode,
        createdAt: u.createdAt,
      },
    };
  })

  // ─── Leaderboard ──────────────────────────────────────────────────────────
  .get('/leaderboard', async ({ query }: { query: { limit?: string } }) => {
    const limit = Math.min(Number.parseInt(query.limit ?? '20', 10), 50);
    const top = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        username: users.username,
        photoUrl: users.photoUrl,
        xp: users.xp,
        level: users.level,
        streak: users.streak,
        isPremium: users.isPremium,
      })
      .from(users)
      .orderBy(desc(users.xp))
      .limit(limit);

    return {
      success: true,
      data: top.map((u, i) => ({
        rank: i + 1,
        ...u,
        levelName: LEVEL_NAMES[getLevelFromXp(u.xp)],
      })),
    };
  })

  // ─── My referral info ─────────────────────────────────────────────────────
  .get('/referrals', async ({ user, set }: AuthCtx) => {
    if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
    const userId = user.id;
    const [u] = await db.select({ referralCode: users.referralCode }).from(users).where(eq(users.id, userId)).limit(1);

    const refs = await db
      .select({
        id: referrals.id,
        referredId: referrals.referredId,
        level: referrals.level,
        xpRewarded: referrals.xpRewarded,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));

    const referralLink = `https://t.me/${config.BOT_USERNAME}?start=ref_${u?.referralCode}`;

    return {
      success: true,
      data: {
        referralCode: u?.referralCode,
        referralLink,
        totalReferrals: refs.length,
        totalXpEarned: refs.reduce((s, r) => s + (r.xpRewarded ?? 0), 0),
        referrals: refs,
      },
    };
  })

  // ─── Activity feed ────────────────────────────────────────────────────────
  .get('/activity', async ({ user, set }: AuthCtx) => {
    if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
    const userId = user.id;
    const events = await db
      .select()
      .from(xpHistory)
      .where(eq(xpHistory.userId, userId))
      .orderBy(desc(xpHistory.createdAt))
      .limit(30);

    return { success: true, data: events };
  });
