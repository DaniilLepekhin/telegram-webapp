'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  Gift,
  Globe,
  Home,
  Lock,
  LogOut,
  Megaphone,
  MessageCircle,
  Search,
  Shield,
  Smartphone,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

// ─── Accent colors (club red as neon on dark) ─────────────────────────────────
const ACCENT = '#ff4455';
const ACCENT_GRAD = 'linear-gradient(135deg, #ff4455 0%, #c8142a 100%)';
const ACCENT_GRAD_HORIZ = 'linear-gradient(90deg, #e8283a 0%, #c01525 100%)';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabType = 'home' | 'path' | 'chats' | 'ratings' | 'profile';

interface ClubDemoProps {
  onBack: () => void;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USER = {
  firstName: 'Алексей',
  lastName: 'Иванов',
  username: '@alexivanov',
  energies: 247,
  subscriptionExpires: '01.06.2025',
  city: 'Москва',
};

const LEADERBOARD = [
  {
    id: '1',
    name: 'Мария Соколова',
    city: 'Москва',
    energies: 1840,
    isMe: false,
  },
  {
    id: '2',
    name: 'Дмитрий Кузнецов',
    city: 'СПб',
    energies: 1620,
    isMe: false,
  },
  {
    id: '3',
    name: 'Анна Петрова',
    city: 'Казань',
    energies: 1410,
    isMe: false,
  },
  {
    id: '4',
    name: 'Иван Сидоров',
    city: 'Новосибирск',
    energies: 1290,
    isMe: false,
  },
  {
    id: '5',
    name: 'Елена Волкова',
    city: 'Екатеринбург',
    energies: 1180,
    isMe: false,
  },
  {
    id: '6',
    name: 'Сергей Новиков',
    city: 'Краснодар',
    energies: 1050,
    isMe: false,
  },
  {
    id: '7',
    name: 'Алексей Иванов',
    city: 'Москва',
    energies: 247,
    isMe: true,
  },
  {
    id: '8',
    name: 'Наталья Морозова',
    city: 'Самара',
    energies: 210,
    isMe: false,
  },
];

const CITY_RATINGS = [
  { city: 'Москва', total: 15240 },
  { city: 'Санкт-Петербург', total: 9870 },
  { city: 'Казань', total: 7310 },
  { city: 'Новосибирск', total: 5890 },
  { city: 'Екатеринбург', total: 4720 },
];

const TEAM_RATINGS = [
  { id: 't1', name: 'Десятка Марии С.', total: 4820 },
  { id: 't2', name: 'Десятка Дмитрия', total: 3910 },
  { id: 't3', name: 'Команда Казани', total: 3450 },
  { id: 't4', name: 'Сибирская десятка', total: 2890 },
  { id: 't5', name: 'Десятка Алексея', total: 1240 },
];

const HISTORY = [
  { id: 'h1', desc: 'Просмотр медитации', energies: 10, date: '27 фев' },
  { id: 'h2', desc: 'Завершение урока', energies: 25, date: '26 фев' },
  { id: 'h3', desc: 'Практика благодарности', energies: 15, date: '25 фев' },
  { id: 'h4', desc: 'Реферальный бонус', energies: 50, date: '23 фев' },
];

const PATH_CATEGORIES = [
  {
    id: 'month-program',
    title: 'Программа\nмесяца',
    gradient: ACCENT_GRAD_HORIZ,
  },
  {
    id: 'courses',
    title: 'Курсы',
    gradient: 'linear-gradient(135deg, #6c5ce7 0%, #4a3cbf 100%)',
  },
  {
    id: 'podcasts',
    title: 'Подкасты',
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
  },
  {
    id: 'streams',
    title: 'Эфиры\n(записи)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 'practices',
    title: 'Практики',
    gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  },
];

const MOCK_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Краснодар',
  'Самара',
];

// ─── Shared glass card ────────────────────────────────────────────────────────
function GlassCard({
  children,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl border border-th-border/5 bg-th-raised shadow-card ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
}: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4" style={{ color: ACCENT }} />
      <p className="text-th font-semibold text-sm uppercase tracking-wider">
        {title}
      </p>
    </div>
  );
}

// ─── HomeTab ──────────────────────────────────────────────────────────────────
function HomeTab({ onBack }: { onBack: () => void }) {
  const { haptic } = useTelegram();
  const [copied, setCopied] = useState(false);
  const referralLink = `https://t.me/successkodbot?start=ref_${MOCK_USER.username.replace('@', '')}`;

  const handleCopy = () => {
    haptic.notification('success');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-th-bg pb-24">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-3 left-4 z-30 flex items-center gap-1.5 text-th/50 hover:text-th transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-medium">Кейсы</span>
      </button>

      <div className="px-4 pt-10">
        {/* Search */}
        <div className="w-full h-10 flex items-center rounded-xl mb-5 border border-th-border/5 bg-th-raised">
          <Search className="ml-3 w-4 h-4 text-th/30 flex-shrink-0" />
          <span className="flex-1 px-3 text-th/30 text-sm font-medium">
            Поиск...
          </span>
        </div>

        {/* Referral block (locked) */}
        <div
          className="relative w-full mb-6 overflow-hidden rounded-2xl opacity-60"
          style={{ background: ACCENT_GRAD, border: `1px solid ${ACCENT}40` }}
        >
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">
                <Lock className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <p className="text-white text-xs font-semibold">
                Скоро откроется
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center flex-shrink-0">
                <span
                  className="text-white font-bold"
                  style={{ fontSize: 8, letterSpacing: '0.5px' }}
                >
                  КОД
                </span>
              </div>
              <p className="text-white text-sm font-semibold">
                Пригласи друга в клуб КОД ДЕНЕГ
              </p>
            </div>
            <div className="h-px w-full bg-white/20 mb-3" />
            <div className="flex items-center px-3 py-2.5 rounded-lg border border-white/30 bg-white/10">
              <div className="flex-1 min-w-0">
                <p
                  className="text-white/80 font-semibold mb-0.5"
                  style={{ fontSize: 11 }}
                >
                  Отправьте эту ссылку другу
                </p>
                <p className="text-white/50 text-xs font-mono truncate">
                  {referralLink}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-shrink-0 ml-2 p-1.5"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Copy className="w-4 h-4 text-white/50" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center mb-6">
          <h1
            className="text-th font-bold mb-1"
            style={{ fontSize: 'clamp(30px, 9vw, 42px)', lineHeight: 1.05 }}
          >
            Привет, {MOCK_USER.firstName}!
          </h1>
          <p className="text-th/50 text-sm">
            Ты в пространстве клуба «Код Успеха»
          </p>
        </div>

        {/* Balance card */}
        <div
          className="w-full mb-6 rounded-2xl overflow-hidden"
          style={{ background: ACCENT_GRAD }}
        >
          <div className="flex items-center justify-between p-4">
            <p className="text-white/70 text-sm font-medium">Мой баланс</p>
            <div className="text-right">
              <p
                className="text-white font-bold leading-none mb-1"
                style={{ fontSize: 'clamp(40px, 10vw, 52px)' }}
              >
                {MOCK_USER.energies}
              </p>
              <p className="text-white/70 text-sm">энергий</p>
            </div>
          </div>
          <div className="px-4 pb-3">
            <div className="h-px bg-white/15 mb-2" />
            <p className="text-white/50" style={{ fontSize: 11 }}>
              Баллы за активность и участие в клубе
            </p>
          </div>
        </div>

        {/* Announcements */}
        <div>
          <SectionHeader icon={Megaphone} title="Анонсы" />
          <div className="h-px bg-th-border/5 mb-4" />

          {/* Leader test */}
          <div
            className="w-full mb-3 rounded-2xl p-4"
            style={{ background: ACCENT_GRAD, border: `1px solid ${ACCENT}40` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white/30 bg-white/15 flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p
                  className="text-white font-bold mb-0.5"
                  style={{ fontSize: 15 }}
                >
                  Тест на Лидера десятки
                </p>
                <p className="text-white/70 text-xs">
                  Пройди тест и стань лидером группы
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0">
                <ChevronRight className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
            </div>
          </div>

          {/* Weekly survey */}
          <GlassCard className="p-4">
            <p className="text-th font-semibold text-sm mb-1">
              📋 Еженедельный опрос
            </p>
            <p className="text-th/50 text-xs mb-3">
              Как ты оцениваешь прошлую неделю? Поставь «светофор»
            </p>
            <div className="flex gap-2">
              {['🔴', '🟡', '🟢'].map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  whileTap={{ scale: 1.2 }}
                  onClick={() => haptic.selection()}
                  className="flex-1 py-2.5 rounded-xl text-2xl border border-th-border/5 bg-th-border/5"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {copied && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl bg-th-raised border border-th-border/5 shadow-card">
          <p className="text-th text-sm font-medium text-center">
            Ссылка скопирована
          </p>
        </div>
      )}
    </div>
  );
}

// ─── PathTab ──────────────────────────────────────────────────────────────────
function PathTab() {
  const { haptic } = useTelegram();

  return (
    <div className="min-h-screen bg-th-bg pb-24">
      <div className="px-4 pt-6">
        <p className="text-th/50 text-sm text-center mb-1">
          Твой обучающий путь
        </p>
        <h1 className="text-th font-bold text-center text-2xl mb-2">
          Здесь твой обучающий путь:
        </h1>
        <p className="text-th/50 text-xs text-center mb-6 leading-relaxed">
          <span className="font-semibold text-th/70">
            Уроки, эфиры и практики,
          </span>{' '}
          которые ведут к ментальному и материальному росту, помогают выстроить
          мышление и устойчивый доход.
        </p>

        {/* 2-col grid (first 4) */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {PATH_CATEGORIES.slice(0, 4).map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => haptic.impact('light')}
              className="relative overflow-hidden text-left rounded-2xl"
              style={{ height: 110, background: cat.gradient }}
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <p
                  className="text-white font-bold leading-tight whitespace-pre-line"
                  style={{ fontSize: 17 }}
                >
                  {cat.title}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Centered last card */}
        <div className="flex justify-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => haptic.impact('light')}
            className="relative overflow-hidden text-left rounded-2xl"
            style={{
              width: '48%',
              height: 110,
              background: PATH_CATEGORIES[4].gradient,
            }}
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <p
                className="text-white font-bold leading-tight"
                style={{ fontSize: 17 }}
              >
                {PATH_CATEGORIES[4].title}
              </p>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── ChatsTab ─────────────────────────────────────────────────────────────────
interface ChatCardProps {
  title: string;
  desc: React.ReactNode;
  icon: LucideIcon;
  buttonLabel: string;
  onPress: () => void;
}

function ChatCard({
  title,
  desc,
  icon: Icon,
  buttonLabel,
  onPress,
}: ChatCardProps) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="p-4" style={{ background: ACCENT_GRAD }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1" style={{ fontSize: 15 }}>
              {title}
            </h3>
            <p className="text-white/70 text-xs leading-relaxed mb-3">{desc}</p>
            <button
              type="button"
              onClick={onPress}
              className="px-4 py-2 rounded-lg font-bold uppercase tracking-wide active:scale-95 transition-transform bg-white"
              style={{ fontSize: 11, color: ACCENT }}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function ChatsTab() {
  const { haptic } = useTelegram();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [joinedDecade, setJoinedDecade] = useState(false);

  return (
    <div className="min-h-screen bg-th-bg pb-24">
      <div className="px-4 pt-6">
        <p className="text-th/50 text-sm text-center mb-1">
          В этом разделе собраны все чаты клуба
        </p>
        <h1 className="text-th font-bold text-center text-2xl mb-2">
          Всё общение в одном месте
        </h1>
        <p className="text-th/50 text-xs text-center mb-6 leading-relaxed">
          Здесь ты знаешь, где{' '}
          <span className="font-semibold text-th/70">
            задать вопрос, получить поддержку
          </span>{' '}
          и быть на связи с сообществом
        </p>

        <div className="space-y-3">
          {/* 1. Приложение KOD */}
          <ChatCard
            title="Приложение KOD"
            desc={
              <>
                <span className="font-bold text-white/90">
                  Тебе доступна подписка
                </span>{' '}
                на наше приложение ментального здоровья
              </>
            }
            icon={Smartphone}
            buttonLabel="получить доступ"
            onPress={() => haptic.impact('light')}
          />

          {/* 2. Основной канал */}
          <ChatCard
            title="Основной канал клуба"
            desc={
              <>
                <span className="font-bold text-white/90">
                  Здесь все важные новости клуба,
                </span>{' '}
                анонсы эфиров и ключевые обновления.{' '}
                <span className="font-bold text-white/90">
                  Рекомендуем закрепить этот канал.
                </span>
              </>
            }
            icon={Megaphone}
            buttonLabel="вступить"
            onPress={() => haptic.impact('light')}
          />

          {/* 3. Чат города (expandable) */}
          <GlassCard className="overflow-hidden">
            <div className="p-4" style={{ background: ACCENT_GRAD }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-white font-bold mb-1"
                    style={{ fontSize: 15 }}
                  >
                    Чат города
                  </h3>
                  <p className="text-white/70 text-xs leading-relaxed mb-3">
                    Пространство для общения с{' '}
                    <span className="font-bold text-white/90">
                      участниками из твоего города,
                    </span>{' '}
                    встреч и живого контакта рядом
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      haptic.selection();
                      setShowCitySelector(!showCitySelector);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold uppercase tracking-wide active:scale-95 transition-transform bg-white"
                    style={{ fontSize: 11, color: ACCENT }}
                  >
                    вступить в чат города
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${showCitySelector ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <AnimatePresence>
              {showCitySelector && (
                <motion.div
                  key="city-selector"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 bg-th-raised">
                    <p
                      className="text-th/60 font-semibold mb-2"
                      style={{ fontSize: 11 }}
                    >
                      Выберите город
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {MOCK_CITIES.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            haptic.selection();
                            setSelectedCity(city);
                          }}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                          style={
                            selectedCity === city
                              ? { background: ACCENT, color: 'white' }
                              : {
                                  background: 'rgba(255,255,255,0.05)',
                                  color: 'rgba(255,255,255,0.6)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                }
                          }
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                    {selectedCity && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          haptic.notification('success');
                          setShowCitySelector(false);
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background: ACCENT_GRAD }}
                      >
                        Вступить в чат {selectedCity}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* 4. Десятка */}
          <GlassCard className="overflow-hidden">
            <div className="p-4" style={{ background: ACCENT_GRAD }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-white font-bold mb-1"
                    style={{ fontSize: 15 }}
                  >
                    Десятка
                  </h3>
                  <p className="text-white/70 text-xs leading-relaxed mb-1">
                    <span className="font-bold text-white/90">
                      Твоя малая группа
                    </span>{' '}
                    для роста, поддержки и совместной работы внутри клуба
                  </p>
                  <p className="text-white/50 mb-3" style={{ fontSize: 10 }}>
                    *десятка формируется внутри чата города
                  </p>
                  {joinedDecade ? (
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-white" />
                      <span className="text-white text-xs font-semibold">
                        Вы в десятке!
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        haptic.notification('success');
                        setJoinedDecade(true);
                      }}
                      className="px-4 py-2 rounded-lg font-bold uppercase tracking-wide active:scale-95 transition-transform bg-white"
                      style={{ fontSize: 11, color: ACCENT }}
                    >
                      вступить в десятку
                    </button>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 5. Служба заботы */}
          <ChatCard
            title="Служба заботы"
            desc={
              <>
                <span className="font-bold text-white/90">
                  Мы рядом, если возник вопрос.
                </span>{' '}
                Напиши — тебе обязательно ответят
              </>
            }
            icon={Shield}
            buttonLabel="перейти в бот"
            onPress={() => haptic.impact('light')}
          />
        </div>
      </div>
    </div>
  );
}

// ─── RatingsTab ───────────────────────────────────────────────────────────────
function RatingsTab() {
  const { haptic } = useTelegram();
  const [showHistory, setShowHistory] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  return (
    <div className="min-h-screen bg-th-bg pb-24">
      <div className="px-4 pt-6">
        <p className="text-th/50 text-sm text-center mb-1">
          Здесь ты видишь свой
        </p>
        <h1 className="text-th font-bold text-center text-2xl mb-2">
          прогресс в клубе:
        </h1>
        <p className="text-th/50 text-xs text-center mb-6 leading-relaxed">
          Баллы за активность, участие и рост.{' '}
          <span className="font-semibold text-th/70">
            Баллы можно копить, использовать и отслеживать
          </span>{' '}
          вместе с другими участниками
        </p>

        {/* Balance card */}
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{ background: ACCENT_GRAD }}
        >
          <div className="flex items-start justify-between p-4">
            <div>
              <p
                className="text-white/70 font-semibold mb-1"
                style={{ fontSize: 11 }}
              >
                Текущий баланс
              </p>
              <p
                className="text-white leading-relaxed mb-3"
                style={{ fontSize: 11, maxWidth: 140 }}
              >
                <span className="font-bold">Твой личный счёт в клубе.</span>{' '}
                <span className="text-white/70">
                  Энергии отражают твою активность
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  haptic.impact('light');
                  setShowHistory(!showHistory);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <Clock className="w-3 h-3 text-white" />
                <span
                  className="text-white font-semibold"
                  style={{ fontSize: 10 }}
                >
                  История начислений
                </span>
              </button>
            </div>
            <div className="text-right">
              <p
                className="text-white font-bold leading-none"
                style={{ fontSize: 46 }}
              >
                {MOCK_USER.energies}
              </p>
              <p className="text-white/70 text-base">энергий</p>
            </div>
          </div>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                key="history"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mx-4 h-px bg-white/20 mb-3" />
                <div className="px-4 pb-4 space-y-2">
                  {HISTORY.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white" style={{ fontSize: 13 }}>
                          {h.desc}
                        </p>
                        <p className="text-white/50" style={{ fontSize: 11 }}>
                          {h.date}
                        </p>
                      </div>
                      <span className="text-green-300 font-bold text-sm">
                        +{h.energies} ⚡
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global leaderboard */}
        <div className="mb-4">
          <SectionHeader icon={Zap} title="Общий рейтинг" />
          <p className="text-th/40 text-xs mb-3">
            Общий рейтинг участников клуба — твой прогресс в общем движении
          </p>
          <div className="h-px bg-th-border/5 mb-3" />
          <div className="space-y-2">
            {(showFullLeaderboard ? LEADERBOARD : LEADERBOARD.slice(0, 5)).map(
              (entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={
                    entry.isMe
                      ? {
                          background: `${ACCENT}20`,
                          border: `1px solid ${ACCENT}40`,
                        }
                      : {
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="font-bold w-5"
                      style={{
                        fontSize: 12,
                        color: entry.isMe ? ACCENT : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {i + 1}.
                    </span>
                    <div>
                      <p
                        className="font-medium"
                        style={{
                          fontSize: 13,
                          color: entry.isMe ? ACCENT : 'white',
                        }}
                      >
                        {entry.name}
                        {entry.isMe ? ' (Вы)' : ''}
                      </p>
                      <p className="text-th/40 text-xs">{entry.city}</p>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: entry.isMe ? ACCENT : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {entry.energies.toLocaleString('ru-RU')} ⚡
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div
              className="px-3 py-1.5 rounded-lg font-bold text-white"
              style={{ fontSize: 12, background: ACCENT_GRAD }}
            >
              Ваше место: 7
            </div>
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setShowFullLeaderboard(!showFullLeaderboard);
              }}
              className="text-xs text-th/50 underline"
            >
              {showFullLeaderboard ? 'Показать ТОП-5' : 'Показать весь рейтинг'}
            </button>
          </div>
        </div>

        {/* City + Team ratings (2-col) */}
        <div className="mb-4">
          <SectionHeader icon={Trophy} title="Рейтинг города и десяток" />
          <p className="text-th/40 text-xs mb-3">
            Рейтинг внутри твоего города или десятки. Малые шаги, которые дают
            большой рост.
          </p>
          <div className="h-px bg-th-border/5 mb-3" />
          <div className="grid grid-cols-2 gap-3">
            {/* Cities */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: ACCENT_GRAD,
                border: `1px solid ${ACCENT}40`,
                minHeight: 162,
              }}
            >
              <div className="p-3">
                <p className="text-white font-bold text-xs mb-2">
                  Рейтинг городов
                </p>
                <div className="h-px bg-white/20 mb-2" />
                <div className="space-y-1">
                  {CITY_RATINGS.map((item, i) => (
                    <div
                      key={item.city}
                      className="flex items-center justify-between text-white/80"
                      style={{ fontSize: 10 }}
                    >
                      <span className="truncate">{item.city}</span>
                      <span>{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="w-full py-1 rounded-lg text-center bg-white/90">
                  <p
                    className="font-bold"
                    style={{ fontSize: 10, color: ACCENT }}
                  >
                    Ваш город: 1
                  </p>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: ACCENT_GRAD,
                border: `1px solid ${ACCENT}40`,
                minHeight: 162,
              }}
            >
              <div className="p-3">
                <p className="text-white font-bold text-xs mb-2">
                  Рейтинг десяток
                </p>
                <div className="h-px bg-white/20 mb-2" />
                <div className="space-y-1">
                  {TEAM_RATINGS.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-white/80"
                      style={{ fontSize: 10 }}
                    >
                      <span className="truncate">{item.name}</span>
                      <span>{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="w-full py-1 rounded-lg text-center bg-white/90">
                  <p
                    className="font-bold"
                    style={{ fontSize: 10, color: ACCENT }}
                  >
                    Ваша десятка: 5
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shop banner */}
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{ background: ACCENT_GRAD, border: `1px solid ${ACCENT}40` }}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <h3
                className="text-white font-bold mb-1"
                style={{ fontSize: 17, lineHeight: 1.2 }}
              >
                Магазин энергий
              </h3>
              <p className="text-white/70 text-xs leading-relaxed mb-3">
                Здесь ты можешь обменивать баллы{' '}
                <span className="font-bold text-white/90">
                  на бонусы, подарки и возможности клуба
                </span>
              </p>
              <button
                type="button"
                onClick={() => haptic.impact('light')}
                className="px-5 py-2.5 rounded-lg font-bold uppercase tracking-wide active:scale-95 transition-transform bg-white"
                style={{ fontSize: 11, color: ACCENT }}
              >
                перейти в магазин
              </button>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center ml-3 flex-shrink-0">
              <Gift className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* How points are earned */}
        <div>
          <div className="h-px bg-th-border/5 mb-4" />
          <p className="text-th font-semibold text-sm text-center mb-1">
            Как начисляются баллы
          </p>
          <p className="text-th/40 text-xs text-center mb-4 leading-relaxed">
            Мы подготовили документ, где описали основные правила и возможности
            получения баллов
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => haptic.impact('light')}
              className="px-8 py-2.5 rounded-xl font-bold uppercase tracking-wide text-white active:scale-95 transition-transform"
              style={{ fontSize: 11, background: ACCENT_GRAD }}
            >
              ознакомиться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ProfileTab ───────────────────────────────────────────────────────────────
function ProfileTab({ onBack }: { onBack: () => void }) {
  const { haptic } = useTelegram();

  const links: { id: string; label: string; icon: LucideIcon }[] = [
    { id: 'channel', label: 'Канал клуба', icon: Megaphone },
    { id: 'chat', label: 'Общий чат', icon: MessageCircle },
    { id: 'docs', label: 'Договор-оферта', icon: BookOpen },
    { id: 'policy', label: 'Политика конфиденциальности', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-th-bg pb-28">
      <div className="pt-6 pb-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: ACCENT_GRAD }}
          >
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-th font-bold text-center text-2xl px-8 mb-2 leading-tight">
          Это твой личный кабинет в клубе.
        </h1>
        <p className="text-th/50 text-xs text-center px-8 mb-8 leading-relaxed">
          Здесь можно управлять своим профилем и подпиской
        </p>

        {/* User card */}
        <div className="px-4 mb-3">
          <GlassCard className="px-5 py-4">
            <p className="text-th/40 text-xs mb-1">Ваш профиль</p>
            <p className="text-th font-bold text-lg">
              {MOCK_USER.firstName} {MOCK_USER.lastName}
            </p>
            <p className="text-th/50 text-sm">{MOCK_USER.username}</p>
          </GlassCard>
        </div>

        {/* Subscription card */}
        <div className="px-4 mb-6">
          <div
            className="px-5 py-4 rounded-2xl"
            style={{ background: ACCENT_GRAD }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs mb-1">Подписка активна</p>
                <p className="text-white font-bold text-lg">
                  до {MOCK_USER.subscriptionExpires}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <p className="text-white/60 text-xs">
                Баланс: {MOCK_USER.energies} ⚡ энергий
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="px-4 mb-6">
          <p
            className="text-th/30 uppercase tracking-widest font-semibold mb-3"
            style={{ fontSize: 10 }}
          >
            Полезные ссылки
          </p>
          <GlassCard className="overflow-hidden">
            {links.map((link, i) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => haptic.impact('light')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  style={{
                    borderBottom:
                      i < links.length - 1
                        ? '1px solid rgba(255,255,255,0.05)'
                        : 'none',
                  }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: ACCENT }}
                  />
                  <span className="flex-1 text-th text-sm">{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-th/30" />
                </button>
              );
            })}
          </GlassCard>
        </div>

        {/* Exit */}
        <div className="px-4">
          <button
            type="button"
            onClick={() => {
              haptic.impact('light');
              onBack();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-th-border/5 text-th/50"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Вернуться к кейсам</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ClubDemo({ onBack }: ClubDemoProps) {
  const { haptic } = useTelegram();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const navTabs: { id: TabType; label: string; icon: LucideIcon }[] = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'path', label: 'Путь', icon: TrendingUp },
    { id: 'chats', label: 'Чаты', icon: MessageCircle },
    { id: 'ratings', label: 'Рейтинги', icon: Trophy },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  return (
    <div className="relative min-h-screen bg-th-bg">
      {activeTab === 'home' && <HomeTab onBack={onBack} />}
      {activeTab === 'path' && <PathTab />}
      {activeTab === 'chats' && <ChatsTab />}
      {activeTab === 'ratings' && <RatingsTab />}
      {activeTab === 'profile' && <ProfileTab onBack={onBack} />}

      {/* Bottom nav — glass dock */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t border-th-border/5"
        style={{
          height: 72,
          background: 'rgba(6,6,14,0.88)',
          boxShadow: '0 -8px 32px -4px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id !== activeTab) {
                    setActiveTab(tab.id);
                    requestAnimationFrame(() => haptic.selection());
                  }
                }}
                className="flex flex-col items-center justify-center transition-all active:scale-95 rounded-xl"
                style={
                  isActive
                    ? {
                        width: 68,
                        height: 56,
                        background: `${ACCENT}18`,
                        border: `1px solid ${ACCENT}35`,
                      }
                    : { width: 52 }
                }
              >
                <Icon
                  className="mb-1"
                  style={{
                    width: 15,
                    height: 15,
                    color: isActive ? ACCENT : 'rgba(255,255,255,0.45)',
                  }}
                />
                <span
                  className="text-center leading-none"
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '-0.3px',
                    color: isActive ? ACCENT : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
