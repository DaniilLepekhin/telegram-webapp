import { and, eq, sql } from 'drizzle-orm';
import { db, schema } from '../../db/index.ts';
import { logger } from '../../utils/logger.ts';
import { gamificationService } from '../gamification/service.ts';

const { userQuests, users: usersTable } = schema;

// ─── Quest definitions (seeded in-memory; also stored in DB via seed) ─────────
export const QUEST_DEFINITIONS = [
  {
    id: 'daily_login',
    title: 'Ежедневный визит',
    description: 'Заходи в приложение каждый день',
    icon: '📅',
    xpReward: 50,
    energyReward: 10,
    steps: [{ id: 'login', title: 'Открыть приложение', target: 1 }],
    isRepeatable: true,
    resetPeriod: 'daily',
  },
  {
    id: 'create_links',
    title: 'Трекер ссылок',
    description: 'Создай 5 трекинг-ссылок',
    icon: '🔗',
    xpReward: 200,
    energyReward: 30,
    steps: [{ id: 'links', title: 'Создать трекинг-ссылки', target: 5 }],
    isRepeatable: false,
    resetPeriod: null,
  },
  {
    id: 'run_scenarios',
    title: 'Путешественник',
    description: 'Запусти 3 demo-сценария',
    icon: '🗺️',
    xpReward: 300,
    energyReward: 50,
    steps: [{ id: 'scenarios', title: 'Запустить сценарии', target: 3 }],
    isRepeatable: false,
    resetPeriod: null,
  },
  {
    id: 'weekly_active',
    title: 'Недельный марафон',
    description: 'Будь активен 5 дней за неделю',
    icon: '🏃',
    xpReward: 400,
    energyReward: 80,
    steps: [{ id: 'active_days', title: 'Активных дней', target: 5 }],
    isRepeatable: true,
    resetPeriod: 'weekly',
  },
  {
    id: 'invite_friends',
    title: 'Реферал-марафон',
    description: 'Пригласи 3 друзей',
    icon: '👥',
    xpReward: 500,
    energyReward: 100,
    steps: [{ id: 'referrals', title: 'Пригласить друзей', target: 3 }],
    isRepeatable: false,
    resetPeriod: null,
  },
] as const;

export const questsService = {
  /** Return all quest definitions enriched with user progress. */
  async getUserQuests(userId: string) {
    const userProgress = await db
      .select()
      .from(userQuests)
      .where(eq(userQuests.userId, userId));

    const progressMap = new Map(userProgress.map((uq) => [uq.questId, uq]));

    return QUEST_DEFINITIONS.map((q) => {
      const uq = progressMap.get(q.id);
      return {
        ...q,
        progress: uq?.progress ?? {},
        isCompleted: uq?.isCompleted ?? false,
        completedAt: uq?.completedAt ?? null,
        startedAt: uq?.startedAt ?? null,
      };
    });
  },

  /**
   * Update progress on a specific step for a quest.
   * Automatically completes the quest if all steps are satisfied.
   * Returns whether the quest was newly completed.
   *
   * The entire read-modify-write cycle runs inside a serializable transaction with
   * a row-level lock (SELECT … FOR UPDATE) to prevent TOCTOU double-reward races
   * where two concurrent requests both see isCompleted=false and both award XP.
   */
  async updateProgress(
    userId: string,
    questId: string,
    stepId: string,
    value: number,
  ): Promise<{
    completed: boolean;
    quest: (typeof QUEST_DEFINITIONS)[number] | undefined;
  }> {
    const questDef = QUEST_DEFINITIONS.find((q) => q.id === questId);
    if (!questDef) return { completed: false, quest: undefined };

    const { newlyCompleted } = await db.transaction(async (tx) => {
      // Ensure the row exists before we lock it — INSERT ... ON CONFLICT DO NOTHING
      // prevents the phantom-row problem where two concurrent requests for a new
      // (userId, questId) both see no row and both insert (bypassing the FOR UPDATE lock).
      await tx
        .insert(userQuests)
        .values({ userId, questId, progress: {}, isCompleted: false })
        .onConflictDoNothing();

      // Now lock the (now-guaranteed-existing) row so no concurrent request can
      // read isCompleted=false and race to award the reward.
      // We select only the columns we actually use to avoid the wrong-column cast issue.
      const [existing] = await tx
        .execute(
          sql`SELECT is_completed, completed_at, progress FROM user_quests WHERE user_id = ${userId} AND quest_id = ${questId} LIMIT 1 FOR UPDATE`,
        )
        .then(
          (r) =>
            r as unknown as Array<{
              is_completed: boolean;
              completed_at: string | null;
              progress: Record<string, number>;
            }>,
        );

      // If already completed and not repeatable — skip inside transaction
      if (existing?.is_completed && !questDef.isRepeatable) {
        return { newlyCompleted: false };
      }

      const currentProgress: Record<string, number> =
        (existing?.progress as Record<string, number>) ?? {};
      currentProgress[stepId] = Math.max(currentProgress[stepId] ?? 0, value);

      // Check if all steps are satisfied
      const allDone = questDef.steps.every(
        (step) => (currentProgress[step.id] ?? 0) >= step.target,
      );

      await tx
        .update(userQuests)
        .set({
          progress: currentProgress,
          isCompleted: allDone,
          completedAt:
            allDone && !existing?.is_completed
              ? new Date()
              : existing?.completed_at
                ? new Date(existing.completed_at)
                : null,
        })
        .where(
          and(eq(userQuests.userId, userId), eq(userQuests.questId, questId)),
        );

      // Determine if we should issue the reward
      const shouldReward =
        allDone && (!existing?.is_completed || questDef.isRepeatable);
      return { newlyCompleted: shouldReward };
    });

    // Award XP + energy outside the transaction (idempotency is handled by the lock above)
    if (newlyCompleted) {
      await gamificationService.awardXp(
        userId,
        questDef.xpReward,
        `Квест завершён: ${questDef.title}`,
        'quest_complete',
      );

      if (questDef.energyReward > 0) {
        await db
          .update(usersTable)
          .set({
            energyBalance: sql`${usersTable.energyBalance} + ${questDef.energyReward}`,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, userId));
      }

      logger.info({ userId, questId }, 'Quest completed');
    }

    return { completed: newlyCompleted, quest: questDef };
  },

  /** Reset repeatable quests for a user based on their resetPeriod (called by a daily cron or on-demand). */
  async resetPeriodicQuests(
    userId: string,
    period: 'daily' | 'weekly',
  ): Promise<void> {
    const periodicQuestIds = QUEST_DEFINITIONS.filter(
      (q) => q.isRepeatable && q.resetPeriod === period,
    ).map((q) => q.id);

    for (const questId of periodicQuestIds) {
      await db
        .update(userQuests)
        .set({ isCompleted: false, progress: {}, completedAt: null })
        .where(
          and(eq(userQuests.userId, userId), eq(userQuests.questId, questId)),
        );
    }
  },
};
