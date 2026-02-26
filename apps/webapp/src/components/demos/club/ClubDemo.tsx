'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Crown, Lock } from 'lucide-react';
import { useState } from 'react';

type ClubView =
  | 'landing'
  | 'plans'
  | 'checkout'
  | 'welcome'
  | 'cabinet'
  | 'article';

interface ClubDemoProps {
  onBack: () => void;
}

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 490,
    emoji: '⭐',
    gradient: 'from-slate-400 to-slate-600',
    features: ['Базовые материалы', 'Ежемесячный дайджест', 'Чат участников'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 990,
    emoji: '🚀',
    gradient: 'from-blue-500 to-violet-600',
    features: [
      'Все материалы без ограничений',
      'Еженедельные вебинары',
      'Менторские сессии',
      'Доступ к архиву',
    ],
    popular: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 2990,
    emoji: '👑',
    gradient: 'from-amber-400 to-orange-600',
    features: [
      'Всё из Pro',
      'Личный куратор',
      'Приоритетная поддержка',
      'Закрытые мастермайнды',
    ],
    popular: false,
  },
] as const;

const ARTICLES = [
  {
    id: '1',
    emoji: '📊',
    title: 'Тренды digital-маркетинга 2025',
    category: 'Аналитика',
    readTime: '8 мин',
    locked: false,
    paragraphs: [
      'В 2025 году ключевыми трендами становятся AI-персонализация, short-form видео и conversational commerce через мессенджеры.',
      'Telegram Mini Apps занимают лидирующие позиции в воронках продаж — конверсия выше на 340% по сравнению с обычными лендингами благодаря нативному UX и Telegram Pay.',
      'Growth hacking через реферальные механики показывает ROI 1200%+ при правильной настройке автоматических воронок с ботами.',
    ],
  },
  {
    id: '2',
    emoji: '🎥',
    title: 'Мастер-класс: Запуск продукта за 7 дней',
    category: 'Видео',
    readTime: '45 мин',
    locked: false,
    paragraphs: [
      'Полный разбор методологии Customer Development применительно к digital-продуктам.',
      'От идеи до первых 100 платящих клиентов — пошаговый план с шаблонами и скриптами.',
    ],
  },
  {
    id: '3',
    emoji: '📝',
    title: 'Шаблон контент-плана на 30 дней',
    category: 'Ресурс',
    readTime: '',
    locked: false,
    paragraphs: [
      'Готовый шаблон для планирования контента в Notion с автоматическими расчётами охватов и вовлечённости.',
    ],
  },
  {
    id: '4',
    emoji: '🔐',
    title: 'VIP-инсайт: Стратегия роста x10',
    category: 'Инсайд',
    readTime: '12 мин',
    locked: true,
    paragraphs: [],
  },
];

const ACHIEVEMENTS = [
  { emoji: '🎯', name: 'Первый шаг', desc: 'Вступил в клуб', unlocked: true },
  { emoji: '📚', name: 'Читатель', desc: '5 материалов', unlocked: true },
  { emoji: '🔥', name: 'В огне', desc: '7 дней подряд', unlocked: false },
  { emoji: '💎', name: 'Премиум', desc: 'VIP статус', unlocked: false },
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

export function ClubDemo({ onBack }: ClubDemoProps) {
  const { haptic } = useTelegram();
  const [view, setView] = useState<ClubView>('landing');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('1');
  const [history, setHistory] = useState<ClubView[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const navigate = (to: ClubView) => {
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

  const handlePay = () => {
    setPaymentLoading(true);
    haptic.impact('medium');
    setTimeout(() => {
      setPaymentLoading(false);
      haptic.notification('success');
      navigate('welcome');
    }, 1800);
  };

  const titles: Record<ClubView, string> = {
    landing: '🏆 Pro Club',
    plans: 'Выбор тарифа',
    checkout: 'Оплата',
    welcome: 'Добро пожаловать!',
    cabinet: 'Мой кабинет',
    article: 'Материал',
  };

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[1];
  const selectedArticle =
    ARTICLES.find((a) => a.id === selectedArticleId) ?? ARTICLES[0];

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
        {/* ─── LANDING ─── */}
        {view === 'landing' && (
          <ViewWrapper key="landing">
            <div className="px-4 pt-4 pb-8">
              {/* Hero card */}
              <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-800 p-6 relative overflow-hidden mb-6">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-5 h-5 text-amber-300" />
                    <span className="text-amber-300 font-bold text-xs uppercase tracking-wider">
                      Закрытый клуб
                    </span>
                  </div>
                  <h2 className="text-white text-2xl font-black mb-2">
                    Pro Club
                  </h2>
                  <p className="text-white/70 text-sm mb-5">
                    Эксклюзивные материалы, менторство и закрытое сообщество для
                    роста вашего бизнеса
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: '2 847', l: 'Участников' },
                      { v: '340+', l: 'Материалов' },
                      { v: '4.9★', l: 'Рейтинг' },
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

              {/* Benefits */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Что вы получите
              </p>
              <div className="space-y-2.5 mb-6">
                {[
                  {
                    icon: '📚',
                    title: 'Обучающие материалы',
                    desc: '340+ статей, видео и шаблонов',
                  },
                  {
                    icon: '🎓',
                    title: 'Менторство',
                    desc: 'Сессии с экспертами 1-на-1',
                  },
                  {
                    icon: '🤝',
                    title: 'Нетворкинг',
                    desc: 'Закрытое сообщество предпринимателей',
                  },
                  {
                    icon: '🚀',
                    title: 'Лайв-вебинары',
                    desc: 'Еженедельно с практическими разборами',
                  },
                ].map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 bg-th-raised/60 rounded-2xl p-3.5 border border-th-border/5"
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-th">{b.title}</p>
                      <p className="text-xs text-th/50">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('plans')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-base shadow-lg"
              >
                Вступить в клуб
              </motion.button>
              <p className="text-center text-th/30 text-xs mt-3">
                Отменить подписку можно в любой момент
              </p>
            </div>
          </ViewWrapper>
        )}

        {/* ─── PLANS ─── */}
        {view === 'plans' && (
          <ViewWrapper key="plans">
            <div className="px-4 pt-4 pb-8 space-y-3">
              {PLANS.map((plan, i) => (
                <motion.button
                  key={plan.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    haptic.selection();
                  }}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all relative ${
                    selectedPlanId === plan.id
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-th-border/10 bg-th-raised/60'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-violet-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
                      ПОПУЛЯРНЫЙ
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plan.emoji}</span>
                      <span className="font-bold text-th text-base">
                        {plan.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-th text-xl">
                        {plan.price}₽
                      </span>
                      <span className="text-th/40 text-xs">/мес</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-th/70">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.button>
              ))}

              <motion.button
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('checkout')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-base"
              >
                Продолжить →
              </motion.button>
            </div>
          </ViewWrapper>
        )}

        {/* ─── CHECKOUT ─── */}
        {view === 'checkout' && (
          <ViewWrapper key="checkout">
            <div className="px-4 pt-4 pb-8">
              {/* Order summary */}
              <div
                className={`rounded-2xl p-4 bg-gradient-to-br ${selectedPlan.gradient} mb-6`}
              >
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-white/60 text-xs">Выбранный тариф</p>
                    <p className="font-bold text-lg">
                      {selectedPlan.emoji} {selectedPlan.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">{selectedPlan.price}₽</p>
                    <p className="text-white/60 text-xs">в месяц</p>
                  </div>
                </div>
              </div>

              {/* Payment form (static/demo) */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Данные карты
              </p>
              <div className="space-y-3 mb-6">
                <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/10">
                  <p className="text-th/40 text-xs mb-1">Номер карты</p>
                  <p className="text-th font-mono text-base">
                    •••• •••• •••• 4242
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/10">
                    <p className="text-th/40 text-xs mb-1">Срок</p>
                    <p className="text-th font-mono">12/27</p>
                  </div>
                  <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/10">
                    <p className="text-th/40 text-xs mb-1">CVV</p>
                    <p className="text-th font-mono">•••</p>
                  </div>
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handlePay}
                disabled={paymentLoading}
                className={`w-full py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r ${selectedPlan.gradient} shadow-lg disabled:opacity-70`}
              >
                {paymentLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                      }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Обработка...
                  </span>
                ) : (
                  `Оплатить ${selectedPlan.price}₽`
                )}
              </motion.button>
              <p className="text-center text-th/30 text-xs mt-3">
                🔒 Безопасная оплата через Telegram Pay
              </p>
            </div>
          </ViewWrapper>
        )}

        {/* ─── WELCOME ─── */}
        {view === 'welcome' && (
          <ViewWrapper key="welcome">
            <div className="px-4 pt-8 pb-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-4xl mb-4"
              >
                👑
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-black text-th mb-2">
                  Добро пожаловать!
                </h2>
                <p className="text-th/50 text-sm mb-6">
                  Вы стали участником{' '}
                  <span className="text-violet-500 font-semibold">
                    {selectedPlan.name}
                  </span>{' '}
                  тарифа
                </p>

                {/* First achievements */}
                <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 mb-6 text-left">
                  <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                    Первые достижения
                  </p>
                  <div className="space-y-3">
                    {ACHIEVEMENTS.filter((a) => a.unlocked).map((a) => (
                      <motion.div
                        key={a.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-xl">{a.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-th">
                            {a.name}
                          </p>
                          <p className="text-xs text-th/40">{a.desc}</p>
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Check className="w-4 h-4 text-emerald-400" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('cabinet')}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-base"
                >
                  Перейти в кабинет →
                </motion.button>
              </motion.div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── CABINET ─── */}
        {view === 'cabinet' && (
          <ViewWrapper key="cabinet">
            <div className="px-4 pt-4 pb-8">
              {/* Member card */}
              <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 p-4 mb-6 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">Участник Pro Club</p>
                    <p className="text-white/60 text-xs">
                      Тариф {selectedPlan.name} • 1 день
                    </p>
                  </div>
                  <div className="bg-amber-400/20 rounded-xl px-3 py-1.5">
                    <p className="text-amber-300 text-xs font-bold">LVL 2</p>
                  </div>
                </div>
                <div className="mt-3 relative z-10">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/50 text-xs">XP прогресс</span>
                    <span className="text-white/70 text-xs">350 / 1000</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '35%' }}
                      transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { v: '2', l: 'Материала', emoji: '📚' },
                  { v: '1', l: 'Вебинар', emoji: '🎥' },
                  { v: '2', l: 'Достижения', emoji: '🏆' },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="bg-th-raised/60 rounded-2xl p-3 text-center border border-th-border/5"
                  >
                    <div className="text-xl mb-1">{s.emoji}</div>
                    <div className="font-bold text-th text-lg">{s.v}</div>
                    <div className="text-th/40 text-[10px]">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Достижения
              </p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {ACHIEVEMENTS.map((a) => (
                  <div
                    key={a.name}
                    className={`rounded-2xl p-3 text-center border ${
                      a.unlocked
                        ? 'bg-violet-500/10 border-violet-500/20'
                        : 'bg-th-raised/30 border-th-border/5'
                    }`}
                  >
                    <div
                      className={`text-2xl mb-1 ${a.unlocked ? '' : 'grayscale opacity-30'}`}
                    >
                      {a.emoji}
                    </div>
                    <p
                      className={`text-[9px] font-medium ${a.unlocked ? 'text-th/70' : 'text-th/20'}`}
                    >
                      {a.name}
                    </p>
                  </div>
                ))}
              </div>

              {/* Content feed */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Новые материалы
              </p>
              <div className="space-y-2.5">
                {ARTICLES.map((a, i) => (
                  <motion.button
                    key={a.id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!a.locked) {
                        setSelectedArticleId(a.id);
                        navigate('article');
                      } else {
                        haptic.notification('error');
                      }
                    }}
                    className="w-full text-left bg-th-raised/60 rounded-2xl p-3.5 border border-th-border/5 flex items-center gap-3"
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${a.locked ? 'text-th/30' : 'text-th'}`}
                      >
                        {a.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-th/40">{a.category}</span>
                        {a.readTime && (
                          <>
                            <span className="text-th/20">•</span>
                            <span className="text-xs text-th/40">
                              {a.readTime}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {a.locked ? (
                      <Lock className="w-4 h-4 text-th/20 flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── ARTICLE ─── */}
        {view === 'article' && (
          <ViewWrapper key="article">
            <div className="px-4 pt-4 pb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-violet-500/20 text-violet-400 text-xs font-medium px-2.5 py-1 rounded-full">
                  {selectedArticle.category}
                </span>
                {selectedArticle.readTime && (
                  <span className="text-th/40 text-xs">
                    {selectedArticle.readTime} чтения
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-th mb-1">
                {selectedArticle.title}
              </h2>
              <p className="text-th/40 text-xs mb-6">
                Pro Club • Только для участников
              </p>

              <div className="space-y-4">
                {selectedArticle.paragraphs.map((p, i) => (
                  <p
                    key={`para-${selectedArticle.id}-${i}`}
                    className="text-sm text-th/80 leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-8 border-t border-th-border/5 pt-6">
                <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                  Реакции
                </p>
                <div className="flex gap-2">
                  {['👍', '🔥', '💡', '❤️'].map((emoji) => (
                    <motion.button
                      key={emoji}
                      type="button"
                      whileTap={{ scale: 1.3 }}
                      onClick={() => haptic.selection()}
                      className="flex-1 py-3 rounded-xl bg-th-raised/60 border border-th-border/5 text-xl"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </ViewWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
