import Elysia, { t } from 'elysia';
import { gamificationService, ACHIEVEMENTS } from './service.ts';
import { requireAuth } from '../../middlewares/auth.ts';

export const gamificationModule = new Elysia({ prefix: '/gamification' })
  .use(requireAuth)
  .get('/stats', async ({ user, set }: any) => {
    const stats = await gamificationService.getStats((user as { id: string }).id);
    if (!stats) { set.status = 404; return { success: false, error: { code: 'NOT_FOUND', message: 'Пользователь не найден' } }; }
    return { success: true, data: stats };
  })
  .get('/achievements', () => {
    return { success: true, data: ACHIEVEMENTS };
  })
  .post(
    '/award-xp',
    async ({ body, user }: any) => {
      const result = await gamificationService.awardXp(
        (user as { id: string }).id,
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
  )
  .post('/streak', async ({ user }: any) => {
    const result = await gamificationService.updateStreak((user as { id: string }).id);
    return { success: true, data: result };
  });
