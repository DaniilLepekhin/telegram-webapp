import type { ScenarioId } from '@showcase/shared';
import { and, eq, sql } from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { db, schema } from '../../db/index.ts';
import { requireAuth } from '../../middlewares/auth.ts';
import { cacheKey, getRedis } from '../../utils/redis.ts';
import { gamificationService } from '../gamification/service.ts';
import { DEMO_SCENARIOS } from './scenarios.ts';

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
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Сценарий не найден' },
      };
    }
    return { success: true, data: scenario };
  })

  // Live global metrics (aggregated, public)
  .get('/metrics', async () => {
    const redis = getRedis();
    const cached = await redis.get(cacheKey.liveMetrics());

    if (cached) return { success: true, data: JSON.parse(cached) };

    const [
      [{ count: totalUsers }],
      [{ count: totalLinks }],
      [{ totalClicks }],
      [{ count: totalScenarioRuns }],
      [{ count: completedScenarios }],
    ] = await Promise.all([
      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.users),
      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.trackingLinks),
      db
        .select({
          totalClicks: sql<number>`cast(coalesce(sum(${schema.trackingLinks.clickCount}), 0) as int)`,
        })
        .from(schema.trackingLinks),
      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.scenarioRuns),
      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(schema.scenarioRuns)
        .where(eq(schema.scenarioRuns.isCompleted, true)),
    ]);

    const metrics = {
      totalUsers,
      totalLinks,
      totalClicks,
      totalScenarioRuns,
      completedScenarios,
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
  .post('/scenarios/:id/run', (async (ctx: any) => {
    const { params, user, set } = ctx as {
      params: { id: string };
      user: { id: string };
      set: { status: number };
    };
    const scenario = DEMO_SCENARIOS.find(
      (s) => s.id === (params.id as ScenarioId),
    );
    if (!scenario) {
      set.status = 404;
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Сценарий не найден' },
      };
    }

    const userId = user.id;

    // Dedup: if this user already has an incomplete run for this scenario,
    // return the existing one instead of creating a new one and awarding +25 XP again.
    const [existingRun] = await db
      .select()
      .from(scenarioRuns)
      .where(
        and(
          eq(scenarioRuns.userId, userId),
          eq(scenarioRuns.scenarioId, params.id as ScenarioId),
          eq(scenarioRuns.isCompleted, false),
        ),
      )
      .limit(1);

    if (existingRun) {
      return { success: true, data: { runId: existingRun.id, scenario } };
    }

    const [run] = await db
      .insert(scenarioRuns)
      .values({
        userId,
        scenarioId: params.id as ScenarioId,
        totalSteps: scenario.steps.length,
      })
      .returning();

    // Track analytics event
    await db.insert(analyticsEvents).values({
      userId,
      type: 'scenario_start',
      payload: { scenarioId: params.id, scenarioTitle: scenario.title },
    });

    // Award XP for starting a scenario
    await gamificationService.awardXp(
      userId,
      25,
      `Запуск сценария: ${scenario.title}`,
      'scenario_start',
    );

    return { success: true, data: { runId: run.id, scenario } };
  }) as any)
  .post(
    '/scenarios/:id/complete',
    (async (ctx: any) => {
      const { params, body, user, set } = ctx as {
        params: { id: string };
        body: { runId: string; timeMs: number };
        user: { id: string };
        set: { status: number };
      };
      const userId = user.id;

      const scenario = DEMO_SCENARIOS.find((s) => s.id === params.id);
      if (!scenario) {
        set.status = 404;
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Сценарий не найден' },
        };
      }

      const [run] = await db
        .update(scenarioRuns)
        .set({
          isCompleted: true,
          completedSteps: scenario.steps.length,
          timeToComplete: body.timeMs,
          completedAt: new Date(),
        })
        // ownership check + idempotency guard: only update runs that belong to this
        // user AND are not already completed — prevents unlimited XP farming by
        // calling /complete multiple times on the same runId.
        .where(
          and(
            eq(scenarioRuns.id, body.runId),
            eq(scenarioRuns.userId, userId),
            eq(scenarioRuns.isCompleted, false),
          ),
        )
        .returning();

      if (!run) {
        set.status = 404;
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Сессия не найдена' },
        };
      }

      // Award XP for completing
      const result = await gamificationService.awardXp(
        userId,
        150,
        `Сценарий завершён: ${scenario?.title}`,
        'scenario_complete',
      );

      await db.insert(analyticsEvents).values({
        userId,
        type: 'scenario_complete',
        payload: { scenarioId: params.id, timeMs: body.timeMs },
      });

      return { success: true, data: { ...result, run } };
    }) as any,
    {
      body: t.Object({
        runId: t.String(),
        timeMs: t.Number({ minimum: 0 }),
      }),
    },
  );
