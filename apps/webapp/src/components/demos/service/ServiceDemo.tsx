'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type ServiceView = 'home' | 'detail' | 'slots' | 'confirm' | 'tracking';

interface ServiceDemoProps {
  onBack: () => void;
}

const SERVICES = [
  {
    id: 'manicure',
    emoji: '💅',
    name: 'Маникюр + покрытие',
    category: 'Ногтевой сервис',
    price: 1200,
    duration: '60 мин',
    rating: 4.9,
    reviews: 128,
    master: 'Анна К.',
    description:
      'Классический маникюр с гель-лаком. Включает уход за кутикулой, формирование ногтей и стойкое покрытие до 3 недель.',
    tags: ['Гель-лак', 'Уход', 'Дизайн'],
  },
  {
    id: 'haircut',
    emoji: '✂️',
    name: 'Стрижка и укладка',
    category: 'Парикмахерские услуги',
    price: 1800,
    duration: '90 мин',
    rating: 4.8,
    reviews: 95,
    master: 'Мария Л.',
    description:
      'Стрижка с учётом типа лица и волос. Профессиональная укладка, консультация по домашнему уходу.',
    tags: ['Консультация', 'Стрижка', 'Укладка'],
  },
  {
    id: 'massage',
    emoji: '💆',
    name: 'Восстановительный массаж',
    category: 'Тело и релаксация',
    price: 2500,
    duration: '60 мин',
    rating: 5.0,
    reviews: 67,
    master: 'Ольга В.',
    description:
      'Глубокий расслабляющий массаж спины и шеи. Снимает мышечное напряжение и восстанавливает тонус.',
    tags: ['Релаксация', 'Спина', 'Шея'],
  },
  {
    id: 'coloring',
    emoji: '🎨',
    name: 'Окрашивание волос',
    category: 'Парикмахерские услуги',
    price: 3500,
    duration: '180 мин',
    rating: 4.7,
    reviews: 54,
    master: 'Мария Л.',
    description:
      'Профессиональное окрашивание с использованием безаммиачных красителей. Уход и ламинирование в подарок.',
    tags: ['Безаммиачные', 'Уход', 'Ламинирование'],
  },
];

const TIME_SLOTS = [
  { time: '09:00', available: true },
  { time: '10:00', available: false },
  { time: '11:00', available: true },
  { time: '12:00', available: false },
  { time: '13:00', available: false },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: false },
  { time: '17:00', available: true },
  { time: '18:00', available: true },
  { time: '19:00', available: false },
  { time: '20:00', available: true },
];

const TRACKING_STAGES = [
  {
    id: 'received',
    label: 'Заявка принята',
    desc: 'Запись подтверждена системой',
    delay: 0,
  },
  {
    id: 'assigned',
    label: 'Мастер назначен',
    desc: 'Ваша запись у мастера',
    delay: 2000,
  },
  {
    id: 'reminder',
    label: 'Напоминание',
    desc: 'Придёт за 2 часа до визита',
    delay: 4000,
  },
  {
    id: 'ready',
    label: 'Ждём вас!',
    desc: 'Приходите в назначенное время',
    delay: 6000,
  },
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

export function ServiceDemo({ onBack }: ServiceDemoProps) {
  const { haptic } = useTelegram();
  const [view, setView] = useState<ServiceView>('home');
  const [selectedServiceId, setSelectedServiceId] =
    useState<string>('manicure');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [history, setHistory] = useState<ServiceView[]>([]);
  const [completedStages, setCompletedStages] = useState<Set<string>>(
    new Set(),
  );

  const navigate = (to: ServiceView) => {
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

  // Auto-advance tracking stages
  useEffect(() => {
    if (view !== 'tracking') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const stage of TRACKING_STAGES) {
      timers.push(
        setTimeout(() => {
          setCompletedStages((prev) => new Set([...prev, stage.id]));
          haptic.impact('light');
        }, stage.delay + 300),
      );
    }
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [view, haptic]);

  const titles: Record<ServiceView, string> = {
    home: '⚡ Beauty Studio',
    detail: 'Услуга',
    slots: 'Выбор времени',
    confirm: 'Подтверждение',
    tracking: 'Ваша запись',
  };

  const selectedService =
    SERVICES.find((s) => s.id === selectedServiceId) ?? SERVICES[0];

  const today = new Date();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthNames = [
    'янв',
    'фев',
    'мар',
    'апр',
    'май',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
  ];

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
              {/* Salon hero */}
              <div className="rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 mb-6 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <p className="text-white/70 text-xs mb-1">Салон красоты</p>
                  <h2 className="text-white text-xl font-black mb-1">
                    Beauty Studio
                  </h2>
                  <div className="flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      ул. Пушкина, 12
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      4.9 (344 отзыва)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="text-white/70 text-xs">
                      Открыто до 21:00
                    </span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Услуги
              </p>
              <div className="space-y-3">
                {SERVICES.map((s, i) => (
                  <motion.button
                    key={s.id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedServiceId(s.id);
                      navigate('detail');
                    }}
                    className="w-full text-left bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                      {s.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-th">{s.name}</p>
                      <p className="text-xs text-th/40 mt-0.5">{s.category}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-pink-500">
                          {s.price}₽
                        </span>
                        <span className="text-xs text-th/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {s.duration}
                        </span>
                      </div>
                    </div>
                    <div className="text-th/30 text-sm">›</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </ViewWrapper>
        )}

        {/* ─── DETAIL ─── */}
        {view === 'detail' && (
          <ViewWrapper key="detail">
            <div className="px-4 pt-4 pb-8">
              {/* Service header */}
              <div className="rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 mb-6 relative overflow-hidden text-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
                <div className="text-5xl mb-3">{selectedService.emoji}</div>
                <h2 className="text-white text-xl font-black mb-1">
                  {selectedService.name}
                </h2>
                <p className="text-white/70 text-sm">
                  {selectedService.category}
                </p>
              </div>

              {/* Info */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Стоимость', value: `${selectedService.price}₽` },
                  { label: 'Длительность', value: selectedService.duration },
                  {
                    label: 'Рейтинг',
                    value: `${selectedService.rating}★`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-th-raised/60 rounded-2xl p-3 text-center border border-th-border/5"
                  >
                    <p className="text-th font-bold text-base">{item.value}</p>
                    <p className="text-th/40 text-[10px] mt-0.5">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 mb-5">
                <p className="text-th/40 text-xs uppercase tracking-wider mb-2">
                  Описание
                </p>
                <p className="text-sm text-th/80 leading-relaxed">
                  {selectedService.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedService.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-pink-500/10 text-pink-500 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Master */}
              <div className="bg-th-raised/60 rounded-2xl p-4 border border-th-border/5 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-lg">
                  👩‍🎨
                </div>
                <div>
                  <p className="text-sm font-semibold text-th">
                    {selectedService.master}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-th/60">
                      {selectedService.rating} • {selectedService.reviews}{' '}
                      отзывов
                    </span>
                  </div>
                </div>
                <span className="ml-auto text-xs text-emerald-400 font-medium">
                  Свободен
                </span>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('slots')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-base shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Записаться
                </span>
              </motion.button>
            </div>
          </ViewWrapper>
        )}

        {/* ─── TIME SLOTS ─── */}
        {view === 'slots' && (
          <ViewWrapper key="slots">
            <div className="px-4 pt-4 pb-8">
              {/* Date picker */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Выберите дату
              </p>
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {dates.map((d, i) => (
                  <motion.button
                    key={d.toISOString()}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedDate(i);
                      haptic.selection();
                    }}
                    className={`flex-shrink-0 w-14 rounded-2xl p-2.5 text-center border-2 transition-all ${
                      selectedDate === i
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-th-border/10 bg-th-raised/60'
                    }`}
                  >
                    <p
                      className={`text-[10px] ${selectedDate === i ? 'text-pink-500' : 'text-th/40'}`}
                    >
                      {dayNames[d.getDay()]}
                    </p>
                    <p
                      className={`text-lg font-bold mt-0.5 ${selectedDate === i ? 'text-pink-500' : 'text-th'}`}
                    >
                      {d.getDate()}
                    </p>
                    <p
                      className={`text-[9px] ${selectedDate === i ? 'text-pink-400' : 'text-th/30'}`}
                    >
                      {monthNames[d.getMonth()]}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Time slots */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Доступное время
              </p>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {TIME_SLOTS.map((slot) => (
                  <motion.button
                    key={slot.time}
                    type="button"
                    whileTap={slot.available ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (slot.available) {
                        setSelectedSlot(slot.time);
                        haptic.selection();
                      } else {
                        haptic.notification('error');
                      }
                    }}
                    disabled={!slot.available}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      selectedSlot === slot.time
                        ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                        : slot.available
                          ? 'border-th-border/10 bg-th-raised/60 text-th'
                          : 'border-transparent bg-th-raised/20 text-th/20 line-through'
                    }`}
                  >
                    {slot.time}
                  </motion.button>
                ))}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('confirm')}
                disabled={!selectedSlot}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-base disabled:opacity-40"
              >
                Продолжить →
              </motion.button>
            </div>
          </ViewWrapper>
        )}

        {/* ─── CONFIRM ─── */}
        {view === 'confirm' && (
          <ViewWrapper key="confirm">
            <div className="px-4 pt-4 pb-8">
              <div className="rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-5 mb-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white,transparent)]" />
                <div className="text-4xl mb-2">{selectedService.emoji}</div>
                <h2 className="text-white font-black text-lg">
                  {selectedService.name}
                </h2>
                <p className="text-white/70 text-sm mt-1">
                  {selectedService.master}
                </p>
              </div>

              <p className="text-th/40 text-xs uppercase tracking-wider mb-3">
                Детали записи
              </p>

              <div className="space-y-2.5 mb-6">
                {[
                  {
                    icon: '📅',
                    label: 'Дата',
                    value: `${dates[selectedDate].getDate()} ${monthNames[dates[selectedDate].getMonth()]}`,
                  },
                  { icon: '🕐', label: 'Время', value: selectedSlot ?? '—' },
                  {
                    icon: '⏱',
                    label: 'Длительность',
                    value: selectedService.duration,
                  },
                  {
                    icon: '💰',
                    label: 'Стоимость',
                    value: `${selectedService.price}₽`,
                  },
                  { icon: '📍', label: 'Адрес', value: 'ул. Пушкина, 12' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between bg-th-raised/60 rounded-2xl px-4 py-3 border border-th-border/5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{item.icon}</span>
                      <span className="text-sm text-th/60">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-th">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setCompletedStages(new Set());
                  navigate('tracking');
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-base shadow-lg"
              >
                Подтвердить запись ✓
              </motion.button>

              <p className="text-center text-th/30 text-xs mt-3">
                Отмена возможна за 2 часа до визита
              </p>
            </div>
          </ViewWrapper>
        )}

        {/* ─── TRACKING ─── */}
        {view === 'tracking' && (
          <ViewWrapper key="tracking">
            <div className="px-4 pt-4 pb-8">
              {/* Success header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <h2 className="text-xl font-black text-th">
                  Запись оформлена!
                </h2>
                <p className="text-th/50 text-sm mt-1">
                  {selectedService.name} • {dates[selectedDate].getDate()}{' '}
                  {monthNames[dates[selectedDate].getMonth()]} в {selectedSlot}
                </p>
              </div>

              {/* Tracking stages */}
              <p className="text-th/40 text-xs uppercase tracking-wider mb-4">
                Статус записи
              </p>

              <div className="space-y-3 mb-8">
                {TRACKING_STAGES.map((stage, i) => {
                  const isDone = completedStages.has(stage.id);
                  const isActive =
                    !isDone &&
                    i ===
                      [...TRACKING_STAGES].findIndex(
                        (s) => !completedStages.has(s.id),
                      );

                  return (
                    <motion.div
                      key={stage.id}
                      animate={{ opacity: isDone || isActive ? 1 : 0.35 }}
                      className="flex items-center gap-4"
                    >
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isDone
                              ? 'bg-emerald-500'
                              : isActive
                                ? 'bg-pink-500'
                                : 'bg-th-border/10'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : isActive ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          ) : (
                            <div className="w-2 h-2 bg-th-border/30 rounded-full" />
                          )}
                        </div>
                        {i < TRACKING_STAGES.length - 1 && (
                          <div
                            className={`w-0.5 h-6 mt-1 transition-colors duration-500 ${isDone ? 'bg-emerald-500/40' : 'bg-th-border/10'}`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p
                          className={`text-sm font-semibold ${isDone ? 'text-th' : isActive ? 'text-th' : 'text-th/30'}`}
                        >
                          {stage.label}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${isDone ? 'text-th/50' : isActive ? 'text-th/60' : 'text-th/20'}`}
                        >
                          {stage.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-3.5 rounded-2xl bg-th-raised/60 border border-th-border/10 text-th/70 font-medium text-sm"
              >
                Вернуться к кейсам
              </button>
            </div>
          </ViewWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
