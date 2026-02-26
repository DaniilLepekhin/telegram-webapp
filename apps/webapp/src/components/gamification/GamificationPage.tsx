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
  const { isFreshAuth, isAuthReady, accessToken } = useAuthStore();
  const { haptic } = useTelegram();
  const qc = useQueryClient();
  const { ref: statsRef, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [activeTab, setActiveTab] = useState<Tab>('stats');

  const enabled = isFreshAuth && !!accessToken;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => { const r = await api.getGamificationStats(); return r.data as GamificationStats; },
    enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: allAchievements } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const r = await api.getAllAchievements();
      return r.data as Achievement[];
    },
    enabled: isAuthReady,
    staleTime: 10 * 60_000,
  });

  const { data: leaderboard, isLoading: lbLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => { const r = await api.getLeaderboard(20); return r.data as LeaderboardEntry[]; },
    enabled: enabled && activeTab === 'leaderboard',
    staleTime: 2 * 60_000,
  });

  const { data: activity } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => { const r = await api.getActivity(); return r.data as XpEvent[]; },
    enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
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
    <div className="min-h-screen bg-th-bg relative">
      <div className="aurora-bg" />
      <div className="orb orb-amber w-[300px] h-[300px] -top-20 right-0" />
      <div className="orb orb-violet w-[200px] h-[200px] bottom-40 -left-16" />

      <div className="relative z-10 pb-4">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-th tracking-tight">Прокачка</h1>
          <p className="text-sm text-th/35 mt-0.5">XP, уровни, достижения, лидерборд</p>
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
                  'flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5',
                  activeTab === id
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25 shadow-[0_0_12px_-2px_rgba(108,92,231,0.25)]'
                    : 'text-th/35 hover:text-th/50',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* --- STATS TAB --- */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {/* Level card */}
              <div className="px-4 mb-4" ref={statsRef}>
                <div className="glass-card p-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />

                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center font-bold text-th-invert text-lg shadow-glow-sm">
                          {statsLoading ? '?' : level}
                        </div>
                        <div>
                          <p className="font-bold text-th text-lg">{LEVEL_NAMES[level] ?? 'Новичок'}</p>
                          <p className="text-xs text-th/40">Уровень {level}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center glass px-3 py-2 rounded-2xl">
                      <Flame className="w-5 h-5 text-orange-400 mb-0.5" />
                      <span className="text-lg font-bold text-th leading-none">
                        {inView ? <CountUp end={streak} duration={1} /> : 0}
                      </span>
                      <span className="text-[10px] text-th/40">дней</span>
                    </div>
                  </div>

                  {/* XP bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm font-semibold text-th">
                          {inView ? <CountUp end={xp} duration={1.5} separator=" " /> : 0} XP
                        </span>
                      </div>
                      <span className="text-xs text-th/30">
                        {xpToNext > 0 ? `+${xpToNext} до ${LEVEL_NAMES[level + 1] ?? 'макс'}` : 'Макс уровень'}
                      </span>
                    </div>
                    <div className="h-2 bg-th-border/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-6 mt-4 pt-4 border-t border-th-border/5">
                    <div>
                      <p className="text-xs text-th/30">Лучший стрик</p>
                      <p className="font-bold text-th">{stats?.longestStreak ?? 0} дн.</p>
                    </div>
                    <div>
                      <p className="text-xs text-th/30">Энергия</p>
                      <p className="font-bold text-amber-400">{stats?.energyBalance ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-th/30">Достижений</p>
                      <p className="font-bold text-th">{unlockedIds.size} / {allAchievements?.length ?? 10}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick XP actions */}
              {isFreshAuth && (
                <div className="px-4 mb-4">
                  <p className="text-xs text-th/40 uppercase tracking-wider mb-2">Быстрые действия</p>
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <button
                        key={action.type}
                        type="button"
                        onClick={() => awardMutation.mutate({ amount: action.amount, reason: action.reason, actionType: action.type })}
                        disabled={awardMutation.isPending}
                        className="w-full glass-card p-3.5 flex items-center justify-between group hover:bg-th-border/[0.06] transition-colors duration-150 disabled:opacity-50 active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-amber-400" />
                          </div>
                          <span className="text-sm text-th/80 font-medium">{action.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-th/20 group-hover:text-th/50 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity feed */}
              {activity && activity.length > 0 && (
                <div className="px-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-3.5 h-3.5 text-th/40" />
                    <p className="text-xs text-th/40 uppercase tracking-wider">Недавняя активность</p>
                  </div>
                  <div className="space-y-2">
                    {activity.slice(0, 5).map((e) => (
                      <div key={e.id} className="glass rounded-xl px-3 py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-th/70 font-medium">{e.reason}</p>
                          <p className="text-[10px] text-th/30">
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

          {/* --- ACHIEVEMENTS TAB --- */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="px-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-th/40 uppercase tracking-wider">Все достижения</p>
                <span className="badge">
                  {unlockedIds.size}/{allAchievements?.length ?? '?'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {(allAchievements ?? []).map((ach) => {
                  const isUnlocked = unlockedIds.has(ach.id);
                  const unlockedData = (stats?.achievements ?? []).find((a) => a.id === ach.id);

                  return (
                    <div
                      key={ach.id}
                      className={cn(
                        'glass-card p-4 relative overflow-hidden',
                        !isUnlocked && 'opacity-40',
                      )}
                    >
                      {isUnlocked && (
                        <div className={cn('absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r', RARITY_COLORS[ach.rarity as keyof typeof RARITY_COLORS])} />
                      )}

                      <div className="text-2xl mb-2">{isUnlocked ? ach.icon : '🔒'}</div>
                      <p className="font-semibold text-th text-xs leading-tight">{ach.name}</p>
                      <p className="text-[10px] text-th/40 mt-0.5 line-clamp-2">{ach.description}</p>

                      <div className="flex items-center justify-between mt-2">
                        <span className={cn(
                          'text-[9px] font-medium px-1.5 py-0.5 rounded-full',
                          isUnlocked ? `bg-gradient-to-r ${RARITY_COLORS[ach.rarity as keyof typeof RARITY_COLORS]} text-th-invert` : 'bg-th-border/5 text-th/30'
                        )}>
                          {RARITY_LABELS[ach.rarity as keyof typeof RARITY_LABELS]}
                        </span>
                        <span className="text-[10px] text-amber-400 font-medium">+{ach.xpReward} XP</span>
                      </div>

                      {isUnlocked && unlockedData?.unlockedAt && (
                        <p className="text-[9px] text-th/20 mt-1">
                          {new Date(unlockedData.unlockedAt).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* --- LEADERBOARD TAB --- */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="px-4"
            >
              <p className="text-xs text-th/40 uppercase tracking-wider mb-3">Топ по XP</p>

              {lbLoading ? (
                <div className="space-y-2">
                  {['l1', 'l2', 'l3', 'l4', 'l5'].map((id) => (
                    <div key={id} className="glass-card p-4 h-16 shimmer" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(leaderboard ?? []).map((entry, i) => (
                    <div
                      key={entry.id}
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
                        i > 2 && 'bg-th-border/5 text-th/30',
                      )}>
                        {i === 0 ? <Crown className="w-4 h-4" /> : i === 1 ? <Medal className="w-4 h-4" /> : i === 2 ? <Star className="w-4 h-4" /> : i + 1}
                      </div>

                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-th-invert flex-shrink-0">
                        {entry.firstName[0]}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-th truncate">
                          {entry.firstName}{entry.username ? ` @${entry.username}` : ''}
                        </p>
                        <p className="text-[10px] text-th/40">Ур. {entry.level} {LEVEL_NAMES[entry.level] ?? ''}</p>
                      </div>

                      {/* XP */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-amber-400">{entry.xp.toLocaleString('ru-RU')}</p>
                        <p className="text-[10px] text-th/30">XP</p>
                      </div>
                    </div>
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
