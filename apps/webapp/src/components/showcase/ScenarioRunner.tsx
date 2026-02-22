'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Zap, BarChart3, Bot, Globe, CreditCard, Bell } from 'lucide-react';
import CountUp from 'react-countup';
import type { DemoScenario } from '@showcase/shared';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';

interface ScenarioRunnerProps {
  scenario: DemoScenario;
  onBack: () => void;
}

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bot: Bot,
  webapp: Globe,
  payment: CreditCard,
  notification: Bell,
  analytics: BarChart3,
};

type RunState = 'intro' | 'running' | 'complete';

export function ScenarioRunner({ scenario, onBack }: ScenarioRunnerProps) {
  const { haptic, backButton } = useTelegram();
  const [state, setState] = useState<RunState>('intro');
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [runId, setRunId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    backButton.show(onBack);
    return () => backButton.hide();
  }, [backButton, onBack]);

  // Timer
  useEffect(() => {
    if (state === 'running') {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state, startTime]);

  const handleStart = async () => {
    haptic.notification('success');
    setState('running');
    setStartTime(Date.now());
    setCurrentStep(0);

    // Start run on backend
    try {
      const res = await api.runScenario(scenario.id) as any;
      if (res?.data?.runId) setRunId(res.data.runId);
    } catch {}

    // Auto-advance steps
    let step = 0;
    const advance = () => {
      if (step >= scenario.steps.length) return;
      const s = scenario.steps[step];
      haptic.impact(step === 0 ? 'heavy' : 'light');
      setCurrentStep(step);

      setTimeout(() => {
        setCompletedSteps((prev) => new Set([...prev, step]));
        step++;
        if (step < scenario.steps.length) {
          setTimeout(advance, 400);
        } else {
          // All done
          setTimeout(() => {
            setState('complete');
            haptic.notification('success');
            const timeMs = Date.now() - startTime;
            if (runId) api.completeScenario(scenario.id, runId, timeMs).catch(() => {});
          }, 600);
        }
      }, s.durationMs);
    };

    setTimeout(advance, 500);
  };

  return (
    <div className="min-h-screen bg-surface-0 relative overflow-hidden">
      {/* Ambient gradient matching scenario */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className={cn('absolute top-0 left-0 right-0 h-64 bg-gradient-to-b to-transparent', scenario.gradient)} style={{ opacity: 0.15 }} />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-safe">
        <div className="flex items-center gap-3 px-4 py-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { haptic.impact('light'); onBack(); }}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-white/70" />
          </motion.button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{scenario.icon}</span>
              <h1 className="font-bold text-white">{scenario.title}</h1>
            </div>
            <p className="text-xs text-white/40">{scenario.subtitle}</p>
          </div>

          {state === 'running' && (
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/60 font-mono">
                {(elapsed / 1000).toFixed(1)}s
              </span>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── INTRO STATE ─── */}
        {state === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 px-4 pb-8"
          >
            {/* Scenario hero */}
            <div className={cn(
              'rounded-3xl p-6 mt-2 relative overflow-hidden',
              'bg-gradient-to-br', scenario.gradient
            )}>
              <div className="absolute inset-0 opacity-20 noise" />
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <p className="text-white/90 text-sm leading-relaxed relative z-10">{scenario.description}</p>

              <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
                {scenario.metrics.map((m) => (
                  <div key={m.label} className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm">
                    <div className="font-bold text-white text-lg">{m.value}</div>
                    {m.delta && (
                      <div className={cn('text-xs font-medium', m.trend === 'up' ? 'text-emerald-300' : 'text-rose-300')}>
                        {m.trend === 'up' ? '↑' : '↓'} {m.delta}
                      </div>
                    )}
                    <div className="text-white/50 text-[10px] mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps preview */}
            <div className="mt-6">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Шаги сценария</p>
              <div className="space-y-2">
                {scenario.steps.map((step, i) => {
                  const Icon = STEP_ICONS[step.type] ?? Bot;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass rounded-2xl p-3 flex items-center gap-3"
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                        'bg-gradient-to-br', scenario.gradient, 'opacity-80'
                      )}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{step.title}</p>
                        <p className="text-xs text-white/40 truncate">{step.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-white/20">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">{(step.durationMs / 1000).toFixed(1)}s</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Start button */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className={cn(
                'w-full mt-6 py-4 rounded-2xl font-bold text-white text-base',
                'bg-gradient-to-r', scenario.gradient,
                'shadow-lg relative overflow-hidden group'
              )}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              <span className="relative flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                Запустить демо
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* ─── RUNNING STATE ─── */}
        {state === 'running' && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 px-4 pb-8"
          >
            {/* Progress bar */}
            <div className="h-1 bg-white/5 rounded-full mx-0 mb-6 overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full bg-gradient-to-r', scenario.gradient)}
                initial={{ width: '0%' }}
                animate={{ width: `${((completedSteps.size) / scenario.steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            <div className="space-y-3">
              {scenario.steps.map((step, i) => {
                const Icon = STEP_ICONS[step.type] ?? Bot;
                const isActive = i === currentStep;
                const isDone = completedSteps.has(i);
                const isPending = i > currentStep;

                return (
                  <motion.div
                    key={step.id}
                    animate={{
                      opacity: isPending ? 0.35 : 1,
                      scale: isActive ? 1.01 : 1,
                    }}
                    className={cn(
                      'rounded-2xl p-4 border transition-all duration-500 relative overflow-hidden',
                      isDone && 'bg-white/[0.04] border-white/[0.08]',
                      isActive && 'border-white/20 shadow-glow-sm',
                      isPending && 'glass border-white/[0.05]',
                    )}
                    style={isActive ? {
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.15)',
                    } : {}}
                  >
                    {/* Active glow */}
                    {isActive && (
                      <motion.div
                        className={cn('absolute inset-0 opacity-20 bg-gradient-to-r to-transparent', scenario.gradient)}
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    <div className="relative flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                        isDone && 'bg-emerald-500/20',
                        isActive && `bg-gradient-to-br ${scenario.gradient}`,
                        isPending && 'bg-white/5',
                      )}>
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isActive ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </motion.div>
                        ) : (
                          <Icon className="w-5 h-5 text-white/30" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className={cn(
                          'font-semibold text-sm',
                          isDone && 'text-white/70',
                          isActive && 'text-white',
                          isPending && 'text-white/30',
                        )}>
                          {step.title}
                        </p>
                        <p className={cn(
                          'text-xs mt-0.5',
                          isDone && 'text-white/40',
                          isActive && 'text-white/60',
                          isPending && 'text-white/20',
                        )}>
                          {step.description}
                        </p>
                      </div>

                      {isDone && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-emerald-400 text-xs font-mono"
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>

                    {/* Active progress bar */}
                    {isActive && (
                      <motion.div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={cn('h-full rounded-full bg-gradient-to-r', scenario.gradient)}
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: step.durationMs / 1000, ease: 'linear' }}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── COMPLETE STATE ─── */}
        {state === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 px-4 pb-8"
          >
            {/* Success hero */}
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className={cn(
                  'w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-4xl',
                  'bg-gradient-to-br', scenario.gradient, 'shadow-glow'
                )}
              >
                {scenario.icon}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mt-4">Сценарий завершён!</h2>
                <p className="text-white/50 text-sm mt-1">
                  Время: {(elapsed / 1000).toFixed(1)} сек •{' '}
                  <span className="text-emerald-400">{scenario.steps.length} шагов</span>
                </p>
              </motion.div>
            </div>

            {/* XP earned */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-4 mb-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">XP заработано</p>
                  <p className="text-xs text-white/40">За завершение сценария</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-400">
                +<CountUp end={175} duration={1.2} delay={0.5} />
              </span>
            </motion.div>

            {/* Metrics achieved */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-4"
            >
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Результаты кейса</p>
              <div className="grid grid-cols-2 gap-3">
                {scenario.metrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="glass-card p-3"
                  >
                    <div className="font-bold text-white text-base">{m.value}</div>
                    {m.delta && (
                      <div className="text-xs text-emerald-400">{m.trend === 'up' ? '↑' : '↓'} {m.delta}</div>
                    )}
                    <div className="text-white/40 text-[10px] mt-0.5">{m.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <button
                onClick={() => { setState('intro'); setCurrentStep(-1); setCompletedSteps(new Set()); }}
                className="w-full py-3.5 rounded-2xl glass border border-white/10 text-white/70 font-medium text-sm hover:text-white hover:border-white/20 transition-all"
              >
                Повторить сценарий
              </button>
              <button
                onClick={onBack}
                className={cn(
                  'w-full py-3.5 rounded-2xl font-bold text-white text-sm',
                  'bg-gradient-to-r', scenario.gradient
                )}
              >
                Другие кейсы →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
