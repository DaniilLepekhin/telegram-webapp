'use client';

import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut, Crown, Users, Zap, Star, Copy, ExternalLink, Check } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTelegram } from '@/hooks/useTelegram';
import { LEVEL_NAMES } from '@showcase/shared';
import { getLevelFromXp } from '@showcase/shared';
import { cn } from '@/lib/utils';

export function ProfilePage() {
  const { user: tgUser, haptic } = useTelegram();
  const { user, clearAuth, isAuthenticated, accessToken, hasHydrated } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true });
  const qc = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => { const r = await api.getDashboard(); return (r as any).data; },
    enabled: hasHydrated && isAuthenticated && !!accessToken,
  });

  const { data: referralData } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/referrals`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: 'include',
      });
      return r.json().then((j) => j.data);
    },
    enabled: hasHydrated && isAuthenticated && !!accessToken,
  });

  const { data: subStatus } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/subscriptions/status`, {
        credentials: 'include',
      });
      return r.json().then((j) => j.data);
    },
    enabled: hasHydrated && isAuthenticated,
  });

  const startTrialMutation = useMutation({
    mutationFn: () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/subscriptions/start`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro', trial: true }),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-status'] });
      haptic.notification('success');
      toast.success('🎉 Pro Trial активирован на 7 дней!');
    },
  });

  const handleCopyReferral = async () => {
    if (!referralData?.referralLink) return;
    await navigator.clipboard.writeText(referralData.referralLink);
    setCopied(true);
    haptic.impact('light');
    toast.success('Реферальная ссылка скопирована!');
    setTimeout(() => setCopied(false), 2000);
  };

  const level = getLevelFromXp(user?.xp ?? 0);
  const levelName = LEVEL_NAMES[level] ?? 'Новичок';
  const isPro = subStatus?.isActive && subStatus?.plan !== 'free';

  return (
    <div className="min-h-screen bg-surface-0 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-fuchsia-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 pb-4">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-white">Профиль</h1>
        </div>

        {/* Avatar + Info */}
        <div className="px-4 mb-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent" />

            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                  {tgUser?.photo_url
                    ? <img src={tgUser.photo_url} alt="" className="w-full h-full rounded-3xl object-cover" />
                    : (tgUser?.first_name?.[0] ?? '?')
                  }
                </div>
                {isPro && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-lg truncate">
                  {tgUser?.first_name ?? 'Пользователь'} {tgUser?.last_name ?? ''}
                </p>
                {tgUser?.username && (
                  <p className="text-white/40 text-sm">@{tgUser.username}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('badge text-xs', isPro ? 'badge-primary' : '')}>
                    {isPro ? '⭐ Pro' : `Уровень ${level} • ${levelName}`}
                  </span>
                  {tgUser?.is_premium && <span className="badge text-xs">Telegram Premium</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div ref={ref} className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
              {[
                { label: 'XP', value: user?.xp ?? 0, color: 'text-amber-400', icon: Zap },
                { label: 'Стрик', value: user?.streak ?? 0, color: 'text-orange-400', suffix: 'дн', icon: Star },
                { label: 'Энергия', value: user?.energyBalance ?? 0, color: 'text-cyan-400', icon: Star },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={cn('text-xl font-bold', s.color)}>
                    {inView ? <CountUp end={s.value} duration={1.2} separator=" " /> : 0}
                    {s.suffix && <span className="text-sm ml-0.5">{s.suffix}</span>}
                  </div>
                  <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Subscription card */}
        <div className="px-4 mb-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {isPro ? (
              <div className="glass-card p-4 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">Showcase Pro</p>
                    <p className="text-xs text-white/40">
                      Активна до {subStatus?.expiresAt ? new Date(subStatus.expiresAt).toLocaleDateString('ru-RU') : '—'}
                    </p>
                  </div>
                  <span className="badge badge-success">Активна</span>
                </div>
              </div>
            ) : (
              <div className="glass-card p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">Showcase Pro</p>
                      <p className="text-xs text-white/50 mt-0.5">
                        Неограниченные ссылки, A/B тесты, AI функции
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-white">₽2 990</p>
                      <p className="text-[10px] text-white/30">/мес</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => startTrialMutation.mutate()}
                    disabled={startTrialMutation.isPending}
                    className="w-full mt-3 btn-glow py-3 text-sm disabled:opacity-50"
                  >
                    {startTrialMutation.isPending ? '⏳...' : '🎁 Попробовать 7 дней бесплатно'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Referral card */}
        {referralData && (
          <div className="px-4 mb-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Реферальная программа</p>
                  <p className="text-xs text-white/40">Приглашено: {referralData.totalReferrals} • +{referralData.totalXpEarned} XP</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 glass rounded-xl px-3 py-2 text-xs text-white/50 truncate font-mono">
                  {referralData.referralLink ?? '...'}
                </div>
                <button
                  onClick={handleCopyReferral}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/10"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/50" />}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Logout */}
        <div className="px-4">
          <button
            onClick={() => {
              haptic.impact('light');
              api.logout().catch(() => {});
              clearAuth();
            }}
            className="w-full glass-card p-4 flex items-center gap-3 text-rose-400 hover:bg-rose-500/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </div>
  );
}
