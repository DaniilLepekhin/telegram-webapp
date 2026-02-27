'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Crown,
  Home,
  Lock,
  Megaphone,
  MessageCircle,
  Search,
  TrendingUp,
  Trophy,
  User,
} from 'lucide-react';
import { useState } from 'react';

// ─── Design tokens — оригинальная палитра club_webapp ─────────────────────────
const CREAM = '#f7f1e8';
const DARK = '#2d2620';
const RED_GRAD =
  'linear-gradient(256.35deg, rgb(174, 30, 43) 15.72%, rgb(156, 23, 35) 99.39%)';
const RED_GRAD_NAV =
  'linear-gradient(261.695deg, rgb(174, 30, 43) 17.09%, rgb(156, 23, 35) 108.05%)';
const RED_BORDER = '#d93547';
const RED_DARK = '#9c1723';
const RED_BTN = '#a81b28';
const MUTED = '#6b5a4a';
const NAV_BG = 'rgb(45, 38, 32)';

// ─── Font helpers ─────────────────────────────────────────────────────────────
const SERIF = { fontFamily: 'Georgia, serif', fontWeight: 300 };
const SANS = { fontFamily: 'system-ui, sans-serif', fontWeight: 400 };
const SANS_BOLD = { fontFamily: 'system-ui, sans-serif', fontWeight: 700 };

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

const MOCK_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Новосибирск',
  'Екатеринбург',
  'Краснодар',
  'Самара',
];

const PATH_CATEGORIES = [
  {
    id: 'month-program',
    title: 'Программа месяца',
    color: 'rgba(156,23,35,0.12)',
  },
  { id: 'courses', title: 'Курсы', color: 'rgba(108,92,231,0.12)' },
  { id: 'podcasts', title: 'Подкасты', color: 'rgba(34,211,238,0.12)' },
  { id: 'streams', title: 'Эфиры (записи)', color: 'rgba(245,158,11,0.12)' },
  { id: 'practices', title: 'Практики', color: 'rgba(52,211,153,0.12)' },
];

// ─── Кнопка (кремовый фон, красный текст) ────────────────────────────────────
function CreamButton({
  children,
  onClick,
  px = 20,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  px?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="active:scale-[0.98] transition-transform"
      style={{
        background: CREAM,
        ...SANS_BOLD,
        fontSize: '11.14px',
        color: RED_BTN,
        textTransform: 'uppercase',
        border: 'none',
        boxShadow: '0 4px 12px rgba(33,23,10,0.3)',
        paddingLeft: px,
        paddingRight: px,
        paddingTop: 12,
        paddingBottom: 12,
        borderRadius: '5.73px',
      }}
    >
      {children}
    </button>
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
    <div className="min-h-screen pb-24" style={{ background: CREAM }}>
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-3 left-4 z-30 flex items-center gap-1.5 active:opacity-60 transition-opacity"
        style={{ color: MUTED }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        <span style={{ ...SANS, fontSize: '13px', color: MUTED }}>Кейсы</span>
      </button>

      <div className="px-[29px] pt-10">
        {/* Search */}
        <div
          className="w-full flex items-center mb-5"
          style={{ height: 40, background: DARK, borderRadius: '8px' }}
        >
          <Search
            className="ml-3 flex-shrink-0"
            style={{ width: 18, height: 18, color: CREAM, opacity: 0.7 }}
          />
          <span
            className="flex-1 px-3"
            style={{ ...SANS, fontSize: '14px', color: `${CREAM}99` }}
          >
            Поиск...
          </span>
        </div>

        {/* Referral block (locked) */}
        <div
          className="w-full mb-6 relative overflow-hidden opacity-60"
          style={{
            borderRadius: '8px',
            border: `1px solid ${RED_BORDER}`,
            background: RED_GRAD,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(247,241,232,0.9)' }}
              >
                <Lock style={{ width: 24, height: 24, color: RED_DARK }} />
              </div>
              <p
                style={{
                  ...SANS_BOLD,
                  fontSize: '12px',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Скоро откроется
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="relative flex-shrink-0"
                style={{ width: 44, height: 44 }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                />
                <div
                  className="absolute rounded-full flex items-center justify-center"
                  style={{
                    inset: '4px',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <span
                    style={{
                      ...SANS_BOLD,
                      fontSize: '9px',
                      color: 'white',
                      letterSpacing: '0.5px',
                    }}
                  >
                    КОД
                  </span>
                </div>
              </div>
              <p
                style={{
                  ...SANS,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: CREAM,
                }}
              >
                Пригласи друга в клуб КОД ДЕНЕГ
              </p>
            </div>
            <div className="w-full h-[1px] bg-white/20 mb-4" />
            <div
              className="w-full flex items-center px-4 py-3"
              style={{
                borderRadius: '8px',
                border: '1px solid white',
                background: CREAM,
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    ...SANS_BOLD,
                    fontSize: '11px',
                    color: DARK,
                    marginBottom: 4,
                  }}
                >
                  Отправьте эту ссылку другу
                </p>
                <p
                  className="truncate"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: DARK,
                  }}
                >
                  {referralLink}
                </p>
              </div>
              <button
                type="button"
                disabled
                onClick={handleCopy}
                className="flex-shrink-0 flex items-center justify-center ml-3 p-2 rounded-lg opacity-40 cursor-not-allowed"
              >
                {copied ? (
                  <Check style={{ width: 18, height: 18, color: DARK }} />
                ) : (
                  <Copy style={{ width: 18, height: 18, color: DARK }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center mb-6">
          <p
            style={{
              ...SERIF,
              fontSize: 'clamp(40px, 10vw, 54px)',
              lineHeight: 0.95,
              letterSpacing: '-0.06em',
              color: DARK,
              marginBottom: 8,
            }}
          >
            Привет, {MOCK_USER.firstName}!
          </p>
          <p
            style={{
              ...SERIF,
              fontSize: 'clamp(16px, 4vw, 21px)',
              lineHeight: 0.95,
              letterSpacing: '-0.06em',
              color: DARK,
            }}
          >
            Ты в пространстве клуба «Код Успеха»
          </p>
        </div>

        {/* Balance card */}
        <div
          className="w-full mb-6 relative overflow-hidden"
          style={{ borderRadius: '8px', background: RED_GRAD, minHeight: 100 }}
        >
          <div className="relative z-10 flex justify-between p-4">
            <p
              style={{
                ...SERIF,
                fontSize: 'clamp(20px, 5vw, 24px)',
                color: CREAM,
              }}
            >
              Мой баланс
            </p>
            <div className="text-right">
              <p
                style={{
                  ...SANS_BOLD,
                  fontSize: 'clamp(40px, 10vw, 48px)',
                  color: CREAM,
                  lineHeight: 1,
                }}
              >
                {MOCK_USER.energies}
              </p>
              <p
                style={{
                  ...SANS,
                  fontSize: 'clamp(16px, 4vw, 19px)',
                  color: CREAM,
                }}
              >
                энергий
              </p>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <p
              style={{
                ...SERIF,
                fontSize: 'clamp(18px, 4vw, 21px)',
                lineHeight: 0.95,
                letterSpacing: '-0.06em',
                color: DARK,
              }}
            >
              Анонсы
            </p>
            <Megaphone style={{ width: 20, height: 20, color: RED_DARK }} />
          </div>
          <div
            className="w-full h-[1px] mb-4"
            style={{ background: `${DARK}33` }}
          />

          {/* Leader test */}
          <div
            className="w-full mb-3 cursor-pointer active:scale-[0.99] transition-transform"
            style={{
              borderRadius: '8px',
              border: `1px solid ${RED_BORDER}`,
              background: RED_GRAD,
              padding: '16px',
            }}
            onClick={() => haptic.impact('light')}
            onKeyDown={() => {}}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <Crown style={{ width: 20, height: 20, color: CREAM }} />
              </div>
              <div className="flex-1">
                <p
                  style={{
                    ...SANS_BOLD,
                    fontSize: '15px',
                    color: CREAM,
                    marginBottom: 2,
                  }}
                >
                  Тест на Лидера десятки
                </p>
                <p
                  style={{
                    ...SANS,
                    fontSize: '12px',
                    color: 'rgba(247,241,232,0.8)',
                  }}
                >
                  Пройди тест и стань лидером группы
                </p>
              </div>
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: CREAM }}
              >
                <span style={{ color: RED_DARK, fontSize: '14px' }}>→</span>
              </div>
            </div>
          </div>

          {/* Weekly survey */}
          <div
            className="p-4"
            style={{
              borderRadius: '8px',
              border: `1px solid ${DARK}22`,
              background: 'rgba(255,255,255,0.5)',
            }}
          >
            <p
              style={{
                ...SANS_BOLD,
                fontSize: '14px',
                color: DARK,
                marginBottom: 4,
              }}
            >
              📋 Еженедельный опрос
            </p>
            <p
              style={{
                ...SANS,
                fontSize: '12px',
                color: MUTED,
                marginBottom: 12,
              }}
            >
              Как ты оцениваешь прошлую неделю? Поставь «светофор»
            </p>
            <div className="flex gap-2">
              {['🔴', '🟡', '🟢'].map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  whileTap={{ scale: 1.2 }}
                  onClick={() => haptic.selection()}
                  className="flex-1 py-2.5 rounded-xl text-2xl"
                  style={{
                    background: `${DARK}0a`,
                    border: `1px solid ${DARK}15`,
                  }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copy toast */}
      {copied && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl"
          style={{
            background: 'rgba(45,38,32,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(247,241,232,0.1)',
          }}
        >
          <p
            style={{
              ...SANS,
              fontWeight: 500,
              fontSize: '14px',
              color: CREAM,
              textAlign: 'center',
            }}
          >
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
    <div className="min-h-screen pb-28" style={{ background: CREAM }}>
      <div
        className="pt-[23px] max-w-2xl mx-auto"
        style={{ paddingLeft: 29, paddingRight: 29 }}
      >
        <h1
          className="text-center"
          style={{
            ...SERIF,
            fontSize: '45.8px',
            lineHeight: 0.95,
            letterSpacing: '-2.75px',
            color: DARK,
            marginBottom: 16,
          }}
        >
          Здесь твой обучающий путь:
        </h1>
        <p
          className="text-center"
          style={{
            ...SANS,
            fontSize: '13px',
            lineHeight: 1.45,
            letterSpacing: '-0.26px',
            color: DARK,
            marginBottom: 24,
            maxWidth: 341,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <span style={{ fontWeight: 700 }}>
            Уроки, эфиры и практики, которые ведут к ментальному и материальному
            росту,
          </span>{' '}
          помогают выстроить мышление, систему действий и устойчивый доход.
        </p>

        {/* 2×2 grid */}
        <div className="grid grid-cols-2 mb-[5px]" style={{ gap: 5 }}>
          {PATH_CATEGORIES.slice(0, 4).map((cat) => (
            <motion.div
              key={cat.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => haptic.impact('light')}
              className="relative overflow-hidden cursor-pointer flex flex-col"
              style={{
                borderRadius: '5.73px',
                border: `0.955px solid ${RED_BORDER}`,
                aspectRatio: '165 / 160',
              }}
            >
              {/* Image placeholder (top 55%) */}
              <div
                style={{
                  flex: '0 0 55%',
                  borderTopLeftRadius: '5.73px',
                  borderTopRightRadius: '5.73px',
                  background: cat.color,
                }}
              />
              {/* Red label (bottom 45%) */}
              <div
                className="relative flex-1 flex flex-col justify-center items-center"
                style={{
                  background: RED_GRAD,
                  borderBottomLeftRadius: '5.73px',
                  borderBottomRightRadius: '5.73px',
                }}
              >
                <div
                  className="absolute left-3 right-3"
                  style={{
                    top: 8,
                    height: 1,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }}
                />
                <p
                  className="text-center px-2"
                  style={{
                    ...SERIF,
                    fontSize: '22.39px',
                    lineHeight: 1.05,
                    color: CREAM,
                  }}
                >
                  {cat.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Centred 5th card */}
        <div className="flex justify-center">
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => haptic.impact('light')}
            className="relative overflow-hidden cursor-pointer flex flex-col"
            style={{
              width: 165,
              borderRadius: '5.73px',
              border: `0.955px solid ${RED_BORDER}`,
              aspectRatio: '165 / 160',
            }}
          >
            <div
              style={{
                flex: '0 0 55%',
                borderTopLeftRadius: '5.73px',
                borderTopRightRadius: '5.73px',
                background: PATH_CATEGORIES[4].color,
              }}
            />
            <div
              className="relative flex-1 flex flex-col justify-center items-center"
              style={{
                background: RED_GRAD,
                borderBottomLeftRadius: '5.73px',
                borderBottomRightRadius: '5.73px',
              }}
            >
              <div
                className="absolute left-3 right-3"
                style={{
                  top: 8,
                  height: 1,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
              <p
                className="text-center px-2"
                style={{
                  ...SERIF,
                  fontSize: '22.39px',
                  lineHeight: 1.05,
                  color: CREAM,
                }}
              >
                {PATH_CATEGORIES[4].title}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── ChatsTab ─────────────────────────────────────────────────────────────────
function ChatsTab() {
  const { haptic } = useTelegram();
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [joinedDecade, setJoinedDecade] = useState(false);

  return (
    <div className="min-h-screen pb-28" style={{ background: CREAM }}>
      <div
        className="pt-[23px] max-w-2xl mx-auto"
        style={{ paddingLeft: 29, paddingRight: 29 }}
      >
        {/* Header */}
        <p
          className="text-center"
          style={{
            ...SANS,
            fontSize: '13px',
            lineHeight: 1.45,
            letterSpacing: '-0.26px',
            color: DARK,
            marginBottom: 8,
          }}
        >
          В этом разделе собраны все чаты клуба
        </p>
        <h1
          className="text-center"
          style={{
            ...SERIF,
            fontSize: '45.8px',
            lineHeight: 0.95,
            letterSpacing: '-2.75px',
            color: DARK,
            marginBottom: 16,
          }}
        >
          всё общение в одном месте
        </h1>
        <p
          className="text-center"
          style={{
            ...SANS,
            fontSize: '13px',
            lineHeight: 1.45,
            letterSpacing: '-0.26px',
            color: DARK,
            marginBottom: 24,
            maxWidth: 341,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Здесь ты всегда знаешь, где{' '}
          <span style={{ fontWeight: 700 }}>
            задать вопрос, получить поддержку
          </span>{' '}
          и быть на связи с сообществом.
        </p>

        <div className="flex flex-col gap-[10px]">
          {/* 1. Приложение KOD */}
          <div
            className="relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
            onClick={() => haptic.impact('light')}
            onKeyDown={() => {}}
            style={{
              borderRadius: '5.73px',
              border: `0.955px solid ${RED_BORDER}`,
              background: RED_GRAD,
              minHeight: 185,
              marginTop: 10,
            }}
          >
            <div
              className="absolute overflow-hidden"
              style={{
                right: 0,
                top: -15,
                bottom: -15,
                width: '45%',
                opacity: 0.06,
                background: 'white',
              }}
            />
            <div className="relative z-10 p-4 pr-2" style={{ maxWidth: '55%' }}>
              <h3
                style={{
                  ...SERIF,
                  fontSize: '19.4px',
                  lineHeight: 1.05,
                  color: CREAM,
                  marginBottom: 8,
                }}
              >
                Приложение KOD
              </h3>
              <p
                style={{
                  ...SANS,
                  fontSize: '10px',
                  lineHeight: 1.4,
                  color: CREAM,
                  marginBottom: 12,
                }}
              >
                <span style={{ fontWeight: 700 }}>Тебе доступна подписка</span>{' '}
                на наше приложение ментального здоровья
              </p>
              <CreamButton px={20}>получить доступ</CreamButton>
            </div>
          </div>

          {/* 2. Основной канал */}
          <div
            className="relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
            onClick={() => haptic.impact('light')}
            onKeyDown={() => {}}
            style={{
              borderRadius: '5.73px',
              border: `0.955px solid ${RED_BORDER}`,
              background: RED_GRAD,
              minHeight: 230,
            }}
          >
            <div
              className="absolute overflow-hidden"
              style={{
                right: 0,
                top: -15,
                bottom: -15,
                width: '50%',
                opacity: 0.06,
                background: 'white',
              }}
            />
            <div className="relative z-10 p-4 pr-2" style={{ maxWidth: '50%' }}>
              <h3
                style={{
                  ...SERIF,
                  fontSize: '19.4px',
                  lineHeight: 1.05,
                  color: CREAM,
                  marginBottom: 8,
                }}
              >
                Основной канал клуба
              </h3>
              <p
                style={{
                  ...SANS,
                  fontSize: '10px',
                  lineHeight: 1.4,
                  color: CREAM,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontWeight: 700 }}>
                  Здесь все важные новости клуба,
                </span>{' '}
                анонсы эфиров и ключевые обновления.{' '}
                <span style={{ fontWeight: 700 }}>
                  Рекомендуем быть здесь всегда и закрепить этот канал.
                </span>
              </p>
              <CreamButton px={32}>вступить</CreamButton>
            </div>
          </div>

          {/* 3. Чат города */}
          <div>
            <div
              className="relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => {
                haptic.impact('light');
                setShowCitySelector(!showCitySelector);
              }}
              onKeyDown={() => {}}
              style={{
                borderRadius: '5.73px',
                border: `0.955px solid ${RED_BORDER}`,
                background: RED_GRAD,
                minHeight: 190,
              }}
            >
              <div
                className="absolute overflow-hidden"
                style={{
                  right: 0,
                  top: -15,
                  bottom: -15,
                  width: '50%',
                  opacity: 0.06,
                  background: 'white',
                }}
              />
              <div
                className="relative z-10 p-4 pr-2"
                style={{ maxWidth: '50%' }}
              >
                <h3
                  style={{
                    ...SERIF,
                    fontSize: '19.4px',
                    lineHeight: 1.05,
                    color: CREAM,
                    marginBottom: 8,
                  }}
                >
                  Чат города
                </h3>
                <p
                  style={{
                    ...SANS,
                    fontSize: '10px',
                    lineHeight: 1.4,
                    color: CREAM,
                    marginBottom: 12,
                  }}
                >
                  Пространство для общения с{' '}
                  <span style={{ fontWeight: 700 }}>
                    участниками из твоего города,
                  </span>{' '}
                  встреч и живого контакта рядом
                </p>
                <CreamButton px={16}>вступить в чат города</CreamButton>
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
                  <div
                    className="mt-2 p-4 rounded-lg"
                    style={{
                      background: 'rgba(247,241,232,0.95)',
                      border: `1px solid ${RED_BORDER}`,
                    }}
                  >
                    <p
                      className="mb-3"
                      style={{
                        ...SANS,
                        fontWeight: 600,
                        fontSize: '12px',
                        color: DARK,
                      }}
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
                              ? { background: RED_DARK, color: 'white' }
                              : {
                                  background: `${DARK}0d`,
                                  color: DARK,
                                  border: `1px solid ${DARK}22`,
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
                        className="w-full py-3 rounded-lg text-center"
                        style={{
                          background: RED_GRAD,
                          ...SANS_BOLD,
                          fontSize: '14px',
                          color: CREAM,
                          textTransform: 'uppercase',
                        }}
                      >
                        Вступить в чат {selectedCity}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Десятка */}
          <div>
            <div
              className="relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
              onClick={() => {
                if (!joinedDecade) {
                  haptic.notification('success');
                  setJoinedDecade(true);
                }
              }}
              onKeyDown={() => {}}
              style={{
                borderRadius: '5.73px',
                border: `0.955px solid ${RED_BORDER}`,
                background: RED_GRAD,
                minHeight: 200,
              }}
            >
              <div
                className="absolute overflow-hidden"
                style={{
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '45%',
                  opacity: 0.06,
                  background: 'white',
                }}
              />
              <div
                className="relative z-10 p-4 pr-2"
                style={{ maxWidth: '55%' }}
              >
                <h3
                  style={{
                    ...SERIF,
                    fontSize: '19.4px',
                    lineHeight: 1.05,
                    color: CREAM,
                    marginBottom: 8,
                  }}
                >
                  Десятка
                </h3>
                <p
                  style={{
                    ...SANS,
                    fontSize: '10px',
                    lineHeight: 1.4,
                    color: CREAM,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Твоя малая группа</span> для
                  роста, поддержки и совместной работы внутри клуба.
                </p>
                <p
                  style={{
                    ...SANS,
                    fontSize: '9px',
                    lineHeight: 1.4,
                    color: CREAM,
                    marginBottom: 12,
                  }}
                >
                  *десятка формируется внутри чата города
                </p>
                {joinedDecade ? (
                  <div className="flex items-center gap-1.5">
                    <Check style={{ width: 16, height: 16, color: CREAM }} />
                    <span
                      style={{ ...SANS_BOLD, fontSize: '12px', color: CREAM }}
                    >
                      Вы в десятке!
                    </span>
                  </div>
                ) : (
                  <CreamButton px={16}>вступить в десятку</CreamButton>
                )}
              </div>
            </div>
          </div>

          {/* 5. Служба заботы */}
          <div
            className="relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
            onClick={() => haptic.impact('light')}
            onKeyDown={() => {}}
            style={{
              borderRadius: '5.73px',
              border: `0.955px solid ${RED_BORDER}`,
              background: RED_GRAD,
              minHeight: 190,
            }}
          >
            <div
              className="absolute overflow-hidden"
              style={{
                right: 0,
                top: -15,
                bottom: -15,
                width: '50%',
                opacity: 0.06,
                background: 'white',
              }}
            />
            <div className="relative z-10 p-4 pr-2" style={{ maxWidth: '50%' }}>
              <h3
                style={{
                  ...SERIF,
                  fontSize: '19.4px',
                  lineHeight: 1.05,
                  color: CREAM,
                  marginBottom: 8,
                }}
              >
                Служба заботы
              </h3>
              <p
                style={{
                  ...SANS,
                  fontSize: '10px',
                  lineHeight: 1.4,
                  color: CREAM,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontWeight: 700 }}>
                  Мы рядом, если возник вопрос или нужна помощь.
                </span>{' '}
                Напиши — тебе обязательно ответят
              </p>
              <CreamButton px={20}>перейти в бот</CreamButton>
            </div>
          </div>
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
    <div className="min-h-screen pb-28" style={{ background: CREAM }}>
      <div
        className="pt-[23px] max-w-2xl mx-auto"
        style={{ paddingLeft: 29, paddingRight: 29 }}
      >
        {/* Header */}
        <p
          className="text-center"
          style={{
            ...SERIF,
            fontSize: '23.9px',
            lineHeight: 0.95,
            letterSpacing: '-1.43px',
            color: DARK,
            marginBottom: 4,
          }}
        >
          Здесь ты видишь свой
        </p>
        <h1
          className="text-center"
          style={{
            ...SERIF,
            fontSize: '45.4px',
            lineHeight: 0.95,
            letterSpacing: '-2.73px',
            color: DARK,
            marginBottom: 16,
          }}
        >
          прогресс в клубе:
        </h1>
        <p
          className="text-center"
          style={{
            ...SANS,
            fontSize: '13px',
            lineHeight: 1.45,
            letterSpacing: '-0.26px',
            color: DARK,
            marginBottom: 24,
            maxWidth: 317,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Баллы за активность, участие и рост.{' '}
          <span style={{ fontWeight: 700 }}>
            Баллы можно копить, использовать и отслеживать своё движение
          </span>{' '}
          вместе с другими участниками
        </p>

        {/* Balance card */}
        <div
          className="relative overflow-hidden mb-6"
          style={{
            borderRadius: '5.73px',
            background: RED_GRAD,
            minHeight: 115,
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div style={{ maxWidth: '50%' }}>
              <p
                style={{
                  ...SERIF,
                  fontSize: '21.6px',
                  color: CREAM,
                  marginBottom: 4,
                }}
              >
                Текущий баланс
              </p>
              <p
                style={{
                  ...SANS_BOLD,
                  fontSize: '10px',
                  lineHeight: 1.4,
                  color: CREAM,
                  marginBottom: 8,
                }}
              >
                Твой личный счёт в клубе.{' '}
                <span style={{ fontWeight: 400 }}>
                  Энергии (баллы) отражают твою активность и движение вперёд
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  haptic.impact('light');
                  setShowHistory(!showHistory);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 active:scale-[0.98] transition-transform"
                style={{
                  background: 'rgba(247,241,232,0.15)',
                  border: '1px solid rgba(247,241,232,0.3)',
                  borderRadius: '5.73px',
                }}
              >
                <Clock style={{ width: 14, height: 14, color: CREAM }} />
                <span style={{ ...SANS_BOLD, fontSize: '10px', color: CREAM }}>
                  История начислений
                </span>
              </button>
            </div>
            <div className="text-right">
              <p
                style={{
                  ...SANS_BOLD,
                  fontSize: '46.4px',
                  color: CREAM,
                  lineHeight: 1,
                }}
              >
                {MOCK_USER.energies}
              </p>
              <p style={{ ...SANS, fontSize: '18.6px', color: CREAM }}>
                энергий
              </p>
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
                <div className="mx-4 h-[1px] mb-3 bg-white/20" />
                <div className="px-4 pb-4 space-y-2">
                  {HISTORY.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p style={{ ...SANS, fontSize: '13px', color: CREAM }}>
                          {h.desc}
                        </p>
                        <p
                          style={{
                            ...SANS,
                            fontSize: '11px',
                            color: 'rgba(247,241,232,0.6)',
                          }}
                        >
                          {h.date}
                        </p>
                      </div>
                      <span
                        style={{
                          ...SANS_BOLD,
                          fontSize: '14px',
                          color: '#86efac',
                        }}
                      >
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
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <p
              style={{
                ...SERIF,
                fontSize: '21px',
                lineHeight: 0.95,
                letterSpacing: '-1.26px',
                color: DARK,
                textTransform: 'uppercase',
              }}
            >
              Общий рейтинг
            </p>
          </div>
          <p
            style={{
              ...SANS,
              fontSize: '10px',
              lineHeight: 1.45,
              letterSpacing: '-0.2px',
              color: DARK,
              marginBottom: 12,
            }}
          >
            Общий рейтинг участников клуба — твой прогресс в общем движении.
          </p>
          <div
            className="w-full h-[1px] mb-4"
            style={{ background: `${DARK}33` }}
          />
          <div className="space-y-2">
            {(showFullLeaderboard ? LEADERBOARD : LEADERBOARD.slice(0, 5)).map(
              (entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-2"
                  style={{
                    ...SANS,
                    fontWeight: entry.isMe ? 700 : 400,
                    fontSize: '14px',
                    lineHeight: 1.45,
                    letterSpacing: '-0.28px',
                    color: entry.isMe ? RED_DARK : DARK,
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      style={{
                        fontWeight: 700,
                        minWidth: 28,
                        color: entry.isMe ? RED_DARK : MUTED,
                        fontSize: '13px',
                      }}
                    >
                      {i + 1}.
                    </span>
                    <span className="truncate">
                      {entry.name}
                      {entry.isMe ? ' (Вы)' : ''}
                    </span>
                  </div>
                  <span
                    style={{
                      fontWeight: entry.isMe ? 700 : 400,
                      minWidth: 80,
                      textAlign: 'right',
                    }}
                  >
                    {entry.energies.toLocaleString('ru-RU')} ⚡
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              className="px-4 py-2"
              style={{
                background: RED_GRAD,
                border: `0.955px solid ${RED_BORDER}`,
                borderRadius: '5.73px',
                ...SANS_BOLD,
                fontSize: '14px',
                color: 'white',
              }}
            >
              Ваше место: 7
            </button>
            <button
              type="button"
              onClick={() => {
                haptic.selection();
                setShowFullLeaderboard(!showFullLeaderboard);
              }}
              style={{
                ...SANS,
                fontSize: '11px',
                color: DARK,
                textDecoration: 'underline',
              }}
            >
              {showFullLeaderboard
                ? 'Показать только ТОП-5'
                : 'Показать весь рейтинг'}
            </button>
          </div>
        </div>

        {/* City + Team (2-col) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <p
              style={{
                ...SERIF,
                fontSize: '21px',
                lineHeight: 0.95,
                letterSpacing: '-1.26px',
                color: DARK,
              }}
            >
              Рейтинг города и десяток
            </p>
          </div>
          <p
            style={{
              ...SANS,
              fontSize: '10px',
              lineHeight: 1.45,
              letterSpacing: '-0.2px',
              color: DARK,
              marginBottom: 12,
              maxWidth: 217,
            }}
          >
            Рейтинг внутри твоего города или десятки. Малые шаги, которые дают
            большой рост.
          </p>
          <div
            className="w-full h-[1px] mb-4"
            style={{ background: `${DARK}33` }}
          />
          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {/* Cities */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: '5.73px',
                border: `0.955px solid ${RED_BORDER}`,
                background: RED_GRAD,
                height: 157,
              }}
            >
              <div className="p-3">
                <p
                  style={{
                    ...SANS_BOLD,
                    fontSize: '14px',
                    color: CREAM,
                    marginBottom: 8,
                  }}
                >
                  Рейтинг городов
                </p>
                <div className="w-full h-[1px] bg-white/20 mb-2" />
                <div className="space-y-0.5">
                  {CITY_RATINGS.map((item, i) => (
                    <div
                      key={item.city}
                      className="flex items-center justify-between"
                      style={{ ...SANS, fontSize: '10px', color: CREAM }}
                    >
                      <span className="truncate">{item.city}</span>
                      <span className="ml-1">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div
                  className="py-1 rounded-[5.73px] text-center"
                  style={{
                    background: CREAM,
                    border: `0.955px solid ${RED_BORDER}`,
                  }}
                >
                  <p
                    style={{
                      ...SANS_BOLD,
                      fontSize: '10.6px',
                      color: '#b82131',
                    }}
                  >
                    Ваш город: 1
                  </p>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: '5.73px',
                border: `0.955px solid ${RED_BORDER}`,
                background: RED_GRAD,
                height: 157,
              }}
            >
              <div className="p-3">
                <p
                  style={{
                    ...SANS_BOLD,
                    fontSize: '14px',
                    color: CREAM,
                    marginBottom: 8,
                  }}
                >
                  Рейтинг десяток
                </p>
                <div className="w-full h-[1px] bg-white/20 mb-2" />
                <div className="space-y-0.5">
                  {TEAM_RATINGS.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                      style={{ ...SANS, fontSize: '10px', color: CREAM }}
                    >
                      <span className="truncate">{item.name}</span>
                      <span className="ml-1">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div
                  className="py-1 rounded-[5.73px] text-center"
                  style={{
                    background: CREAM,
                    border: `0.955px solid ${RED_BORDER}`,
                  }}
                >
                  <p
                    style={{
                      ...SANS_BOLD,
                      fontSize: '10.6px',
                      color: '#b82131',
                    }}
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
          className="relative overflow-hidden mb-6"
          style={{
            borderRadius: '5.73px',
            border: `0.955px solid ${RED_BORDER}`,
            background: RED_GRAD,
            minHeight: 180,
          }}
        >
          <div
            className="absolute overflow-hidden"
            style={{
              right: 0,
              top: 0,
              bottom: 0,
              width: '35%',
              opacity: 0.06,
              background: 'white',
            }}
          />
          <div className="relative z-10 p-4" style={{ maxWidth: '55%' }}>
            <p
              style={{
                ...SERIF,
                fontSize: '19.4px',
                lineHeight: 1.05,
                color: CREAM,
                marginBottom: 4,
              }}
            >
              Магазин энергий
            </p>
            <p
              style={{
                ...SANS,
                fontSize: '10px',
                lineHeight: 1.4,
                color: CREAM,
                marginBottom: 16,
              }}
            >
              Здесь ты можешь обменивать баллы{' '}
              <span style={{ fontWeight: 700 }}>
                на бонусы, подарки и возможности клуба
              </span>
            </p>
            <CreamButton px={24} onClick={() => haptic.impact('light')}>
              перейти в магазин
            </CreamButton>
          </div>
        </div>

        {/* How points are earned */}
        <div className="mb-6">
          <div
            className="w-full h-[1px] mb-4"
            style={{ background: `${DARK}33` }}
          />
          <p
            className="text-center"
            style={{
              ...SERIF,
              fontSize: '21px',
              lineHeight: 0.95,
              letterSpacing: '-1.26px',
              color: DARK,
              marginBottom: 8,
            }}
          >
            Как начисляются баллы
          </p>
          <p
            className="text-center"
            style={{
              ...SANS,
              fontSize: '10px',
              lineHeight: 1.45,
              letterSpacing: '-0.2px',
              color: DARK,
              marginBottom: 16,
              maxWidth: 269,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            мы подготовили документ, где описали основные правила и возможности
            получений баллов
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => haptic.impact('light')}
              className="active:scale-[0.98] transition-transform"
              style={{
                background: RED_GRAD,
                ...SANS_BOLD,
                fontSize: '11.14px',
                color: CREAM,
                textTransform: 'uppercase',
                border: 'none',
                boxShadow: '0 4px 12px rgba(33,23,10,0.3)',
                paddingLeft: 32,
                paddingRight: 32,
                paddingTop: 12,
                paddingBottom: 12,
                borderRadius: '5.73px',
              }}
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

  const links = [
    { id: 'rules', label: 'Правила клуба' },
    { id: 'offer', label: 'Оферта' },
    { id: 'support', label: 'Служба заботы' },
  ];

  return (
    <div className="min-h-screen pb-28" style={{ background: CREAM }}>
      <div className="relative z-10 pt-[23px]">
        {/* Icon */}
        <div className="flex justify-center mb-[17px]">
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 37, height: 37, background: RED_DARK }}
          >
            <User style={{ width: 20, height: 20, color: CREAM }} />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-center mb-4"
          style={{
            ...SERIF,
            fontSize: '42.949px',
            lineHeight: 0.95,
            letterSpacing: '-2.5769px',
            color: DARK,
            maxWidth: 340,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Это твой личный кабинет в клубе.
        </h1>

        {/* Description */}
        <p
          className="text-center mb-6"
          style={{
            ...SANS,
            fontSize: '13px',
            lineHeight: 1.45,
            letterSpacing: '-0.26px',
            color: DARK,
            maxWidth: 269,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <span style={{ fontWeight: 700 }}>Здесь собрана вся информация</span>
          {' о тебе, твоём статусе, активности и прогрессе'}
        </p>

        {/* Profile card */}
        <div
          className="mx-[30px] mb-6 p-6"
          style={{ border: `1px solid ${DARK}`, borderRadius: '20px' }}
        >
          {/* Avatar + info */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="rounded-full flex-shrink-0"
              style={{ width: 93, height: 93, background: '#d9d9d9' }}
            />
            <div className="flex-1 flex flex-col items-center min-w-0">
              <p
                className="text-center break-words mb-2 w-full"
                style={{
                  ...SANS,
                  fontSize: '18px',
                  lineHeight: 1.3,
                  letterSpacing: '-0.36px',
                  color: DARK,
                }}
              >
                {MOCK_USER.firstName} {MOCK_USER.lastName}
              </p>
              <p
                className="text-center mb-4"
                style={{
                  ...SANS,
                  fontSize: '15.993px',
                  lineHeight: 1.45,
                  letterSpacing: '-0.32px',
                  color: DARK,
                }}
              >
                г. {MOCK_USER.city}
              </p>
              <div
                className="flex items-center justify-center"
                style={{
                  border: `0.955px solid ${RED_BORDER}`,
                  borderRadius: '5.731px',
                  background: RED_GRAD,
                  paddingLeft: 16,
                  paddingRight: 16,
                  height: 33,
                }}
              >
                <p
                  style={{
                    ...SANS_BOLD,
                    fontSize: '14px',
                    lineHeight: 1.45,
                    letterSpacing: '-0.28px',
                    color: 'white',
                  }}
                >
                  Участник
                </p>
              </div>
            </div>
          </div>

          {/* Balance mini-card */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: '8px',
              background: RED_GRAD,
              minHeight: 100,
            }}
          >
            <div className="relative z-10 flex justify-between p-4">
              <p
                style={{
                  ...SERIF,
                  fontSize: 'clamp(20px,5vw,24px)',
                  color: CREAM,
                }}
              >
                Мой баланс
              </p>
              <div className="text-right">
                <p
                  style={{
                    ...SANS_BOLD,
                    fontSize: 'clamp(40px,10vw,48px)',
                    color: CREAM,
                    lineHeight: 1,
                  }}
                >
                  {MOCK_USER.energies}
                </p>
                <p
                  style={{
                    ...SANS,
                    fontSize: 'clamp(16px,4vw,19px)',
                    color: CREAM,
                  }}
                >
                  энергий
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div
          className="mx-[30px] mb-6"
          style={{
            border: `1px solid ${DARK}`,
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <h2
            className="mb-3"
            style={{ ...SERIF, fontSize: '20px', color: DARK }}
          >
            Подписка
          </h2>
          <div className="flex items-center justify-between mb-2">
            <p
              style={{
                ...SANS,
                fontWeight: 600,
                fontSize: '15px',
                color: DARK,
              }}
            >
              Статус:
            </p>
            <div
              className="px-3 py-1 rounded-lg"
              style={{ background: RED_GRAD }}
            >
              <p style={{ ...SANS_BOLD, fontSize: '13px', color: '#fff' }}>
                Активна
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p
              style={{
                ...SANS,
                fontWeight: 600,
                fontSize: '15px',
                color: DARK,
              }}
            >
              Действует до:
            </p>
            <p style={{ ...SANS, fontSize: '15px', color: DARK }}>
              {MOCK_USER.subscriptionExpires}
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-[20px] px-[30px]">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => haptic.impact('light')}
              className="w-full text-center transition-all active:scale-95"
              style={{
                ...SANS,
                fontSize: '18.517px',
                lineHeight: 1.45,
                letterSpacing: '-0.37px',
                color: DARK,
                textDecoration: 'underline',
                textDecorationColor: DARK,
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Back */}
        <div className="px-[30px] mt-8">
          <button
            type="button"
            onClick={() => {
              haptic.impact('light');
              onBack();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all active:scale-95"
            style={{ border: `1px solid ${DARK}22`, color: MUTED }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            <span style={{ ...SANS, fontSize: '15px' }}>
              Вернуться к кейсам
            </span>
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
    <div className="relative min-h-screen" style={{ background: CREAM }}>
      {activeTab === 'home' && <HomeTab onBack={onBack} />}
      {activeTab === 'path' && <PathTab />}
      {activeTab === 'chats' && <ChatsTab />}
      {activeTab === 'ratings' && <RatingsTab />}
      {activeTab === 'profile' && <ProfileTab onBack={onBack} />}

      {/* Bottom nav — original style */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          height: 72,
          background: NAV_BG,
          borderRadius: '16.789px 16.789px 0 0',
        }}
      >
        <div className="flex items-center justify-around h-full px-[9px]">
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
                className="flex flex-col items-center justify-center transition-all active:scale-95"
                style={
                  isActive
                    ? {
                        width: 77,
                        height: 72,
                        background: RED_GRAD_NAV,
                        border: '1px solid #d03240',
                        borderRadius: '9px',
                      }
                    : { width: 61 }
                }
              >
                <Icon
                  className="mb-[4px]"
                  style={{
                    width: '15.326px',
                    height: '15.326px',
                    color: CREAM,
                  }}
                />
                <span
                  style={{
                    ...SANS,
                    fontWeight: 500,
                    fontSize: '11.931px',
                    lineHeight: 0.95,
                    letterSpacing: '-0.3579px',
                    color: CREAM,
                    textAlign: 'center',
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
