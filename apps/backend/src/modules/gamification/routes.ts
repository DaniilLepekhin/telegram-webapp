import Elysia, { t } from 'elysia';
import { gamificationService, ACHIEVEMENTS } from './service.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { rateLimit } from '../../middlewares/rateLimit.ts';

type AuthCtx = { user: { id: string } | null; set: { status: number } };
type AwardBody = { amount: number; reason: string; actionType: string };

// ─── Rate-limited sub-app: only /award-xp (10 req/min per user) ──────────────
// IMPORTANT: scoped to sub-instance so /stats and /streak are NOT affected.
const awardXpRoute = new Elysia()
  .use(requireAuth)
  .use(rateLimit({
    max: 10,
    windowMs: 60_000,
    keyPrefix: 'award-xp',
    keyBy: ({ user }) => user?.id ?? 'anon',
  }))
  .post(
    '/award-xp',
    async ({ body, user, set }: AuthCtx & { body: AwardBody }) => {
      if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
      const result = await gamificationService.awardXp(
        user.id,
        body.amount,
        body.reason,
        body.actionType,
      );
      return { success: true, data: result };
    },
    {
      body: t.Object({
        amount: t.Number({ minimum: 1, maximum: 1000 }),
        reason: t.String({ minLength: 3 }),
        actionType: t.String(),
      }),
    },
  );

export const gamificationModule = new Elysia({ prefix: '/gamification' })
  // Public — no auth needed
  .get('/achievements', () => {
    return { success: true, data: ACHIEVEMENTS };
  })
  // Auth-required routes (no rate limit on stats/streak — they must be freely callable)
  .use(requireAuth)
  .get('/stats', async ({ user, set }: AuthCtx) => {
    if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
    const stats = await gamificationService.getStats(user.id);
    if (!stats) {
      set.status = 404;
      return { success: false, error: { code: 'NOT_FOUND', message: 'Пользователь не найден' } };
    }
    return { success: true, data: stats };
  })
  .post('/streak', async ({ user, set }: AuthCtx) => {
    if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
    const result = await gamificationService.updateStreak(user.id);
    return { success: true, data: result };
  })
  // Rate-limited award-xp as separate sub-instance
  .use(awardXpRoute);
