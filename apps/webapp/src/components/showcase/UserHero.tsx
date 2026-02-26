'use client';

import { motion } from 'framer-motion';
import { Zap, Flame, Star, Crown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LEVEL_NAMES, LEVEL_THRESHOLDS } from '@showcase/shared';

interface UserHeroProps {
  user: { first_name: string; username?: string; photo_url?: string; is_premium?: boolean } | null;
}

export function UserHero({ user }: UserHeroProps) {
  const { isFreshAuth, accessToken } = useAuthStore();

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const r = await api.getGamificationStats();
      return r.data as { xp: number; level: number; xpToNextLevel: number; streak: number };
    },
    enabled: isFreshAuth && !!accessToken,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const level = gamification?.level ?? 0;
  const xp = gamification?.xp ?? 0;
  const xpToNext = gamification?.xpToNextLevel ?? 100;
  const streak = gamification?.streak ?? 0;
  const levelName = LEVEL_NAMES[level] ?? 'Новичок';

  const currentLevelXp = LEVEL_THRESHOLDS[level] ?? 0;
  const nextLevelXp = LEVEL_THRESHOLDS[level + 1] ?? currentLevelXp + 100;
  const levelRange = nextLevelXp - currentLevelXp;
  const progress = levelRange > 0 ? Math.min(((xp - currentLevelXp) / levelRange) * 100, 100) : 100;

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="holo-card p-5">
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Avatar with gradient ring */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 via-neon-violet to-neon-cyan p-[2px]">
                <div className="w-full h-full rounded-[14px] bg-th-raised flex items-center justify-center text-xl font-bold overflow-hidden">
                  {user?.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="gradient-text">{user?.first_name?.[0] ?? '?'}</span>
                  )}
                </div>
              </div>
              {user?.is_premium && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-glow-amber ring-2 ring-th-bg">
                  <Star className="w-2.5 h-2.5 text-th-invert" />
                </div>
              )}
            </div>

            {/* Name & level */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-th truncate text-base tracking-tight">
                  {user?.first_name ?? 'Демо-пользователь'}
                </p>
                {user?.is_premium && (
                  <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-th/40 font-medium">Ур. {level}</span>
                <span className="text-xs text-th/15">/</span>
                <span className="text-xs gradient-text font-semibold">{levelName}</span>
              </div>
            </div>

            {/* Streak pill */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 glass px-3 py-2 rounded-xl">
                <Flame className="w-4 h-4 text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]" />
                <span className="text-sm font-bold text-th tabular-nums">{streak}</span>
              </div>
            )}
          </div>

          {/* XP Progress bar */}
          {isFreshAuth && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs text-th/40">
                  <Zap className="w-3 h-3 text-neon-amber" />
                  <span className="font-medium tabular-nums">{xp.toLocaleString('ru-RU')} XP</span>
                </div>
                <span className="text-[10px] text-th/25">{xpToNext.toLocaleString('ru-RU')} до {LEVEL_NAMES[level + 1] ?? 'макс'}</span>
              </div>
              <div className="h-1.5 bg-th-border/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ background: 'linear-gradient(90deg, #6c5ce7, #a855f7, #22d3ee)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
