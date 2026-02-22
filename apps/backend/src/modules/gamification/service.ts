import { eq, desc, and, sql } from 'drizzle-orm';
import { db, schema } from '../../db/index.ts';
import { getRedis, cacheKey } from '../../utils/redis.ts';
import { getLevelFromXp, getXpToNextLevel, LEVEL_NAMES } from '@showcase/shared';
import { logger } from '../../utils/logger.ts';

const { users, xpHistory, achievements, userAchievements, quests, userQuests } = schema;

// Achievement definitions
export const ACHIEVEMENTS = [
  { id: 'first_login', name: 'Первый шаг', description: 'Войди в приложение впервые', icon: '🚀', rarity: 'common', xpReward: 50, condition: { type: 'login_count', value: 1 } },
  { id: 'link_creator', name: 'Трекер', description: 'Создай первую трекинг-ссылку', icon: '🔗', rarity: 'common', xpReward: 100, condition: { type: 'links_created', value: 1 } },
  { id: 'viral_link', name: 'Вирусный', description: 'Получи 100+ кликов на одну ссылку', icon: '🔥', rarity: 'rare', xpReward: 250, condition: { type: 'link_clicks', value: 100 } },
  { id: 'scenario_explorer', name: 'Исследователь', description: 'Запусти все demo-сценарии', icon: '🗺️', rarity: 'rare', xpReward: 300, condition: { type: 'scenarios_completed', value: 6 } },
  { id: 'streak_7', name: 'Неделя активности', description: '7 дней подряд в приложении', icon: '📅', rarity: 'rare', xpReward: 200, condition: { type: 'streak', value: 7 } },
  { id: 'streak_30', name: 'Месяц активности', description: '30 дней подряд в приложении', icon: '🏆', rarity: 'epic', xpReward: 750, condition: { type: 'streak', value: 30 } },
  { id: 'level_5', name: 'Практик', description: 'Достигни 5-го уровня', icon: '⭐', rarity: 'rare', xpReward: 200, condition: { type: 'level', value: 5 } },
  { id: 'level_10', name: 'Мастер', description: 'Достигни 10-го уровня', icon: '💎', rarity: 'epic', xpReward: 500, condition: { type: 'level', value: 10 } },
  { id: 'referral_first', name: 'Амбассадор', description: 'Пригласи первого друга', icon: '👥', rarity: 'common', xpReward: 150, condition: { type: 'referrals', value: 1 } },
  { id: 'power_user', name: 'Power User', description: 'Набери 5000 XP', icon: '⚡', rarity: 'legendary', xpReward: 1000, condition: { type: 'xp', value: 5000 } },
] as const;

export const gamificationService = {
  async awardXp(userId: string, amount: number, reason: string, actionType: string): Promise<{
    newXp: number;
    newLevel: number;
    leveledUp: boolean;
    newAchievements: typeof ACHIEVEMENTS[number][];
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error('User not found');

    const oldLevel = getLevelFromXp(user.xp);
    const newXp = user.xp + amount;
    const newLevel = getLevelFromXp(newXp);
    const leveledUp = newLevel > oldLevel;

    // Update user XP and level
    await db.update(users).set({ xp: newXp, level: newLevel, updatedAt: new Date() }).where(eq(users.id, userId));

    // Log XP event
    await db.insert(xpHistory).values({ userId, amount, reason, actionType });

    // Check achievements
    const newAchievements: typeof ACHIEVEMENTS[number][] = [];
    if (leveledUp) {
      const levelAch = ACHIEVEMENTS.find((a) => a.condition.type === 'level' && a.condition.value === newLevel);
      if (levelAch) {
        const awarded = await this.checkAndAwardAchievement(userId, levelAch.id);
        if (awarded) newAchievements.push(levelAch);
      }
    }

    // Check XP milestone
    const xpAch = ACHIEVEMENTS.find((a) => a.condition.type === 'xp' && a.condition.value <= newXp);
    if (xpAch) {
      const awarded = await this.checkAndAwardAchievement(userId, xpAch.id);
      if (awarded) newAchievements.push(xpAch);
    }

    // Invalidate cache
    const redis = getRedis();
    await redis.del(cacheKey.gamification(userId));
    await redis.del(cacheKey.user(userId));

    logger.debug({ userId, amount, reason, newXp, newLevel, leveledUp }, 'XP awarded');

    return { newXp, newLevel, leveledUp, newAchievements };
  },

  async checkAndAwardAchievement(userId: string, achievementId: string): Promise<boolean> {
    // Check if already unlocked
    const existing = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)))
      .limit(1);

    if (existing.length > 0) return false;

    // Award achievement
    const achDef = ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!achDef) return false;

    await db.insert(userAchievements).values({ userId, achievementId });

    // Award XP for achievement (recursive XP without achievement check to avoid loops)
    if (achDef.xpReward > 0) {
      await db
        .update(users)
        .set({ xp: sql`${users.xp} + ${achDef.xpReward}`, updatedAt: new Date() })
        .where(eq(users.id, userId));

      await db.insert(xpHistory).values({
        userId,
        amount: achDef.xpReward,
        reason: `Достижение: ${achDef.name}`,
        actionType: 'achievement',
      });
    }

    logger.info({ userId, achievementId }, 'Achievement unlocked');
    return true;
  },

  async updateStreak(userId: string): Promise<{ streak: number; bonusXp: number }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return { streak: 0, bonusXp: 0 };

    const lastActivity = user.lastActivityAt;
    const now = new Date();
    const daysDiff = lastActivity
      ? Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    let newStreak = user.streak;
    let bonusXp = 0;

    if (daysDiff === 0) {
      // Already active today, no change
      return { streak: newStreak, bonusXp: 0 };
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak = user.streak + 1;
      bonusXp = Math.min(newStreak * 5, 100); // Cap at 100 XP bonus
    } else {
      // Streak broken
      newStreak = 1;
    }

    const longestStreak = Math.max(user.longestStreak, newStreak);

    await db.update(users).set({
      streak: newStreak,
      longestStreak,
      lastActivityAt: now,
      updatedAt: now,
    }).where(eq(users.id, userId));

    // Check streak achievements
    const streakAchs = ACHIEVEMENTS.filter((a) => a.condition.type === 'streak' && a.condition.value <= newStreak);
    for (const ach of streakAchs) await this.checkAndAwardAchievement(userId, ach.id);

    if (bonusXp > 0) {
      await this.awardXp(userId, bonusXp, `Streak бонус x${newStreak}`, 'streak');
    }

    return { streak: newStreak, bonusXp };
  },

  async getStats(userId: string) {
    const redis = getRedis();
    const cached = await redis.get(cacheKey.gamification(userId));
    if (cached) return JSON.parse(cached);

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return null;

    const level = getLevelFromXp(user.xp);
    const xpToNext = getXpToNextLevel(user.xp);
    const levelName = LEVEL_NAMES[level] ?? 'Неизвестно';

    const userAchs = await db
      .select({ achievementId: userAchievements.achievementId, unlockedAt: userAchievements.unlockedAt })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const recentXp = await db
      .select()
      .from(xpHistory)
      .where(eq(xpHistory.userId, userId))
      .orderBy(desc(xpHistory.createdAt))
      .limit(10);

    const stats = {
      xp: user.xp,
      level,
      levelName,
      xpToNextLevel: xpToNext,
      streak: user.streak,
      longestStreak: user.longestStreak,
      energyBalance: user.energyBalance,
      achievements: userAchs.map((ua) => {
        const def = ACHIEVEMENTS.find((a) => a.id === ua.achievementId);
        return { ...def, unlockedAt: ua.unlockedAt };
      }),
      totalAchievements: ACHIEVEMENTS.length,
      recentXpEvents: recentXp,
    };

    await redis.setex(cacheKey.gamification(userId), 60, JSON.stringify(stats));
    return stats;
  },
};
