'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Link2, Users, MousePointerClick, Play } from 'lucide-react';
import { api } from '@/lib/api';

export function GlobalStats() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const { data } = useQuery({
    queryKey: ['global-metrics'],
    queryFn: async () => { const r = await api.getGlobalMetrics(); return r.data as any; },
    refetchInterval: 30_000,
  });

  const stats = [
    { label: 'Пользователей', value: data?.totalUsers ?? 0, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Ссылок создано', value: data?.totalLinks ?? 0, icon: Link2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Кликов', value: data?.totalClicks ?? 0, icon: MousePointerClick, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Сценариев запущено', value: data?.totalScenarioRuns ?? 0, icon: Play, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="px-4 mt-3"
    >
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="glass-card px-4 py-3 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <div className={`font-bold text-lg leading-none ${stat.color}`}>
                  {inView ? <CountUp end={stat.value} duration={1.5} delay={i * 0.1} separator=" " /> : '—'}
                </div>
                <p className="text-[10px] text-white/40 mt-0.5 leading-tight truncate">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
