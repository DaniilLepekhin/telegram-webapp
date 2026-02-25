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

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

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
    { label: 'Ссылок',     value: summary?.totalLinks ?? 0,           icon: Link2,             color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Кликов',     value: summary?.totalClicks ?? 0,           icon: MousePointerClick,  color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
    { label: 'Конверсий',  value: summary?.totalConversions ?? 0,       icon: TrendingUp,         color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'CVR',        value: `${summary?.conversionRate ?? 0}%`,   icon: Zap,               color: 'text-amber-400',  bg: 'bg-amber-500/10' },
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
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-600/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 left-0 w-48 h-48 bg-violet-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10">
        <LiveMetricsBar />

        {/* Header */}
        <div className="px-4 pt-3 pb-2">
          <h1 className="text-xl font-bold text-white">Аналитика</h1>
          <p className="text-sm text-white/40 mt-0.5">Твои метрики в реальном времени</p>
        </div>

        {/* Summary cards */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="glass-card p-4">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', card.bg)}>
                    <Icon className={cn('w-4 h-4', card.color)} />
                  </div>
                  <div className={cn('text-2xl font-bold', card.color)}>
                    {isLoading ? <div className="h-7 w-16 bg-white/5 rounded animate-pulse" /> : card.value}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{card.label}</p>
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
                <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
              ) : scenarioRuns === 0 ? (
                <div className="text-center py-4">
                  <PlayCircle className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-white/30 text-xs">Запусти сценарии, чтобы увидеть воронку</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FunnelRow
                    icon={<PlayCircle className="w-3.5 h-3.5 text-brand-400" />}
                    label="Запущено"
                    value={scenarioRuns}
                    max={scenarioRuns}
                    color="bg-brand-500"
                  />
                  <FunnelRow
                    icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    label="Завершено"
                    value={scenarioCompleted}
                    max={scenarioRuns}
                    color="bg-emerald-500"
                  />
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs text-white/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Completion rate
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {scenarioRuns > 0 ? Math.round((scenarioCompleted / scenarioRuns) * 100) : 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events timeline chart */}
        <div className="px-4 mb-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              Активность за 30 дней
            </h3>
            {isLoading ? (
              <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
            ) : (charts?.eventsByDay?.length ?? 0) === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-white/20 text-xs">Нет данных за период</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={charts?.eventsByDay ?? []}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(18,18,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                    cursor={{ stroke: 'rgba(99,102,241,0.3)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#grad1)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Event type breakdown */}
        {breakdownList.length > 0 && (
          <div className="px-4 mb-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Разбивка по событиям
              </h3>
              <div className="space-y-2.5">
                {breakdownList.slice(0, 8).map(({ type, count, label, icon }) => (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/60 flex items-center gap-1.5">
                        <span>{icon}</span>
                        {label}
                      </span>
                      <span className="text-xs font-semibold text-white">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500/70 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(count / breakdownMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top links chart */}
        {(charts?.linksByClicks?.length ?? 0) > 0 && (
          <div className="px-4 mb-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                Топ ссылок по кликам
              </h3>
              <ResponsiveContainer width="100%" height={Math.min((charts?.linksByClicks?.length ?? 1) * 36, 180)}>
                <BarChart data={charts?.linksByClicks} layout="vertical">
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="slug" type="category" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} width={70} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(18,18,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  />
                  <Bar dataKey="clicks" fill="#6366f1" radius={[0, 6, 6, 0]}>
                    {(charts?.linksByClicks ?? []).map((entry, index) => (
                      <Cell key={entry.slug} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent events feed */}
        {recentEvents.length > 0 && (
          <div className="px-4 mb-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Последние события
              </h3>
              <div className="space-y-2">
                {recentEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-base flex-shrink-0">{EVENT_ICONS[event.type] ?? '📊'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 truncate">{EVENT_LABELS[event.type] ?? event.type}</p>
                    </div>
                    <span className="text-[10px] text-white/20 flex-shrink-0">
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
              <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">Аналитика появится после первых действий</p>
              <p className="text-white/30 text-xs mt-1">Создай трекинг-ссылку и запусти сценарий</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Funnel Row ---
function FunnelRow({ icon, label, value, max, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/50 flex items-center gap-1.5">{icon}{label}</span>
        <span className="text-xs font-semibold text-white">{value} <span className="text-white/30">({Math.round(pct)}%)</span></span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          style={{ opacity: 0.75 }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
