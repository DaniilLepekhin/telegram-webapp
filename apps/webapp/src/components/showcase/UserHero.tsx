'use client';

import { motion } from 'framer-motion';
import { Zap, Flame, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LEVEL_NAMES } from '@showcase/shared';

interface UserHeroProps {
  user: { first_name: string; username?: string; photo_url?: string; is_premium?: boolean } | null;
}

export function UserHero({ user }: UserHeroProps) {
  const { isAuthenticated, accessToken, hasHydrated } = useAuthStore();

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => { const r = await api.getGamificationStats(); return r.data as any; },
    enabled: hasHydrated && isAuthenticated && !!accessToken,
    refetchInterval: 30_000,
  });

  const level = gamification?.level ?? 0;
  const xp = gamification?.xp ?? 0;
  const xpToNext = gamification?.xpToNextLevel ?? 100;
  const streak = gamification?.streak ?? 0;
  const levelName = LEVEL_NAMES[level] ?? 'Новичок';
  const progress = xpToNext > 0 ? ((xp % (xp + xpToNext)) / (xp + xpToNext)) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 pt-4 pb-2"
    >
      <div className="glass-card p-4 relative overflow-hidden">
        {/* Premium shimmer */}
        {user?.is_premium && (
          <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        )}

        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-xl font-bold shadow-glow-sm">
              {user?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photo_url} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                user?.first_name?.[0] ?? '?'
              )}
            </div>
            {user?.is_premium && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-black" />
              </div>
            )}
          </div>

          {/* Name + level */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-white truncate">
                {user?.first_name ?? 'Демо-пользователь'}
              </p>
              {user?.is_premium && (
                <span className="badge badge-primary text-[10px] py-0">Premium</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-white/40">Ур. {level} • {levelName}</span>
            </div>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="flex flex-col items-center glass px-2.5 py-1.5 rounded-xl">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white">{streak}</span>
            </div>
          )}
        </div>

        {/* XP Progress */}
        {isAuthenticated && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-xs text-white/40">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{xp} XP</span>
              </div>
              <span className="text-xs text-white/30">{xpToNext} до {LEVEL_NAMES[level + 1] ?? 'макс'}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
