'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { LEVEL_NAMES, getLevelFromXp } from '@showcase/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Check,
  Copy,
  Crown,
  LogOut,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  isPremium?: boolean;
  role: string;
  xp: number;
  level: number;
  levelName: string;
  streak: number;
  longestStreak: number;
  energyBalance: number;
  referralCode?: string;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalXpEarned: number;
}

interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  status: string;
  expiresAt?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  trialDays: number;
  features: string[];
}

export function ProfilePage() {
  const { user: tgUser, haptic } = useTelegram();
  const { clearAuth, isFreshAuth, isAuthReady, accessToken } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true });
  const qc = useQueryClient();

  const enabled = isFreshAuth && !!accessToken;

  const { data: profile } = useQuery({
    queryKey: ['profile-me'],
    queryFn: async () => {
      const r = await api.getMe();
      return r.data as UserProfile;
    },
    enabled,
  });

  const { data: referralData } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const r = await api.getReferrals();
      return r.data as ReferralData;
    },
    enabled,
  });

  const { data: subStatus } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const r = await api.getSubscriptionStatus();
      return r.data as SubscriptionStatus;
    },
    enabled,
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const r = await api.getPlans();
      return r.data as Plan[];
    },
    enabled: isAuthReady,
  });

  const startTrialMutation = useMutation({
    mutationFn: () => api.startSubscription('pro', true),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-status'] });
      haptic.notification('success');
      toast.success('Pro Trial активирован на 7 дней!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCopyReferral = async () => {
    if (!referralData?.referralLink) return;
    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      haptic.impact('light');
      toast.success('Реферальная ссылка скопирована!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const level = profile?.level ?? getLevelFromXp(profile?.xp ?? 0);
  const levelName = profile?.levelName ?? LEVEL_NAMES[level] ?? 'Новичок';
  const isPro = subStatus?.isActive && subStatus?.plan !== 'free';
  const proPlan = plans?.find((p) => p.id === 'pro');

  return (
    <div className="min-h-screen bg-th-bg relative">
      <div className="aurora-bg" />
      <div className="orb orb-rose w-[300px] h-[300px] -top-20 left-1/4" />
      <div className="orb orb-violet w-[200px] h-[200px] bottom-60 -right-16" />

      <div className="relative z-10 pb-4">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-th tracking-tight">Профиль</h1>
        </div>

        {/* Avatar + Info */}
        <div className="px-4 mb-4">
          <div className="holo-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 via-neon-violet to-neon-cyan p-[2px]">
                    <div className="w-full h-full rounded-[22px] bg-th-raised flex items-center justify-center text-2xl font-bold text-th overflow-hidden">
                      {tgUser?.photo_url ? (
                        <img
                          src={tgUser.photo_url}
                          alt=""
                          className="w-full h-full rounded-[22px] object-cover"
                        />
                      ) : (
                        <span className="gradient-text">
                          {profile?.firstName?.[0] ??
                            tgUser?.first_name?.[0] ??
                            '?'}
                        </span>
                      )}
                    </div>
                  </div>
                  {isPro && (
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-3.5 h-3.5 text-th-invert" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-th text-lg truncate">
                    {profile?.firstName ?? tgUser?.first_name ?? 'Пользователь'}{' '}
                    {profile?.lastName ?? tgUser?.last_name ?? ''}
                  </p>
                  {(profile?.username ?? tgUser?.username) && (
                    <p className="text-th/40 text-sm">
                      @{profile?.username ?? tgUser?.username}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span
                      className={cn(
                        'badge text-xs',
                        isPro ? 'badge-primary' : '',
                      )}
                    >
                      {isPro ? 'Pro' : `Ур. ${level} • ${levelName}`}
                    </span>
                    {tgUser?.is_premium && (
                      <span className="badge text-xs">Telegram Premium</span>
                    )}
                    {profile?.role === 'admin' && (
                      <span className="badge text-xs flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div
                ref={ref}
                className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-th-border/5"
              >
                {[
                  {
                    label: 'XP',
                    value: profile?.xp ?? 0,
                    color: 'text-neon-amber',
                    icon: Zap,
                  },
                  {
                    label: 'Стрик',
                    value: profile?.streak ?? 0,
                    color: 'text-neon-rose',
                    suffix: 'дн',
                    icon: Star,
                  },
                  {
                    label: 'Энергия',
                    value: profile?.energyBalance ?? 0,
                    color: 'text-neon-cyan',
                    icon: Zap,
                  },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="text-center">
                      <div className={cn('text-xl font-bold', s.color)}>
                        {inView ? (
                          <CountUp end={s.value} duration={1.2} separator=" " />
                        ) : (
                          0
                        )}
                        {s.suffix && (
                          <span className="text-sm ml-0.5">{s.suffix}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-th/30 mt-0.5 flex items-center justify-center gap-1">
                        <Icon className="w-3 h-3" />
                        {s.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="px-4 mb-4">
          {isPro ? (
            <div className="glass-card p-4 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-th">Showcase Pro</p>
                  <p className="text-xs text-th/40">
                    {subStatus?.status === 'trial' ? 'Trial' : 'Активна'} до{' '}
                    {subStatus?.expiresAt
                      ? new Date(subStatus.expiresAt).toLocaleDateString(
                          'ru-RU',
                        )
                      : '—'}
                  </p>
                </div>
                <span className="badge badge-success">
                  {subStatus?.status === 'trial' ? 'Trial' : 'Pro'}
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-card p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent" />
              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-th">Showcase Pro</p>
                    <p className="text-xs text-th/50 mt-0.5">
                      {proPlan?.features?.slice(0, 2).join(' · ') ??
                        'Неограниченные ссылки, A/B тесты'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-th">
                      ₽{(proPlan?.price ?? 2990).toLocaleString('ru-RU')}
                    </p>
                    <p className="text-[10px] text-th/30">/мес</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startTrialMutation.mutate()}
                  disabled={startTrialMutation.isPending}
                  className="w-full mt-3 btn-glow py-3 text-sm disabled:opacity-50 active:scale-[0.97]"
                >
                  {startTrialMutation.isPending
                    ? 'Активация...'
                    : `Попробовать ${proPlan?.trialDays ?? 7} дней бесплатно`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Referral */}
        {referralData && (
          <div className="px-4 mb-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-th text-sm">
                    Реферальная программа
                  </p>
                  <p className="text-xs text-th/40">
                    Приглашено: {referralData.totalReferrals} • +
                    {referralData.totalXpEarned} XP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 glass rounded-xl px-3 py-2 text-xs text-th/50 truncate font-mono">
                  {referralData.referralLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-th-border/10 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-th/50" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account details */}
        <div className="px-4 mb-4">
          <div className="glass-card p-4">
            <p className="text-xs text-th/40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Детали аккаунта
            </p>
            <div className="space-y-2">
              {[
                { label: 'ID', value: profile?.id?.slice(0, 8) ?? '—' },
                { label: 'Telegram ID', value: String(tgUser?.id ?? '—') },
                {
                  label: 'Лучший стрик',
                  value: `${profile?.longestStreak ?? 0} дней`,
                },
                { label: 'Реф. код', value: profile?.referralCode ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-th/40">{label}</span>
                  <span className="text-xs text-th/70 font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4">
          <button
            type="button"
            onClick={() => {
              haptic.impact('light');
              api.logout().catch(() => {});
              clearAuth();
            }}
            className="w-full glass-card p-4 flex items-center gap-3 text-rose-400 hover:bg-rose-500/5 transition-colors active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </div>
  );
}
