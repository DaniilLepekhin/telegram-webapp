'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Send,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type SupportView =
  | 'home'
  | 'create'
  | 'processing'
  | 'ai_response'
  | 'resolved';

interface SupportDemoProps {
  onBack: () => void;
}

const TICKET_CATEGORIES = [
  { id: 'payment', emoji: '💳', label: 'Оплата и счета' },
  { id: 'access', emoji: '🔐', label: 'Доступ и аккаунт' },
  { id: 'bug', emoji: '🐛', label: 'Ошибка в сервисе' },
  { id: 'other', emoji: '💬', label: 'Другое' },
];

const EXISTING_TICKETS = [
  {
    id: 'T-1042',
    category: 'Доступ и аккаунт',
    emoji: '🔐',
    subject: 'Не могу войти в личный кабинет',
    status: 'resolved',
    statusLabel: 'Решено',
    date: '24 фев',
    response: 'Пароль сброшен, ссылка отправлена на email.',
  },
  {
    id: 'T-1038',
    category: 'Оплата и счета',
    emoji: '💳',
    subject: 'Двойное списание за подписку',
    status: 'resolved',
    statusLabel: 'Решено',
    date: '20 фев',
    response: 'Возврат выполнен, средства поступят в течение 3 дней.',
  },
];

const AI_RESPONSE_LINES = [
  'Привет! Я AI-ассистент поддержки 👋',
  'Изучил ваш запрос и нашёл решение:',
  '1. Проверьте спам-папку — письмо с инструкцией уже отправлено',
  '2. Если письма нет, нажмите кнопку «Не получил письмо» ниже',
  '3. В крайнем случае — переключу на живого специалиста',
  'Время ответа агента: ~3 минуты',
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

export function SupportDemo({ onBack }: SupportDemoProps) {
  const { haptic } = useTelegram();
  const [view, setView] = useState<SupportView>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('access');
  const [ticketText, setTicketText] = useState('');
  const [history, setHistory] = useState<SupportView[]>([]);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const navigate = (to: SupportView) => {
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

  // Simulate AI typing response
  useEffect(() => {
    if (view !== 'ai_response') return;
    setTypedLines([]);
    setIsTyping(true);

    const timers: ReturnType<typeof setTimeout>[] = [];
    // Show typing indicator for 2s, then reveal lines one by one
    timers.push(
      setTimeout(() => {
        setIsTyping(false);
        AI_RESPONSE_LINES.forEach((line, i) => {
          timers.push(
            setTimeout(() => {
              setTypedLines((prev) => [...prev, line]);
              haptic.impact('light');
            }, i * 400),
          );
        });
      }, 2000),
    );

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [view, haptic]);

  const handleSubmit = () => {
    if (!ticketText.trim()) return;
    haptic.notification('success');
    navigate('processing');
    setTimeout(() => {
      navigate('ai_response');
    }, 2500);
  };

  const titles: Record<SupportView, string> = {
    home: '🎯 Поддержка',
    create: 'Новый запрос',
    processing: 'Обработка...',
    ai_response: 'AI Ассистент',
    resolved: 'Решено',
  };

  const selectedCategoryData =
    TICKET_CATEGORIES.find((c) => c.id === selectedCategory) ??
    TICKET_CATEGORIES[0];

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
        {/* ─── HOME ─── */}
        {view === 'home' && (
          <ViewWrapper key="home">
            <div className="px-4 pt-4 pb-8">
              {/* Hero */}
              <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 p-5 mb-6 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">
                      AI-поддержка
                    </span>
                  </div>
                  <h2 className="text-white text-xl font-black mb-1">
                    Support Desk
                  </h2>
                  <p className="text-white/70 text-sm">
                    AI отвечает мгновенно, агент подключается при необходимости
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[
                      { v: '< 30 сек', l: 'Первый ответ' },
                      { v: '94%', l: 'Решаем сразу' },
                      { v: '4.8★', l: 'Рейтинг' },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="bg-black/20 rounded-xl p-2 text-center backdrop-blur-sm"
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

              {/* New ticket CTA */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('create')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-base mb-6 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Создать запрос
              </motion.button>

              {/* Existing tickets */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                История обращений
              </p>
              <div className="space-y-3">
                {EXISTING_TICKETS.map((ticket, i) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">
                          {ticket.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-th truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-th/40 mt-0.5">
                            {ticket.id} • {ticket.date}
                          </p>
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                        {ticket.statusLabel}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-th-border/5">
                      <p className="text-xs text-th/50">{ticket.response}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── CREATE ─── */}
        {view === 'create' && (
          <ViewWrapper key="create">
            <div className="px-4 pt-4 pb-8">
              {/* Category select */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Категория проблемы
              </p>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {TICKET_CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      haptic.selection();
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      selectedCategory === cat.id
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-th-border/10 bg-th-raised/60'
                    }`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <p
                      className={`text-xs font-medium mt-1.5 ${selectedCategory === cat.id ? 'text-teal-400' : 'text-th/70'}`}
                    >
                      {cat.label}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Description */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Опишите проблему
              </p>
              <div className="bg-th-raised/60 rounded-2xl border border-th-border/10 mb-3 overflow-hidden">
                <textarea
                  value={ticketText}
                  onChange={(e) => setTicketText(e.target.value)}
                  placeholder="Расскажите подробнее, что произошло..."
                  rows={5}
                  className="w-full bg-transparent p-4 text-sm text-th placeholder-th/30 resize-none outline-none"
                />
                <div className="px-4 pb-3 flex items-center justify-between">
                  <span className="text-th/30 text-xs">
                    {ticketText.length}/500 символов
                  </span>
                  {ticketText.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTicketText(
                          selectedCategory === 'access'
                            ? 'Не могу войти в аккаунт, пишет "неверный пароль" хотя ввожу правильный'
                            : 'Прошу помочь с возникшей проблемой',
                        );
                      }}
                      className="text-teal-400 text-xs font-medium"
                    >
                      Пример
                    </button>
                  )}
                </div>
              </div>

              {/* Selected category indicator */}
              <div className="flex items-center gap-2 mb-6 px-1">
                <span className="text-base">{selectedCategoryData.emoji}</span>
                <span className="text-sm text-th/50">
                  {selectedCategoryData.label}
                </span>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!ticketText.trim()}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-base disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Отправить запрос
              </motion.button>
            </div>
          </ViewWrapper>
        )}

        {/* ─── PROCESSING ─── */}
        {view === 'processing' && (
          <ViewWrapper key="processing">
            <div className="px-4 pt-16 pb-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
                className="w-20 h-20 mx-auto rounded-full border-4 border-teal-500/20 border-t-teal-500 mb-6"
              />
              <h2 className="text-xl font-black text-th mb-2">
                AI анализирует запрос
              </h2>
              <p className="text-th/50 text-sm">
                Ищем решение в базе знаний...
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { label: 'Анализ категории', done: true },
                  { label: 'Поиск в базе знаний', done: true },
                  { label: 'Генерация ответа', done: false },
                ].map((step, i) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-3 bg-th-raised/60 rounded-2xl p-3.5 border border-th-border/5"
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'linear',
                        }}
                        className="w-5 h-5 rounded-full border-2 border-teal-500/30 border-t-teal-500 flex-shrink-0"
                      />
                    )}
                    <span
                      className={`text-sm font-medium ${step.done ? 'text-th' : 'text-th/50'}`}
                    >
                      {step.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── AI RESPONSE ─── */}
        {view === 'ai_response' && (
          <ViewWrapper key="ai_response">
            <div className="px-4 pt-4 pb-8">
              {/* Ticket summary */}
              <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">
                    {selectedCategoryData.emoji}
                  </span>
                  <span className="text-xs font-semibold text-th/60">
                    {selectedCategoryData.label}
                  </span>
                  <span className="ml-auto text-xs text-th/30">Только что</span>
                </div>
                <p className="text-sm text-th/70 truncate">{ticketText}</p>
              </div>

              {/* AI chat */}
              <div className="mb-6">
                {/* AI avatar */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-th">
                      AI Ассистент
                    </p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="text-xs text-th/40">Онлайн</span>
                    </div>
                  </div>
                </div>

                {/* Chat bubble */}
                <div className="ml-10">
                  <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl rounded-tl-sm p-4 min-h-[80px]">
                    {isTyping ? (
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={`dot-${i}`}
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.15,
                            }}
                            className="w-2 h-2 bg-teal-400 rounded-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {typedLines.map((line) => (
                          <motion.p
                            key={line}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-th/80 leading-relaxed"
                          >
                            {line}
                          </motion.p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {typedLines.length === AI_RESPONSE_LINES.length && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      haptic.notification('success');
                      navigate('resolved');
                    }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Проблема решена!
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => haptic.notification('warning')}
                    className="w-full py-3.5 rounded-2xl bg-th-raised/60 border border-th-border/10 text-th/70 font-medium text-sm"
                  >
                    Соединить с агентом (~3 мин)
                  </button>
                </motion.div>
              )}
            </div>
          </ViewWrapper>
        )}

        {/* ─── RESOLVED ─── */}
        {view === 'resolved' && (
          <ViewWrapper key="resolved">
            <div className="px-4 pt-8 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-5"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-black text-th mb-2">
                  Обращение закрыто
                </h2>
                <p className="text-th/50 text-sm mb-8">
                  Рады, что смогли помочь!
                </p>

                {/* Rating */}
                <div className="bg-th-raised/60 rounded-2xl p-5 border border-th-border/5 mb-6">
                  <p className="text-sm font-semibold text-th mb-4">
                    Оцените качество поддержки
                  </p>
                  <div className="flex justify-center gap-3">
                    {['😤', '😐', '🙂', '😊', '🤩'].map((emoji, i) => (
                      <motion.button
                        key={emoji}
                        type="button"
                        whileTap={{ scale: 1.3 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        onClick={() => haptic.selection()}
                        className="text-3xl hover:scale-110 transition-transform"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { v: '28 сек', l: 'Время ответа' },
                    { v: 'AI', l: 'Решил проблему' },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="bg-th-raised/60 rounded-2xl p-3 border border-th-border/5"
                    >
                      <p className="text-th font-bold text-xl">{s.v}</p>
                      <p className="text-th/40 text-xs mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-sm"
                >
                  Вернуться к кейсам
                </button>
              </motion.div>
            </div>
          </ViewWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
