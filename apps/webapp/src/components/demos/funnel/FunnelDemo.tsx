'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Users, Zap } from 'lucide-react';
import { useState } from 'react';

type FunnelView =
  | 'overview'
  | 'funnel'
  | 'ab_test'
  | 'automation'
  | 'analytics';

interface FunnelDemoProps {
  onBack: () => void;
}

const FUNNEL_STAGES = [
  {
    id: 'traffic',
    label: 'Трафик',
    emoji: '🌐',
    value: 10000,
    percent: 100,
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    source: 'Telegram Ads + органика',
  },
  {
    id: 'landing',
    label: 'Лендинг-бот',
    emoji: '🤖',
    value: 6800,
    percent: 68,
    color: 'bg-violet-500',
    textColor: 'text-violet-400',
    source: 'Старт бота',
  },
  {
    id: 'lead',
    label: 'Лид-магнит',
    emoji: '🎁',
    value: 4200,
    percent: 42,
    color: 'bg-purple-500',
    textColor: 'text-purple-400',
    source: 'Скачали материал',
  },
  {
    id: 'nurture',
    label: 'Прогрев',
    emoji: '🔥',
    value: 2100,
    percent: 21,
    color: 'bg-orange-500',
    textColor: 'text-orange-400',
    source: '5 писем автосерии',
  },
  {
    id: 'offer',
    label: 'Оффер',
    emoji: '💰',
    value: 840,
    percent: 8.4,
    color: 'bg-amber-500',
    textColor: 'text-amber-400',
    source: 'Показали цену',
  },
  {
    id: 'sale',
    label: 'Продажа',
    emoji: '🎉',
    value: 294,
    percent: 2.94,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    source: 'Оплата через Telegram Pay',
  },
];

const AB_VARIANTS = [
  {
    id: 'a',
    name: 'Вариант A',
    label: 'Кнопка «Получить»',
    ctr: 4.2,
    conv: 2.1,
    revenue: 184000,
    color: 'from-blue-500 to-blue-600',
    barColor: 'bg-blue-500',
    winner: false,
  },
  {
    id: 'b',
    name: 'Вариант B',
    label: 'Кнопка «Хочу результат»',
    ctr: 6.8,
    conv: 3.4,
    revenue: 297000,
    color: 'from-emerald-500 to-teal-600',
    barColor: 'bg-emerald-500',
    winner: true,
  },
];

const AUTOMATION_STEPS = [
  {
    id: 'day0',
    day: 'День 0',
    emoji: '👋',
    message: 'Привет! Вот ваш бесплатный материал',
    openRate: 94,
  },
  {
    id: 'day1',
    day: 'День 1',
    emoji: '📚',
    message: 'Кейс: как мы увеличили продажи x3',
    openRate: 71,
  },
  {
    id: 'day3',
    day: 'День 3',
    emoji: '🎯',
    message: 'Топ-5 ошибок и как их избежать',
    openRate: 58,
  },
  {
    id: 'day5',
    day: 'День 5',
    emoji: '🔥',
    message: 'Специальное предложение только для вас',
    openRate: 45,
  },
  {
    id: 'day7',
    day: 'День 7',
    emoji: '⏰',
    message: 'Последний день — скидка 30%',
    openRate: 61,
  },
];

const ANALYTICS_METRICS = [
  {
    label: 'Выручка / мес',
    value: '₽ 297 000',
    delta: '+42%',
    up: true,
    emoji: '💰',
  },
  { label: 'Конверсия', value: '3.4%', delta: '+62%', up: true, emoji: '📈' },
  { label: 'CAC', value: '₽ 1 250', delta: '-28%', up: false, emoji: '🎯' },
  { label: 'LTV', value: '₽ 8 900', delta: '+19%', up: true, emoji: '👑' },
];

function ViewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: FunnelView;
  onChange: (v: FunnelView) => void;
}) {
  const tabs: { id: FunnelView; label: string }[] = [
    { id: 'funnel', label: 'Воронка' },
    { id: 'ab_test', label: 'A/B тест' },
    { id: 'automation', label: 'Авто' },
    { id: 'analytics', label: 'ROI' },
  ];
  return (
    <div className="flex gap-1 bg-th-raised/60 rounded-2xl p-1 mb-5 border border-th-border/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            active === tab.id
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
              : 'text-th/50 hover:text-th'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function FunnelDemo({ onBack }: FunnelDemoProps) {
  const { haptic } = useTelegram();
  const [view, setView] = useState<FunnelView>('overview');
  const [activeTab, setActiveTab] = useState<FunnelView>('funnel');
  const [history, setHistory] = useState<FunnelView[]>([]);

  const navigate = (to: FunnelView) => {
    haptic.selection();
    setHistory((prev) => [...prev, view]);
    setView(to);
  };

  const goBack = () => {
    haptic.impact('light');
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setView(prev);
    } else {
      onBack();
    }
  };

  const handleTabChange = (tab: FunnelView) => {
    haptic.selection();
    setActiveTab(tab);
    setView(tab);
  };

  const isTabView =
    view === 'funnel' ||
    view === 'ab_test' ||
    view === 'automation' ||
    view === 'analytics';

  const titles: Record<FunnelView, string> = {
    overview: '🚀 Growth Funnels',
    funnel: '🚀 Growth Funnels',
    ab_test: '🚀 Growth Funnels',
    automation: '🚀 Growth Funnels',
    analytics: '🚀 Growth Funnels',
  };

  return (
    <div className="min-h-screen bg-th-bg">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-th-bg/80 backdrop-blur-xl border-b border-th-border/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-th/60 hover:text-th transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">
              {history.length === 0 ? 'Кейсы' : 'Назад'}
            </span>
          </button>
          <h1 className="text-sm font-bold text-th absolute left-1/2 -translate-x-1/2">
            {titles[view]}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── OVERVIEW ─── */}
        {view === 'overview' && (
          <ViewWrapper key="overview">
            <div className="px-4 pt-4 pb-8">
              {/* Hero */}
              <div className="rounded-3xl bg-gradient-to-br from-rose-500 to-orange-600 p-6 mb-6 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-300/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">
                      Автоматические воронки
                    </span>
                  </div>
                  <h2 className="text-white text-2xl font-black mb-2">
                    x3.4 конверсия
                  </h2>
                  <p className="text-white/70 text-sm mb-5">
                    Полная воронка в Telegram: трафик → прогрев → продажа с
                    A/B-тестами и автоматизацией
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: '10 000', l: 'В воронке' },
                      { v: '294', l: 'Продаж / мес' },
                      { v: '297K₽', l: 'Выручка' },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="bg-black/20 rounded-xl p-2.5 text-center backdrop-blur-sm"
                      >
                        <div className="text-white font-bold text-sm">
                          {s.v}
                        </div>
                        <div className="text-white/50 text-[10px]">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature cards */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Возможности
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  {
                    emoji: '🔄',
                    title: 'Воронка продаж',
                    desc: 'Визуализация конверсий по шагам',
                  },
                  {
                    emoji: '⚖️',
                    title: 'A/B тестирование',
                    desc: 'Сравнение вариантов в реальном времени',
                  },
                  {
                    emoji: '🤖',
                    title: 'Автосерия писем',
                    desc: 'Прогрев без вашего участия',
                  },
                  {
                    emoji: '📊',
                    title: 'ROI аналитика',
                    desc: 'CAC, LTV, ROAS в одном месте',
                  },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5"
                  >
                    <span className="text-2xl">{f.emoji}</span>
                    <p className="text-sm font-semibold text-th mt-2">
                      {f.title}
                    </p>
                    <p className="text-xs text-th/50 mt-0.5">{f.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab('funnel');
                  navigate('funnel');
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-600 text-white font-bold text-base shadow-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Открыть дашборд
              </motion.button>
            </div>
          </ViewWrapper>
        )}

        {/* ─── TAB VIEWS ─── */}
        {isTabView && (
          <ViewWrapper key={view}>
            <div className="px-4 pt-4 pb-8">
              <TabBar active={activeTab} onChange={handleTabChange} />

              {/* ── FUNNEL TAB ── */}
              {view === 'funnel' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-th">
                      Воронка продаж
                    </h2>
                    <span className="text-xs text-th/40">Февраль 2025</span>
                  </div>

                  <div className="space-y-2.5">
                    {FUNNEL_STAGES.map((stage, i) => (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-th-raised/60 rounded-2xl p-3.5 border border-th-border/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>{stage.emoji}</span>
                            <span className="text-sm font-semibold text-th">
                              {stage.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-th">
                              {stage.value.toLocaleString()}
                            </span>
                            <span
                              className={`text-xs ml-1.5 font-medium ${stage.textColor}`}
                            >
                              {stage.percent}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-th-border/10 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${stage.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${stage.percent}%` }}
                            transition={{
                              delay: i * 0.07 + 0.2,
                              duration: 0.7,
                              ease: 'easeOut',
                            }}
                          />
                        </div>
                        <p className="text-xs text-th/30 mt-1.5">
                          {stage.source}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <p className="text-sm font-semibold text-emerald-400">
                        Конверсия: 2.94%
                      </p>
                    </div>
                    <p className="text-xs text-th/50 mt-1">
                      Каждые 10 000 посетителей приносят 294 продажи и 297 000₽
                    </p>
                  </div>
                </div>
              )}

              {/* ── A/B TEST TAB ── */}
              {view === 'ab_test' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-th">A/B Тест #7</h2>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-medium">
                      Завершён
                    </span>
                  </div>
                  <p className="text-sm text-th/50 mb-5">
                    Тест CTA-кнопки на финальном шаге воронки. 5 000 показов на
                    каждый вариант.
                  </p>

                  <div className="space-y-4 mb-6">
                    {AB_VARIANTS.map((variant, i) => (
                      <motion.div
                        key={variant.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`rounded-2xl p-4 border-2 ${
                          variant.winner
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-th-border/10 bg-th-raised/60'
                        } relative`}
                      >
                        {variant.winner && (
                          <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                            ПОБЕДИТЕЛЬ
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm font-bold text-th">
                              {variant.name}
                            </p>
                            <p className="text-xs text-th/50 mt-0.5">
                              «{variant.label}»
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-th">
                              {variant.conv}%
                            </p>
                            <p className="text-xs text-th/40">конверсия</p>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {[
                            {
                              label: 'CTR',
                              value: `${variant.ctr}%`,
                              bar: variant.ctr / 10,
                            },
                            {
                              label: 'Конверсия',
                              value: `${variant.conv}%`,
                              bar: variant.conv / 5,
                            },
                            {
                              label: 'Выручка',
                              value: `${(variant.revenue / 1000).toFixed(0)}K₽`,
                              bar: variant.revenue / 300000,
                            },
                          ].map((metric) => (
                            <div key={metric.label}>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-th/50">
                                  {metric.label}
                                </span>
                                <span className="text-xs font-bold text-th">
                                  {metric.value}
                                </span>
                              </div>
                              <div className="h-1.5 bg-th-border/10 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full bg-gradient-to-r ${variant.color} rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min(100, metric.bar * 100)}%`,
                                  }}
                                  transition={{
                                    delay: i * 0.1 + 0.3,
                                    duration: 0.7,
                                    ease: 'easeOut',
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/20">
                    <p className="text-sm font-semibold text-rose-400 mb-1">
                      Итог: +62% конверсия
                    </p>
                    <p className="text-xs text-th/50">
                      Вариант B выиграл с достоверностью 98.7%. Смена CTA
                      принесла дополнительно +113 000₽/мес
                    </p>
                  </div>
                </div>
              )}

              {/* ── AUTOMATION TAB ── */}
              {view === 'automation' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-th">
                      Автосерия прогрева
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-400 font-medium">
                        Активна
                      </span>
                    </div>
                  </div>

                  <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 mb-5">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-rose-400" />
                      <div>
                        <p className="text-sm font-semibold text-th">
                          В серии сейчас
                        </p>
                        <p className="text-xl font-black text-th">1 247</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-th/40">Сред. open rate</p>
                        <p className="text-lg font-bold text-emerald-400">
                          65.8%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {AUTOMATION_STEPS.map((step, i) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3"
                      >
                        {/* Timeline */}
                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-base flex-shrink-0">
                            {step.emoji}
                          </div>
                          {i < AUTOMATION_STEPS.length - 1 && (
                            <div className="w-0.5 h-5 bg-th-border/10 mt-1" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-th-raised/60 rounded-2xl p-3 border border-th-border/5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-rose-400">
                              {step.day}
                            </span>
                            <span className="text-xs text-th/40">
                              Open rate:{' '}
                              <span className="text-th font-semibold">
                                {step.openRate}%
                              </span>
                            </span>
                          </div>
                          <p className="text-sm text-th/80">{step.message}</p>
                          <div className="mt-2 h-1.5 bg-th-border/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${step.openRate}%` }}
                              transition={{
                                delay: i * 0.08 + 0.3,
                                duration: 0.6,
                                ease: 'easeOut',
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ANALYTICS TAB ── */}
              {view === 'analytics' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-th">ROI Дашборд</h2>
                    <span className="text-xs text-th/40">Февраль 2025</span>
                  </div>

                  {/* Key metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {ANALYTICS_METRICS.map((m, i) => (
                      <motion.div
                        key={m.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{m.emoji}</span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              m.up
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {m.up ? '↑' : '↓'} {m.delta}
                          </span>
                        </div>
                        <p className="text-lg font-black text-th">{m.value}</p>
                        <p className="text-th/40 text-[10px] mt-0.5">
                          {m.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mini chart: revenue by channel */}
                  <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 mb-4">
                    <p className="text-sm font-semibold text-th mb-4">
                      Источники трафика
                    </p>
                    <div className="space-y-3">
                      {[
                        {
                          label: 'Telegram Ads',
                          pct: 48,
                          value: '142 K₽',
                          color: 'bg-blue-500',
                        },
                        {
                          label: 'Органика',
                          pct: 31,
                          value: '92 K₽',
                          color: 'bg-violet-500',
                        },
                        {
                          label: 'Реферальная',
                          pct: 14,
                          value: '42 K₽',
                          color: 'bg-orange-500',
                        },
                        {
                          label: 'Партнёры',
                          pct: 7,
                          value: '21 K₽',
                          color: 'bg-emerald-500',
                        },
                      ].map((src, i) => (
                        <div key={src.label}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-th/60">
                              {src.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-th">
                                {src.value}
                              </span>
                              <span className="text-xs text-th/40">
                                {src.pct}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-th-border/10 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${src.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${src.pct}%` }}
                              transition={{
                                delay: i * 0.08 + 0.2,
                                duration: 0.6,
                                ease: 'easeOut',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ROAS summary */}
                  <div className="bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="relative z-10">
                      <p className="text-white/70 text-xs mb-1">
                        ROAS (Return on Ad Spend)
                      </p>
                      <p className="text-white text-3xl font-black">x4.7</p>
                      <p className="text-white/60 text-xs mt-1">
                        На каждый 1₽ рекламы — 4.7₽ дохода
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ViewWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
