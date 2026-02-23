import Elysia, { t } from 'elysia';
import { eq } from 'drizzle-orm';
import { DEMO_SCENARIOS } from './scenarios.ts';
import { db, schema } from '../../db/index.ts';
import { gamificationService } from '../gamification/service.ts';
import { getRedis, cacheKey } from '../../utils/redis.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import type { ScenarioId } from '@showcase/shared';

const { scenarioRuns, analyticsEvents } = schema;

export const showcaseModule = new Elysia({ prefix: '/showcase' })
  // ─── Public routes ────────────────────────────────────────────────────────
  .get('/scenarios', () => {
    return { success: true, data: DEMO_SCENARIOS };
  })
  .get('/scenarios/:id', ({ params, set }) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === params.id);
    if (!scenario) {
      set.status = 404;
      return { success: false, error: { code: 'NOT_FOUND', message: 'Сценарий не найден' } };
    }
    return { success: true, data: scenario };
  })

  // Live global metrics (aggregated, public)
  .get('/metrics', async () => {
    const redis = getRedis();
    const cached = await redis.get(cacheKey.liveMetrics());

    if (cached) return { success: true, data: JSON.parse(cached) };

    const metrics = {
      totalUsers: await db.$count(schema.users),
      totalLinks: await db.$count(schema.trackingLinks),
      totalClicks: (await db.select({ sum: schema.trackingLinks.clickCount }).from(schema.trackingLinks))[0]?.sum ?? 0,
      totalScenarioRuns: await db.$count(schema.scenarioRuns),
      completedScenarios: await db.$count(schema.scenarioRuns, eq(schema.scenarioRuns.isCompleted, true)),
      scenariosByType: DEMO_SCENARIOS.map((s) => ({
        id: s.id,
        title: s.title,
        icon: s.icon,
      })),
      updatedAt: new Date().toISOString(),
    };

    await redis.setex(cacheKey.liveMetrics(), 30, JSON.stringify(metrics));
    return { success: true, data: metrics };
  })

  // ─── Auth required ────────────────────────────────────────────────────────
  .use(requireAuth)
  .post(
    '/scenarios/:id/run',
    async ({ params, user, set }: any) => {
      const scenario = DEMO_SCENARIOS.find((s) => s.id === params.id as ScenarioId);
      if (!scenario) {
        set.status = 404;
        return { success: false, error: { code: 'NOT_FOUND', message: 'Сценарий не найден' } };
      }

      const userId = (user as { id: string }).id;

      const [run] = await db.insert(scenarioRuns).values({
        userId,
        scenarioId: params.id as ScenarioId,
        totalSteps: scenario.steps.length,
      }).returning();

      // Track analytics event
      await db.insert(analyticsEvents).values({
        userId,
        type: 'scenario_start',
        payload: { scenarioId: params.id, scenarioTitle: scenario.title },
      });

      // Award XP for starting a scenario
      await gamificationService.awardXp(userId, 25, `Запуск сценария: ${scenario.title}`, 'scenario_start');

      return { success: true, data: { runId: run.id, scenario } };
    },
  )
  .post(
    '/scenarios/:id/complete',
    async ({ params, body, user, set }: any) => {
      const userId = (user as { id: string }).id;

      const [run] = await db
        .update(scenarioRuns)
        .set({
          isCompleted: true,
          completedSteps: DEMO_SCENARIOS.find((s) => s.id === params.id)?.steps.length ?? 0,
          timeToComplete: body.timeMs,
          completedAt: new Date(),
        })
        .where(eq(scenarioRuns.id, body.runId))
        .returning();

      if (!run) {
        set.status = 404;
        return { success: false, error: { code: 'NOT_FOUND', message: 'Сессия не найдена' } };
      }

      // Award XP for completing
      const scenario = DEMO_SCENARIOS.find((s) => s.id === params.id);
      const result = await gamificationService.awardXp(
        userId, 150, `Сценарий завершён: ${scenario?.title}`, 'scenario_complete'
      );

      await db.insert(analyticsEvents).values({
        userId,
        type: 'scenario_complete',
        payload: { scenarioId: params.id, timeMs: body.timeMs },
      });

      return { success: true, data: { ...result, run } };
    },
    {
      body: t.Object({
        runId: t.String(),
        timeMs: t.Number({ minimum: 0 }),
      }),
    },
  );
