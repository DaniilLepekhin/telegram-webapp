'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, Link2, MousePointerClick, TrendingUp, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { LiveMetricsBar } from './LiveMetricsBar';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

export function AnalyticsDashboard() {
  const { isAuthenticated, accessToken, hasHydrated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => { const r = await api.getDashboard(); return r.data as any; },
    enabled: hasHydrated && isAuthenticated && !!accessToken,
    refetchInterval: 60_000,
  });

  const summary = data?.summary;
  const charts = data?.charts;

  const summaryCards = [
    { label: 'Ссылок',       value: summary?.totalLinks ?? 0,       icon: Link2,            color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Кликов',       value: summary?.totalClicks ?? 0,      icon: MousePointerClick, color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
    { label: 'Конверсий',    value: summary?.totalConversions ?? 0,  icon: TrendingUp,        color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
    { label: 'Conv. rate',   value: `${summary?.conversionRate ?? 0}%`, icon: Zap,           color: 'text-amber-400',  bg: 'bg-amber-500/10', isText: true },
  ];

  return (
    <div className="min-h-screen bg-surface-0 relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <LiveMetricsBar />

        {/* Header */}
        <div className="px-4 pt-3 pb-2">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold text-white">Аналитика</h1>
            <p className="text-sm text-white/40 mt-0.5">Твои метрики в реальном времени</p>
          </motion.div>
        </div>

        {/* Summary cards */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-2.5">
            {summaryCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-4"
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', card.bg)}>
                    <Icon className={cn('w-4.5 h-4.5', card.color)} />
                  </div>
                  <div className={cn('text-2xl font-bold', card.color)}>
                    {isLoading ? <div className="h-7 w-16 bg-white/5 rounded animate-pulse" /> : card.value}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{card.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Events timeline chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 mb-4"
        >
          <div className="glass-card p-4">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              Активность за 30 дней
            </h3>
            {isLoading ? (
              <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
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
                    tickFormatter={(v) => v.slice(5)}
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
        </motion.div>

        {/* Top links chart */}
        {charts?.linksByClicks?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-4 mb-4"
          >
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                Топ ссылок по кликам
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={charts.linksByClicks} layout="vertical">
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="slug" type="category" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(18,18,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  />
                  <Bar dataKey="clicks" fill="#6366f1" radius={[0, 6, 6, 0]}>
                    {(charts.linksByClicks as any[]).map((_: unknown, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
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
