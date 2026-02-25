'use client';

import type { DemoScenario } from '@showcase/shared';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioCardProps {
  scenario: DemoScenario;
  index: number;
  onSelect: (scenario: DemoScenario) => void;
}

export function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(scenario)}
      className="w-full text-left group active:scale-[0.98] transition-transform duration-100"
    >
      <div className="glass-card-hover p-4 relative overflow-hidden">
        {/* Gradient accent line */}
        <div className={cn('absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity', scenario.gradient)} />

        {/* Subtle bg gradient on hover */}
        <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br to-transparent', scenario.gradient.split(' ')[0] + '/5')} />

        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0',
            'bg-gradient-to-br', scenario.gradient,
            'shadow-lg'
          )}>
            {scenario.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-white text-base truncate">{scenario.title}</h3>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
            <p className="text-white/40 text-xs mt-0.5">{scenario.subtitle}</p>
            <p className="text-white/60 text-sm mt-1.5 line-clamp-2">{scenario.description}</p>

            {/* Key metric preview */}
            <div className="flex items-center gap-3 mt-3">
              {scenario.metrics.slice(0, 2).map((metric) => (
                <div key={metric.label} className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white/90">{metric.value}</span>
                  {metric.delta && metric.trend === 'up' && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" />
                      {metric.delta}
                    </span>
                  )}
                  <span className="text-[10px] text-white/30">{metric.label}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {scenario.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge text-[10px] py-0">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
