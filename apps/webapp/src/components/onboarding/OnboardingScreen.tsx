'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Zap, Link2, BarChart3, Trophy, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingScreenProps {
  userName: string;
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: '🚀',
    gradient: 'from-violet-600 to-indigo-600',
    title: 'Добро пожаловать!',
    subtitle: 'Showcase Platform',
    description: 'Интерактивная платформа для демонстрации возможностей Telegram-ботов. Запускай сценарии, отслеживай метрики, прокачивайся.',
    features: null,
  },
  {
    icon: null,
    gradient: 'from-cyan-600 to-blue-600',
    title: 'Что ты можешь делать',
    subtitle: 'Весь функционал',
    description: null,
    features: [
      { icon: Zap, label: 'Demo-сценарии', desc: '6 боевых кейсов с реальными метриками', color: 'text-amber-400', bg: 'bg-amber-500/10' },
      { icon: Link2, label: 'Трекинг-ссылки', desc: 'UTM, A/B тесты, QR-коды, GeoIP', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
      { icon: BarChart3, label: 'Аналитика', desc: 'Live-метрики, дашборд, события', color: 'text-violet-400', bg: 'bg-violet-500/10' },
      { icon: Trophy, label: 'Геймификация', desc: 'XP, уровни, стрики, достижения', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ],
  },
  {
    icon: '🎯',
    gradient: 'from-emerald-600 to-teal-600',
    title: 'Получи +50 XP',
    subtitle: 'Бонус за старт',
    description: 'Запусти любой demo-сценарий и получи первые XP. Чем больше ты исследуешь — тем выше уровень и больше достижений.',
    features: null,
  },
] as const;

export function OnboardingScreen({ userName, onComplete }: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setSlide((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-th-bg flex flex-col relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-[120px]" />
      </div>

      {/* Dots */}
      <div className="relative z-10 flex items-center justify-center gap-2 pt-6">
        {(['welcome', 'features', 'bonus'] as const).map((id, i) => (
          <motion.div
            key={id}
            animate={{ width: i === slide ? 24 : 6, opacity: i === slide ? 1 : 0.3 }}
            className={cn('h-1.5 rounded-full', i === slide ? 'bg-brand-400' : 'bg-white/20')}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col px-6 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {slide === 0 && (
              <>
                {/* Welcome slide */}
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    className={cn(
                      'w-28 h-28 rounded-3xl flex items-center justify-center text-5xl mb-6',
                      'bg-gradient-to-br shadow-glow', current.gradient
                    )}
                  >
                    {current.icon}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-brand-400 text-sm font-semibold tracking-wider uppercase mb-2">{current.subtitle}</p>
                    <h1 className="text-3xl font-bold text-white mb-2">{current.title}</h1>
                    <p className="text-xl font-semibold text-white/70 mb-4">
                      {userName ? `Привет, ${userName}!` : 'Привет!'}
                    </p>
                    <p className="text-white/50 text-sm leading-relaxed">{current.description}</p>
                  </motion.div>
                </div>
              </>
            )}

            {slide === 1 && 'features' in current && current.features && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-8"
                >
                  <p className="text-brand-400 text-sm font-semibold tracking-wider uppercase mb-2">{current.subtitle}</p>
                  <h1 className="text-2xl font-bold text-white">{current.title}</h1>
                </motion.div>

                <div className="space-y-3 flex-1">
                  {current.features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        className="glass-card p-4 flex items-center gap-4"
                      >
                        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0', f.bg)}>
                          <Icon className={cn('w-5 h-5', f.color)} />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{f.label}</p>
                          <p className="text-white/40 text-xs mt-0.5">{f.desc}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-400/60 ml-auto flex-shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {slide === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    className={cn(
                      'w-28 h-28 rounded-3xl flex items-center justify-center text-5xl mb-6',
                      'bg-gradient-to-br shadow-glow', current.gradient
                    )}
                  >
                    {current.icon}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-2">{current.subtitle}</p>
                    <h1 className="text-3xl font-bold text-white mb-4">{current.title}</h1>
                    <p className="text-white/50 text-sm leading-relaxed">{current.description}</p>

                    {/* XP preview */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="glass-card p-4 mt-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-semibold text-sm">Стартовый бонус</p>
                          <p className="text-white/40 text-xs">За регистрацию</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-amber-400">+50 XP</span>
                    </motion.div>
                  </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-6 pb-8">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-white text-base',
            'bg-gradient-to-r flex items-center justify-center gap-2',
            isLast ? 'from-emerald-600 to-teal-600 shadow-glow-cyan' : 'from-violet-600 to-indigo-600 shadow-glow'
          )}
        >
          {isLast ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Начать исследование
            </>
          ) : (
            <>
              Далее
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {!isLast && (
          <button
            type="button"
            onClick={onComplete}
            className="w-full mt-3 py-2 text-white/30 text-sm hover:text-white/60 transition-colors"
          >
            Пропустить
          </button>
        )}
      </div>
    </div>
  );
}
