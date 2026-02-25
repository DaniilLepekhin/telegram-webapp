import Elysia, { t } from 'elysia';
import { questsService, QUEST_DEFINITIONS } from './service.ts';
import { requireAuth, requireRole } from '../../middlewares/auth.ts';
import { rateLimit } from '../../middlewares/rateLimit.ts';

type AuthCtx = { user: { id: string } | null; set: { status: number } };
type ProgressBody = { questId: string; stepId: string; value: number };

// Rate-limited progress update endpoint
const progressRoute = new Elysia()
  .use(requireAuth)
  .use(rateLimit({
    max: 30,
    windowMs: 60_000,
    keyPrefix: 'quest-progress',
    keyBy: ({ user }: { user?: { id: string } }) => user?.id ?? 'anon',
  }))
  .post(
    '/progress',
    async ({ body, user, set }: AuthCtx & { body: ProgressBody }) => {
      if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
      const result = await questsService.updateProgress(user.id, body.questId, body.stepId, body.value);
      if (!result.quest) {
        set.status = 404;
        return { success: false, error: { code: 'QUEST_NOT_FOUND', message: 'Квест не найден' } };
      }
      return {
        success: true,
        data: {
          completed: result.completed,
          questTitle: result.quest.title,
          xpReward: result.completed ? result.quest.xpReward : 0,
          energyReward: result.completed ? result.quest.energyReward : 0,
        },
      };
    },
    {
      body: t.Object({
        questId: t.String({ minLength: 1 }),
        stepId: t.String({ minLength: 1 }),
        value: t.Number({ minimum: 0 }),
      }),
    },
  );

type ResetBody = { period: 'daily' | 'weekly' };


export const questsModule = new Elysia({ prefix: '/quests' })
  // ─── Public: list all quest definitions ──────────────────────────────────
  .get('/definitions', () => ({
    success: true,
    data: QUEST_DEFINITIONS,
  }))

  // ─── Auth-required routes ─────────────────────────────────────────────────
  .use(requireAuth)

  // My quests with progress
  .get('/mine', async ({ user, set }: AuthCtx) => {
    if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
    const data = await questsService.getUserQuests(user.id);
    return { success: true, data };
  })

  // Reset periodic quests (daily/weekly — admin-only via requireRole middleware)
  .use(requireRole('admin'))
  .post(
    '/reset',
    async ({ body, user, set }: AuthCtx & { body: ResetBody }) => {
      if (!user) { set.status = 401; return { success: false, error: { code: 'UNAUTHORIZED' } }; }
      await questsService.resetPeriodicQuests(user.id, body.period);
      return { success: true, data: { message: `Квесты ${body.period} сброшены` } };
    },
    {
      body: t.Object({ period: t.Union([t.Literal('daily'), t.Literal('weekly')]) }),
    },
  )

  // Rate-limited progress sub-route
  .use(progressRoute);
