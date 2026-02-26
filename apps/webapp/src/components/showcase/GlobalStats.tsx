'use client';

import { useQuery } from '@tanstack/react-query';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Link2, Users, MousePointerClick, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function GlobalStats() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const { data } = useQuery({
    queryKey: ['global-metrics'],
    queryFn: async () => {
      const r = await api.getGlobalMetrics();
      return r.data as { totalUsers: number; totalLinks: number; totalClicks: number; totalScenarioRuns: number } | undefined;
    },
    refetchInterval: 30_000,
  });

  const stats = [
    { label: 'Пользователей', value: data?.totalUsers ?? 0,          icon: Users,            color: 'text-neon-violet', glow: 'shadow-[0_0_12px_-2px_rgba(168,85,247,0.3)]', bg: 'bg-neon-violet/10' },
    { label: 'Ссылок',        value: data?.totalLinks ?? 0,           icon: Link2,            color: 'text-neon-cyan',   glow: 'shadow-[0_0_12px_-2px_rgba(34,211,238,0.3)]',  bg: 'bg-neon-cyan/10' },
    { label: 'Кликов',        value: data?.totalClicks ?? 0,          icon: MousePointerClick, color: 'text-neon-mint',   glow: 'shadow-[0_0_12px_-2px_rgba(52,211,153,0.3)]',  bg: 'bg-neon-mint/10' },
    { label: 'Сценариев',     value: data?.totalScenarioRuns ?? 0,    icon: Play,             color: 'text-neon-amber',  glow: 'shadow-[0_0_12px_-2px_rgba(251,191,36,0.3)]',  bg: 'bg-neon-amber/10' },
  ];

  return (
    <div ref={ref} className="px-4 mt-4">
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-3.5 flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', stat.bg, stat.glow)}>
                <Icon className={cn('w-4.5 h-4.5', stat.color)} />
              </div>
              <div className="min-w-0">
                <div className={cn('font-bold text-lg leading-none tabular-nums', stat.color)}>
                  {inView ? <CountUp end={stat.value} duration={1.5} separator=" " /> : '—'}
                </div>
                <p className="text-[10px] text-white/30 mt-0.5 leading-tight truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
