'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import {
  BarChart3, Link2, MousePointerClick, TrendingUp, Zap,
  Activity, CheckCircle2, PlayCircle, Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LiveMetricsBar } from './LiveMetricsBar';
import { cn } from '@/lib/utils';

const COLORS = ['#6c5ce7', '#a855f7', '#22d3ee', '#34d399'];

const EVENT_ICONS: Record<string, string> = {
  page_view: '👁️', button_click: '🖱️', scenario_start: '▶️', scenario_complete: '✅',
  tracking_link_click: '🔗', subscription_start: '⭐', subscription_cancel: '❌',
  payment_success: '💳', payment_fail: '⚠️', referral_click: '👥', referral_convert: '🎉',
  xp_earned: '⚡', achievement_unlock: '🏆', quest_complete: '🗺️', streak_update: '🔥',
};

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Просмотр', button_click: 'Клик', scenario_start: 'Запуск сценария',
  scenario_complete: 'Сценарий завершён', tracking_link_click: 'Клик по ссылке',
  subscription_start: 'Подписка', subscription_cancel: 'Отмена подписки',
  payment_success: 'Оплата', xp_earned: 'XP', achievement_unlock: 'Достижение',
  streak_update: 'Стрик',
};

interface DashboardData {
  summary: {
    totalLinks: number;
    totalClicks: number;
    totalConversions: number;
    conversionRate: number;
    completedScenarios: number;
    totalScenarioRuns: number;
  };
  charts: {
    eventsByDay: Array<{ date: string; count: number }>;
    linksByClicks: Array<{ slug: string; clicks: number; conversions: number }>;
  };
  recentEvents: Array<{
    id: string;
    type: string;
    payload?: Record<string, unknown>;
    createdAt: string;
  }>;
}

export function AnalyticsDashboard() {
  const { isFreshAuth, accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => { const r = await api.getDashboard(); return r.data as DashboardData; },
    enabled: isFreshAuth && !!accessToken,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const summary = data?.summary;
  const charts = data?.charts;
  const recentEvents = data?.recentEvents ?? [];

  const summaryCards = [
    { label: 'Ссылок',    value: summary?.totalLinks ?? 0,           icon: Link2,             color: 'text-neon-violet', bg: 'bg-neon-violet/10', glow: 'shadow-[0_0_12px_-2px_rgba(168,85,247,0.25)]' },
    { label: 'Кликов',    value: summary?.totalClicks ?? 0,           icon: MousePointerClick, color: 'text-neon-cyan',   bg: 'bg-neon-cyan/10',   glow: 'shadow-[0_0_12px_-2px_rgba(34,211,238,0.25)]' },
    { label: 'Конверсий', value: summary?.totalConversions ?? 0,      icon: TrendingUp,        color: 'text-neon-mint',   bg: 'bg-neon-mint/10',   glow: 'shadow-[0_0_12px_-2px_rgba(52,211,153,0.25)]' },
    { label: 'CVR',       value: `${summary?.conversionRate ?? 0}%`,  icon: Zap,               color: 'text-neon-amber',  bg: 'bg-neon-amber/10',  glow: 'shadow-[0_0_12px_-2px_rgba(251,191,36,0.25)]' },
  ];

  const eventBreakdown = recentEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {});
  const breakdownList = Object.entries(eventBreakdown)
    .map(([type, count]) => ({ type, count, label: EVENT_LABELS[type] ?? type, icon: EVENT_ICONS[type] ?? '📊' }))
    .sort((a, b) => b.count - a.count);
  const breakdownMax = breakdownList[0]?.count ?? 1;

  const scenarioRuns = summary?.totalScenarioRuns ?? 0;
  const scenarioCompleted = summary?.completedScenarios ?? 0;

  return (
    <div className="min-h-screen bg-surface-0 relative">
      <div className="aurora-bg" />
      <div className="orb orb-cyan w-[300px] h-[300px] top-0 -right-20" />
      <div className="orb orb-violet w-[200px] h-[200px] bottom-60 -left-16" />

      <div className="relative z-10">
        <LiveMetricsBar />

        {/* Header */}
        <div className="px-4 pt-3 pb-2">
          <h1 className="text-xl font-bold text-white tracking-tight">Аналитика</h1>
          <p className="text-sm text-white/35 mt-0.5">Метрики в реальном времени</p>
        </div>

        {/* Summary cards — bento grid */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="glass-card p-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-2.5', card.bg, card.glow)}>
                    <Icon className={cn('w-4.5 h-4.5', card.color)} />
                  </div>
                  <div className={cn('text-2xl font-bold tabular-nums', card.color)}>
                    {isLoading ? <div className="h-7 w-16 shimmer" /> : card.value}
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">{card.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scenario funnel */}
        {(scenarioRuns > 0 || !isLoading) && (
          <div className="px-4 mb-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                Воронка сценариев
              </h3>
              {isLoading ? (
                <div className="h-20 shimmer" />
              ) : scenarioRuns === 0 ? (
                <div className="text-center py-4">
                  <PlayCircle className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-white/25 text-xs">Запусти сценарии, чтобы увидеть воронку</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <FunnelRow icon={<PlayCircle className="w-3.5 h-3.5 text-brand-400" />} label="Запущено" value={scenarioRuns} max={scenarioRuns} color="from-brand-500 to-neon-violet" />
                  <FunnelRow icon={<CheckCircle2 className="w-3.5 h-3.5 text-neon-mint" />} label="Завершено" value={scenarioCompleted} max={scenarioRuns} color="from-neon-mint to-neon-cyan" />
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs text-white/25 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Completion rate
                    </span>
                    <span className="text-sm font-bold text-neon-mint tabular-nums">
                      {scenarioRuns > 0 ? Math.round((scenarioCompleted / scenarioRuns) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="px-4 mb-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" /> Активность за 30 дней
            </h3>
            {isLoading ? (
              <div className="h-40 shimmer" />
            ) : (charts?.eventsByDay?.length ?? 0) === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-white/15 text-xs">Нет данных за период</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={charts?.eventsByDay ?? []}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15,15,34,0.95)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ stroke: 'rgba(108,92,231,0.2)' }} />
                  <Area type="monotone" dataKey="count" stroke="#6c5ce7" strokeWidth={2} fill="url(#grad1)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Event breakdown */}
        {breakdownList.length > 0 && (
          <div className="px-4 mb-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-amber" /> Разбивка по событиям
              </h3>
              <div className="space-y-2.5">
                {breakdownList.slice(0, 8).map(({ type, count, label, icon }) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/50 flex items-center gap-1.5">
                        <span>{icon}</span> {label}
                      </span>
                      <span className="text-xs font-semibold text-white tabular-nums">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(count / breakdownMax) * 100}%`, background: 'linear-gradient(90deg, #6c5ce7, #a855f7)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top links */}
        {(charts?.linksByClicks?.length ?? 0) > 0 && (
          <div className="px-4 mb-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-neon-cyan" /> Топ ссылок по кликам
              </h3>
              <ResponsiveContainer width="100%" height={Math.min((charts?.linksByClicks?.length ?? 1) * 36, 180)}>
                <BarChart data={charts?.linksByClicks} layout="vertical">
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="slug" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                  <Tooltip contentStyle={{ background: 'rgba(15,15,34,0.95)', border: '1px solid rgba(108,92,231,0.3)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                  <Bar dataKey="clicks" fill="#6c5ce7" radius={[0, 6, 6, 0]}>
                    {(charts?.linksByClicks ?? []).map((entry, index) => (
                      <Cell key={entry.slug} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent events */}
        {recentEvents.length > 0 && (
          <div className="px-4 mb-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-mint" /> Последние события
              </h3>
              <div className="space-y-1">
                {recentEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-base flex-shrink-0">{EVENT_ICONS[event.type] ?? '📊'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/60 truncate">{EVENT_LABELS[event.type] ?? event.type}</p>
                    </div>
                    <span className="text-[10px] text-white/20 flex-shrink-0 tabular-nums font-mono">
                      {new Date(event.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !data && (
          <div className="px-4">
            <div className="glass-card p-8 text-center">
              <BarChart3 className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">Аналитика появится после первых действий</p>
              <p className="text-white/20 text-xs mt-1">Создай трекинг-ссылку и запусти сценарий</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FunnelRow({ icon, label, value, max, color }: { icon: React.ReactNode; label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/40 flex items-center gap-1.5">{icon}{label}</span>
        <span className="text-xs font-semibold text-white tabular-nums">{value} <span className="text-white/25">({Math.round(pct)}%)</span></span>
      </div>
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', color)}
          style={{ opacity: 0.85 }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
