'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Flame, Trophy, Star, ChevronRight, Medal, Crown, Activity } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTelegram } from '@/hooks/useTelegram';
import { LEVEL_NAMES, LEVEL_THRESHOLDS } from '@showcase/shared';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const RARITY_COLORS = {
  common:    'from-slate-500 to-slate-400',
  rare:      'from-blue-600 to-blue-400',
  epic:      'from-violet-600 to-purple-400',
  legendary: 'from-amber-600 to-yellow-400',
} as const;

const RARITY_LABELS = {
  common: 'Обычное', rare: 'Редкое', epic: 'Эпическое', legendary: 'Легендарное',
} as const;

type Tab = 'stats' | 'achievements' | 'leaderboard';

// ─── Types ───────────────────────────────────────────────────────────────────
interface GamificationStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  energyBalance: number;
  achievements: Array<{ id: string; unlockedAt?: string }>;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
}

interface LeaderboardEntry {
  id: string;
  firstName: string;
  username?: string;
  xp: number;
  level: number;
  streak: number;
}

interface XpEvent {
  id: string;
  amount: number;
  reason: string;
  actionType: string;
  createdAt: string;
}

export function GamificationPage() {
  const { isAuthenticated, accessToken, hasHydrated } = useAuthStore();
  const { haptic } = useTelegram();
  const qc = useQueryClient();
  const { ref: statsRef, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [activeTab, setActiveTab] = useState<Tab>('stats');

  const enabled = hasHydrated && isAuthenticated && !!accessToken;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => { const r = await api.getGamificationStats(); return r.data as GamificationStats; },
    enabled,
    refetchInterval: 30_000,
  });

  const { data: allAchievements } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/gamification/achievements`);
      const j = await r.json();
      return j.data as Achievement[];
    },
    enabled: hasHydrated,
  });

  const { data: leaderboard, isLoading: lbLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => { const r = await api.getLeaderboard(20); return r.data as LeaderboardEntry[]; },
    enabled: hasHydrated && activeTab === 'leaderboard',
  });

  const { data: activity } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => { const r = await api.getActivity(); return r.data as XpEvent[]; },
    enabled,
  });

  const awardMutation = useMutation({
    mutationFn: ({ amount, reason, actionType }: { amount: number; reason: string; actionType: string }) =>
      api.awardXp(amount, reason, actionType),
    onSuccess: (data: unknown) => {
      qc.invalidateQueries({ queryKey: ['gamification'] });
      haptic.notification('success');
      const result = (data as { data?: { leveledUp?: boolean; newLevel?: number; newXp?: number } })?.data;
      if (result?.leveledUp) {
        toast.success(`Уровень повышен! Теперь ты ${LEVEL_NAMES[result.newLevel ?? 0]}`);
      } else {
        toast.success(`+${(result?.newXp ?? 0) - (stats?.xp ?? 0)} XP заработано!`);
      }
    },
  });

  const level = stats?.level ?? 0;
  const xp = stats?.xp ?? 0;
  const xpToNext = stats?.xpToNextLevel ?? 100;
  const streak = stats?.streak ?? 0;
  const unlockedIds = new Set((stats?.achievements ?? []).map((a) => a.id));

  const currentLevelXp = LEVEL_THRESHOLDS[level] ?? 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level + 1] ?? currentLevelXp + 100;
  const progressPct = Math.min(((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100, 100);

  const quickActions = [
    { label: '+25 XP — Открыл кейс', amount: 25, reason: 'Просмотр кейса', type: 'page_view' },
    { label: '+50 XP — Ежедневный бонус', amount: 50, reason: 'Ежедневный вход', type: 'daily_login' },
    { label: '+100 XP — Создал ссылку', amount: 100, reason: 'Создание трекинг-ссылки', type: 'link_created' },
  ];

  return (
    <div className="min-h-screen bg-surface-0 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pb-4">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-white">Прокачка</h1>
          <p className="text-sm text-white/40 mt-0.5">XP, уровни, достижения, лидерборд</p>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="glass rounded-2xl p-1 flex gap-1">
            {([
              { id: 'stats' as Tab, label: 'Прогресс', icon: Zap },
              { id: 'achievements' as Tab, label: 'Достижения', icon: Trophy },
              { id: 'leaderboard' as Tab, label: 'Топ', icon: Medal },
            ]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { haptic.selection(); setActiveTab(id); }}
                className={cn(
                  'flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5',
                  activeTab === id
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-white/40 hover:text-white/60',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ─── STATS TAB ─── */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Level card */}
              <div className="px-4 mb-4" ref={statsRef}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center font-bold text-white text-lg shadow-glow-sm">
                          {statsLoading ? '?' : level}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{LEVEL_NAMES[level] ?? 'Новичок'}</p>
                          <p className="text-xs text-white/40">Уровень {level}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center glass px-3 py-2 rounded-2xl">
                      <Flame className="w-5 h-5 text-orange-400 mb-0.5" />
                      <span className="text-lg font-bold text-white leading-none">
                        {inView ? <CountUp end={streak} duration={1} /> : 0}
                      </span>
                      <span className="text-[10px] text-white/40">дней</span>
                    </div>
                  </div>

                  {/* XP bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-semibold text-white">
                          {inView ? <CountUp end={xp} duration={1.5} separator=" " /> : 0} XP
                        </span>
                      </div>
                      <span className="text-xs text-white/30">
                        {xpToNext > 0 ? `+${xpToNext} до ${LEVEL_NAMES[level + 1] ?? 'макс'}` : 'Макс уровень'}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-xs text-white/30">Лучший стрик</p>
                      <p className="font-bold text-white">{stats?.longestStreak ?? 0} дн.</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30">Энергия</p>
                      <p className="font-bold text-amber-400">{stats?.energyBalance ?? 0} ⚡</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30">Достижений</p>
                      <p className="font-bold text-white">{unlockedIds.size} / {allAchievements?.length ?? 10}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick XP actions */}
              {isAuthenticated && (
                <div className="px-4 mb-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Быстрые действия</p>
                  <div className="space-y-2">
                    {quickActions.map((action, i) => (
                      <motion.button
                        key={action.type}
                        type="button"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => awardMutation.mutate({ amount: action.amount, reason: action.reason, actionType: action.type })}
                        disabled={awardMutation.isPending}
                        className="w-full glass-card p-3.5 flex items-center justify-between group hover:bg-white/[0.06] transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-amber-400" />
                          </div>
                          <span className="text-sm text-white/80 font-medium">{action.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity feed */}
              {activity && activity.length > 0 && (
                <div className="px-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-3.5 h-3.5 text-white/40" />
                    <p className="text-xs text-white/40 uppercase tracking-wider">Недавняя активность</p>
                  </div>
                  <div className="space-y-2">
                    {activity.slice(0, 5).map((e) => (
                      <div key={e.id} className="glass rounded-xl px-3 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/70 font-medium">{e.reason}</p>
                          <p className="text-[10px] text-white/30">
                            {new Date(e.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-amber-400">+{e.amount} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── ACHIEVEMENTS TAB ─── */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">Все достижения</p>
                <span className="badge">
                  {unlockedIds.size}/{allAchievements?.length ?? '?'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {(allAchievements ?? []).map((ach, i) => {
                  const isUnlocked = unlockedIds.has(ach.id);
                  const unlockedData = (stats?.achievements ?? []).find((a) => a.id === ach.id);

                  return (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'glass-card p-4 relative overflow-hidden',
                        !isUnlocked && 'opacity-40',
                      )}
                    >
                      {isUnlocked && (
                        <div className={cn('absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r', RARITY_COLORS[ach.rarity as keyof typeof RARITY_COLORS])} />
                      )}

                      <div className="text-2xl mb-2">{isUnlocked ? ach.icon : '🔒'}</div>
                      <p className="font-semibold text-white text-xs leading-tight">{ach.name}</p>
                      <p className="text-[10px] text-white/40 mt-0.5 line-clamp-2">{ach.description}</p>

                      <div className="flex items-center justify-between mt-2">
                        <span className={cn(
                          'text-[9px] font-medium px-1.5 py-0.5 rounded-full',
                          isUnlocked ? `bg-gradient-to-r ${RARITY_COLORS[ach.rarity as keyof typeof RARITY_COLORS]} text-white` : 'bg-white/5 text-white/30'
                        )}>
                          {RARITY_LABELS[ach.rarity as keyof typeof RARITY_LABELS]}
                        </span>
                        <span className="text-[10px] text-amber-400 font-medium">+{ach.xpReward} XP</span>
                      </div>

                      {isUnlocked && unlockedData?.unlockedAt && (
                        <p className="text-[9px] text-white/20 mt-1">
                          {new Date(unlockedData.unlockedAt).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── LEADERBOARD TAB ─── */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-4"
            >
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Топ по XP</p>

              {lbLoading ? (
                <div className="space-y-2">
                  {['l1', 'l2', 'l3', 'l4', 'l5'].map((id) => (
                    <div key={id} className="glass-card p-4 h-16 shimmer" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(leaderboard ?? []).map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'glass-card p-3.5 flex items-center gap-3',
                        i === 0 && 'border border-amber-500/30 bg-amber-500/5',
                        i === 1 && 'border border-slate-400/20',
                        i === 2 && 'border border-amber-700/20',
                      )}
                    >
                      {/* Rank */}
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',
                        i === 0 && 'bg-amber-500/20 text-amber-400',
                        i === 1 && 'bg-slate-500/20 text-slate-400',
                        i === 2 && 'bg-amber-700/20 text-amber-700',
                        i > 2 && 'bg-white/5 text-white/30',
                      )}>
                        {i === 0 ? <Crown className="w-4 h-4" /> : i === 1 ? <Medal className="w-4 h-4" /> : i === 2 ? <Star className="w-4 h-4" /> : i + 1}
                      </div>

                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {entry.firstName[0]}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {entry.firstName}{entry.username ? ` @${entry.username}` : ''}
                        </p>
                        <p className="text-[10px] text-white/40">Ур. {entry.level} • {LEVEL_NAMES[entry.level] ?? ''}</p>
                      </div>

                      {/* XP */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-amber-400">{entry.xp.toLocaleString('ru-RU')}</p>
                        <p className="text-[10px] text-white/30">XP</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
