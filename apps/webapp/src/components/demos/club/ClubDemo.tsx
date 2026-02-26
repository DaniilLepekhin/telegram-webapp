'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Crown,
  Gift,
  HeadphonesIcon,
  Heart,
  Home,
  Lock,
  LogOut,
  Megaphone,
  MessageCircle,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// ─── Design tokens (from egiazarova/club_webapp) ─────────────────────────────
const C = {
  bg: '#f0ece8',
  bgLight: '#f7f1e8',
  text: '#2d2620',
  cream: '#f7f1e8',
  red: '#9c1723',
  redLight: '#d93547',
  redBorder: '#d03240',
  navBg: '#2d2620',
};
const redGrad =
  'linear-gradient(243.413deg, rgb(174, 30, 43) 15.721%, rgb(156, 23, 35) 99.389%)';
const redGradHoriz =
  'linear-gradient(261.695deg, rgb(174, 30, 43) 17.09%, rgb(156, 23, 35) 108.05%)';
const serifFont = '"TT Nooks", Georgia, serif';
const bodyFont = 'Gilroy, system-ui, sans-serif';

type TabType = 'home' | 'path' | 'meditations' | 'ratings' | 'profile';

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

const MEDITATIONS = [
  {
    id: '1',
    title: 'Утренняя медитация',
    subtitle: 'Начни день с ясностью',
    duration: '10',
    category: 'Утро',
  },
  {
    id: '2',
    title: 'Медитация на деньги',
    subtitle: 'Программирование изобилия',
    duration: '15',
    category: 'Деньги',
  },
  {
    id: '3',
    title: 'Исцеление тела',
    subtitle: 'Глубокое расслабление',
    duration: '20',
    category: 'Здоровье',
  },
  {
    id: '4',
    title: 'Практика благодарности',
    subtitle: 'Открытость к добру',
    duration: '8',
    category: 'Духовность',
  },
  {
    id: '5',
    title: 'Ночная медитация',
    subtitle: 'Глубокий восстановительный сон',
    duration: '25',
    category: 'Сон',
  },
];

const PATH_CATEGORIES = [
  {
    id: 'month-program',
    title: 'Программа\nмесяца',
    gradient: 'linear-gradient(135deg, #ae1e2b, #9c1723)',
    locked: false,
  },
  {
    id: 'courses',
    title: 'Курсы',
    gradient: 'linear-gradient(135deg, #2d2620, #4a3728)',
    locked: false,
  },
  {
    id: 'podcasts',
    title: 'Подкасты',
    gradient: 'linear-gradient(135deg, #6b4c35, #9c7a5a)',
    locked: false,
  },
  {
    id: 'streams',
    title: 'Эфиры\n(записи)',
    gradient: 'linear-gradient(135deg, #1a3a5c, #2d6a9f)',
    locked: false,
  },
  {
    id: 'practices',
    title: 'Практики',
    gradient: 'linear-gradient(135deg, #2c5f2e, #57a85a)',
    locked: false,
  },
];

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
    <div
      className="min-h-screen pb-24 relative"
      style={{ backgroundColor: C.bg }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-3 left-4 z-30 flex items-center gap-1"
        style={{ color: `${C.text}80` }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        <span style={{ fontFamily: bodyFont, fontSize: 12 }}>Кейсы</span>
      </button>

      <div className="relative z-10 px-4 pt-10">
        {/* Search */}
        <div
          className="w-full h-[40px] flex items-center rounded-lg mb-5"
          style={{ background: C.navBg }}
        >
          <svg
            className="ml-3 flex-shrink-0 opacity-70"
            style={{ width: 18, height: 18, color: C.cream }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            role="presentation"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span
            className="flex-1 px-3 opacity-50"
            style={{
              fontFamily: bodyFont,
              fontWeight: 600,
              fontSize: 14,
              color: C.cream,
            }}
          >
            Поиск...
          </span>
        </div>

        {/* Referral block (locked) */}
        <div
          className="w-full mb-6 relative overflow-hidden opacity-60"
          style={{
            borderRadius: 8,
            border: `1px solid ${C.redLight}`,
            background: redGrad,
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{
              background: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.9)' }}
              >
                <Lock style={{ width: 24, height: 24, color: C.red }} />
              </div>
              <p
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 12,
                  color: 'white',
                }}
              >
                Скоро откроется
              </p>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex-shrink-0 rounded-full flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                }}
              >
                <span
                  style={{
                    fontFamily: bodyFont,
                    fontWeight: 700,
                    fontSize: 9,
                    color: 'white',
                    letterSpacing: '0.5px',
                  }}
                >
                  КОД
                </span>
              </div>
              <p
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 14,
                  color: C.cream,
                }}
              >
                Пригласи друга в клуб КОД ДЕНЕГ
              </p>
            </div>
            <div
              className="w-full h-px mb-4"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            />
            <div
              className="w-full flex items-center px-4 py-3"
              style={{
                borderRadius: 8,
                border: '1px solid white',
                background: C.bgLight,
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: bodyFont,
                    fontWeight: 600,
                    fontSize: 11,
                    color: C.text,
                    marginBottom: 4,
                  }}
                >
                  Отправьте эту ссылку другу
                </p>
                <p
                  className="truncate"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: C.text,
                  }}
                >
                  {referralLink}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-shrink-0 ml-3 p-2"
              >
                {copied ? (
                  <Check style={{ width: 18, height: 18, color: C.red }} />
                ) : (
                  <Copy style={{ width: 18, height: 18, color: C.text }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center mb-6">
          <p
            style={{
              fontFamily: serifFont,
              fontWeight: 300,
              fontSize: 'clamp(36px, 10vw, 50px)',
              lineHeight: 0.95,
              letterSpacing: '-0.06em',
              color: C.text,
              marginBottom: 8,
            }}
          >
            Привет, {MOCK_USER.firstName}!
          </p>
          <p
            style={{
              fontFamily: serifFont,
              fontWeight: 300,
              fontSize: 'clamp(15px, 4vw, 19px)',
              lineHeight: 1.1,
              letterSpacing: '-0.06em',
              color: C.text,
            }}
          >
            Ты в пространстве клуба «Код Успеха»
          </p>
        </div>

        {/* Energy balance card */}
        <div
          className="w-full mb-6 relative overflow-hidden"
          style={{ borderRadius: 8, background: redGrad, minHeight: 100 }}
        >
          <div
            className="absolute overflow-hidden"
            style={{
              left: 16,
              bottom: 12,
              width: 'min(45%, 170px)',
              height: 44,
              borderRadius: 6,
              border: '1px solid rgba(244,214,182,0.4)',
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          <div className="relative z-10 h-full flex justify-between p-4">
            <p
              style={{
                fontFamily: serifFont,
                fontWeight: 300,
                fontSize: 'clamp(18px,5vw,22px)',
                color: C.cream,
              }}
            >
              Мой баланс
            </p>
            <div className="text-right">
              <p
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 'clamp(38px,10vw,46px)',
                  color: C.cream,
                  lineHeight: 1,
                }}
              >
                {MOCK_USER.energies}
              </p>
              <p
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 400,
                  fontSize: 'clamp(14px,4vw,17px)',
                  color: C.cream,
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
                fontFamily: serifFont,
                fontWeight: 300,
                fontSize: 'clamp(17px,4vw,20px)',
                lineHeight: 0.95,
                letterSpacing: '-0.06em',
                color: C.text,
              }}
            >
              Анонсы
            </p>
            <Megaphone style={{ width: 20, height: 20, color: C.redLight }} />
          </div>
          <div
            className="w-full h-px mb-4"
            style={{ background: `${C.text}33` }}
          />

          {/* Leader test card */}
          <div
            className="w-full mb-3 relative overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
            style={{
              borderRadius: 8,
              border: `1px solid ${C.redLight}`,
              background: redGrad,
              padding: 16,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <Crown style={{ width: 20, height: 20, color: C.cream }} />
              </div>
              <div className="flex-1">
                <p
                  style={{
                    fontFamily: bodyFont,
                    fontWeight: 700,
                    fontSize: 15,
                    color: C.cream,
                    marginBottom: 2,
                  }}
                >
                  Тест на Лидера десятки
                </p>
                <p
                  style={{
                    fontFamily: bodyFont,
                    fontWeight: 400,
                    fontSize: 12,
                    color: 'rgba(247,241,232,0.8)',
                  }}
                >
                  Пройди тест и стань лидером группы
                </p>
              </div>
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: C.cream }}
              >
                <span style={{ color: C.red, fontSize: 14 }}>→</span>
              </div>
            </div>
          </div>

          {/* Weekly survey */}
          <div
            className="w-full"
            style={{
              borderRadius: 8,
              border: `1px solid ${C.text}20`,
              background: C.bgLight,
              padding: 16,
            }}
          >
            <p
              style={{
                fontFamily: bodyFont,
                fontWeight: 700,
                fontSize: 14,
                color: C.text,
                marginBottom: 4,
              }}
            >
              📋 Еженедельный опрос
            </p>
            <p
              style={{
                fontFamily: bodyFont,
                fontWeight: 400,
                fontSize: 12,
                color: `${C.text}99`,
              }}
            >
              Как ты оцениваешь прошлую неделю? Поставь «светофор»
            </p>
            <div className="flex gap-2 mt-3">
              {['🔴', '🟡', '🟢'].map((emoji) => (
                <motion.button
                  key={emoji}
                  type="button"
                  whileTap={{ scale: 1.2 }}
                  onClick={() => haptic.selection()}
                  className="flex-1 py-2.5 rounded-lg text-2xl"
                  style={{
                    background: `${C.text}10`,
                    border: `1px solid ${C.text}15`,
                  }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
              fontFamily: bodyFont,
              fontWeight: 500,
              fontSize: 14,
              color: C.cream,
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
    <div className="min-h-screen pb-24" style={{ backgroundColor: C.bg }}>
      <div className="px-4 pt-6">
        <p
          className="mb-1"
          style={{
            fontFamily: serifFont,
            fontWeight: 300,
            fontSize: 30,
            letterSpacing: '-0.05em',
            color: C.text,
          }}
        >
          Твой путь
        </p>
        <p
          className="mb-6"
          style={{ fontFamily: bodyFont, fontSize: 13, color: `${C.text}80` }}
        >
          Выбери раздел для изучения
        </p>

        <div className="grid grid-cols-2 gap-3">
          {PATH_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => haptic.impact('light')}
              className="relative overflow-hidden text-left"
              style={{
                borderRadius: 12,
                height: 110,
                background: cat.gradient,
              }}
            >
              {cat.locked && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.35)', zIndex: 2 }}
                >
                  <Lock style={{ width: 24, height: 24, color: 'white' }} />
                </div>
              )}
              <div
                className="absolute inset-0 p-4 flex flex-col justify-end"
                style={{ zIndex: 1 }}
              >
                <p
                  style={{
                    fontFamily: serifFont,
                    fontWeight: 300,
                    fontSize: 18,
                    lineHeight: 1.1,
                    letterSpacing: '-0.04em',
                    color: 'white',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {cat.title}
                </p>
              </div>
              <div
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MeditationsTab ───────────────────────────────────────────────────────────
function MeditationPlayer({
  meditation,
  onClose,
}: {
  meditation: (typeof MEDITATIONS)[0];
  onClose: () => void;
}) {
  const { haptic } = useTelegram();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalSeconds = Number.parseInt(meditation.duration) * 60;

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setPlaying(false);
          haptic.notification('success');
          return 100;
        }
        return p + 0.3;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [playing, haptic]);

  const elapsed = Math.floor((progress / 100) * totalSeconds);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: C.navBg }}
    >
      <div className="flex justify-center pt-3 pb-4">
        <div
          className="w-10 h-1 rounded-full"
          style={{ background: 'rgba(247,241,232,0.3)' }}
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="self-end mr-5 mb-2"
        style={{ color: `${C.cream}60`, fontFamily: bodyFont, fontSize: 18 }}
      >
        ✕
      </button>

      <div className="flex-1 flex flex-col items-center px-8">
        <div
          className="w-52 h-52 rounded-3xl mb-8 flex items-center justify-center"
          style={{ background: redGrad }}
        >
          <HeadphonesIcon
            style={{ width: 64, height: 64, color: C.cream, opacity: 0.7 }}
          />
        </div>

        <p
          style={{
            fontFamily: serifFont,
            fontWeight: 300,
            fontSize: 24,
            color: C.cream,
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          {meditation.title}
        </p>
        <p
          style={{
            fontFamily: bodyFont,
            fontSize: 13,
            color: `${C.cream}70`,
            marginBottom: 32,
          }}
        >
          {meditation.subtitle}
        </p>

        <div className="w-full mb-3">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(247,241,232,0.15)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ background: redGrad, width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span
              style={{
                fontFamily: bodyFont,
                fontSize: 12,
                color: `${C.cream}50`,
              }}
            >
              {mm}:{ss}
            </span>
            <span
              style={{
                fontFamily: bodyFont,
                fontSize: 12,
                color: `${C.cream}50`,
              }}
            >
              {meditation.duration} мин
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 mt-4">
          <button type="button" onClick={() => haptic.impact('light')}>
            <SkipBack
              style={{ width: 28, height: 28, color: `${C.cream}70` }}
            />
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setPlaying(!playing);
              haptic.impact('medium');
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: redGrad }}
          >
            {playing ? (
              <Pause style={{ width: 28, height: 28, color: C.cream }} />
            ) : (
              <Play
                style={{ width: 28, height: 28, color: C.cream, marginLeft: 3 }}
              />
            )}
          </motion.button>
          <button type="button" onClick={() => haptic.impact('light')}>
            <SkipForward
              style={{ width: 28, height: 28, color: `${C.cream}70` }}
            />
          </button>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 1.2 }}
          onClick={() => haptic.selection()}
          className="mt-8"
        >
          <Heart style={{ width: 24, height: 24, color: `${C.cream}50` }} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function MeditationsTab() {
  const { haptic } = useTelegram();
  const [selectedMeditation, setSelectedMeditation] = useState<
    (typeof MEDITATIONS)[0] | null
  >(null);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: C.bg }}>
      <div className="px-4 pt-6">
        <p
          className="mb-1"
          style={{
            fontFamily: serifFont,
            fontWeight: 300,
            fontSize: 30,
            letterSpacing: '-0.05em',
            color: C.text,
          }}
        >
          Медитации
        </p>
        <p
          className="mb-5"
          style={{ fontFamily: bodyFont, fontSize: 13, color: `${C.text}80` }}
        >
          Аудио-практики для роста и гармонии
        </p>

        <div className="space-y-2.5">
          {MEDITATIONS.map((m) => (
            <motion.button
              key={m.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedMeditation(m);
                haptic.impact('light');
              }}
              className="w-full text-left flex items-center gap-3 px-4 py-3.5"
              style={{
                borderRadius: 10,
                border: `1px solid ${C.text}15`,
                background: C.bgLight,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: redGrad }}
              >
                <HeadphonesIcon
                  style={{ width: 20, height: 20, color: C.cream }}
                />
              </div>
              <div className="flex-1">
                <p
                  style={{
                    fontFamily: bodyFont,
                    fontWeight: 600,
                    fontSize: 14,
                    color: C.text,
                  }}
                >
                  {m.title}
                </p>
                <p
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12,
                    color: `${C.text}60`,
                  }}
                >
                  {m.subtitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.red,
                    background: `${C.red}15`,
                  }}
                >
                  {m.category}
                </span>
                <span
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 11,
                    color: `${C.text}40`,
                  }}
                >
                  {m.duration} мин
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedMeditation && (
        <MeditationPlayer
          meditation={selectedMeditation}
          onClose={() => setSelectedMeditation(null)}
        />
      )}
    </div>
  );
}

// ─── RatingsTab ───────────────────────────────────────────────────────────────
function RatingsTab() {
  const { haptic } = useTelegram();
  const [tab, setTab] = useState<'global' | 'city'>('global');
  const [showHistory, setShowHistory] = useState(false);

  const historyItems = [
    { id: 'h1', desc: 'Просмотр медитации', energies: 10, date: '27 фев' },
    { id: 'h2', desc: 'Завершение урока', energies: 25, date: '26 фев' },
    { id: 'h3', desc: 'Практика благодарности', energies: 15, date: '25 фев' },
    { id: 'h4', desc: 'Реферальный бонус', energies: 50, date: '23 фев' },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: C.bg }}>
      <div className="px-4 pt-6">
        {/* Balance */}
        <div
          className="w-full mb-4 relative overflow-hidden"
          style={{
            borderRadius: 10,
            background: redGrad,
            padding: '16px 20px',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                style={{
                  fontFamily: bodyFont,
                  fontSize: 12,
                  color: 'rgba(247,241,232,0.7)',
                  marginBottom: 4,
                }}
              >
                Мой баланс
              </p>
              <p
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 700,
                  fontSize: 34,
                  color: C.cream,
                  lineHeight: 1,
                }}
              >
                {MOCK_USER.energies} ⚡
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                haptic.impact('light');
                setShowHistory(!showHistory);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Clock style={{ width: 14, height: 14, color: C.cream }} />
              <span
                style={{ fontFamily: bodyFont, fontSize: 12, color: C.cream }}
              >
                История
              </span>
            </button>
          </div>

          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 overflow-hidden"
            >
              <div
                className="w-full h-px mb-3"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              />
              <div className="space-y-2.5">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: bodyFont,
                          fontSize: 13,
                          color: C.cream,
                        }}
                      >
                        {item.desc}
                      </p>
                      <p
                        style={{
                          fontFamily: bodyFont,
                          fontSize: 11,
                          color: 'rgba(247,241,232,0.6)',
                        }}
                      >
                        {item.date}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: bodyFont,
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#a8f0a8',
                      }}
                    >
                      +{item.energies} ⚡
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Shop link */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => haptic.impact('light')}
          className="w-full mb-5 flex items-center gap-3 px-4 py-3"
          style={{
            borderRadius: 10,
            border: `1px solid ${C.text}20`,
            background: C.bgLight,
          }}
        >
          <Gift style={{ width: 22, height: 22, color: C.red }} />
          <div className="flex-1 text-left">
            <p
              style={{
                fontFamily: bodyFont,
                fontWeight: 700,
                fontSize: 14,
                color: C.text,
              }}
            >
              Магазин наград
            </p>
            <p
              style={{
                fontFamily: bodyFont,
                fontSize: 12,
                color: `${C.text}60`,
              }}
            >
              Трать энергии на призы и скидки
            </p>
          </div>
          <ChevronRight
            style={{ width: 16, height: 16, color: `${C.text}40` }}
          />
        </motion.button>

        {/* Tabs */}
        <div
          className="flex mb-4"
          style={{ borderBottom: `1px solid ${C.text}20` }}
        >
          {(
            [
              { id: 'global' as const, label: 'Глобальный' },
              { id: 'city' as const, label: 'По городам' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                haptic.selection();
              }}
              className="flex-1 pb-2.5 text-center"
              style={{
                fontFamily: bodyFont,
                fontWeight: tab === t.id ? 700 : 400,
                fontSize: 14,
                color: tab === t.id ? C.red : `${C.text}60`,
                borderBottom:
                  tab === t.id ? `2px solid ${C.red}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'global' && (
          <div className="space-y-2">
            {LEADERBOARD.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderRadius: 10,
                  background: entry.isMe ? `${C.red}15` : C.bgLight,
                  border: entry.isMe
                    ? `1px solid ${C.red}40`
                    : `1px solid ${C.text}10`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      fontFamily: bodyFont,
                      fontWeight: 700,
                      fontSize: 13,
                      color: entry.isMe ? C.red : `${C.text}60`,
                      minWidth: 24,
                    }}
                  >
                    {i + 1}.
                  </span>
                  <div>
                    <p
                      style={{
                        fontFamily: bodyFont,
                        fontWeight: entry.isMe ? 700 : 400,
                        fontSize: 14,
                        color: entry.isMe ? C.red : C.text,
                      }}
                    >
                      {entry.name}
                      {entry.isMe ? ' (Вы)' : ''}
                    </p>
                    <p
                      style={{
                        fontFamily: bodyFont,
                        fontSize: 11,
                        color: `${C.text}50`,
                      }}
                    >
                      {entry.city}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: bodyFont,
                    fontWeight: entry.isMe ? 700 : 400,
                    fontSize: 14,
                    color: entry.isMe ? C.red : C.text,
                  }}
                >
                  {entry.energies.toLocaleString('ru-RU')} ⚡
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'city' && (
          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${C.text}15`,
              background: C.bgLight,
              overflow: 'hidden',
            }}
          >
            {CITY_RATINGS.map((item, i) => (
              <div
                key={item.city}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom:
                    i < CITY_RATINGS.length - 1
                      ? `1px solid ${C.text}10`
                      : 'none',
                  background:
                    item.city === MOCK_USER.city ? `${C.red}08` : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      fontFamily: bodyFont,
                      fontWeight: 700,
                      fontSize: 18,
                      minWidth: 28,
                      color: `${C.text}40`,
                    }}
                  >
                    {i === 0
                      ? '🥇'
                      : i === 1
                        ? '🥈'
                        : i === 2
                          ? '🥉'
                          : `${i + 1}.`}
                  </span>
                  <p
                    style={{
                      fontFamily: bodyFont,
                      fontWeight: item.city === MOCK_USER.city ? 700 : 400,
                      fontSize: 14,
                      color: item.city === MOCK_USER.city ? C.red : C.text,
                    }}
                  >
                    {item.city}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 13,
                    color: `${C.text}70`,
                  }}
                >
                  {item.total.toLocaleString('ru-RU')} ⚡
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ProfileTab ───────────────────────────────────────────────────────────────
function ProfileTab({ onBack }: { onBack: () => void }) {
  const { haptic } = useTelegram();

  const links = [
    { id: 'channel', label: 'Канал клуба', icon: Megaphone },
    { id: 'chat', label: 'Общий чат', icon: MessageCircle },
    { id: 'docs', label: 'Договор-оферта', icon: BookOpen },
    { id: 'policy', label: 'Политика конфиденциальности', icon: Lock },
  ];

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: C.bgLight }}>
      <div className="relative z-10 pt-6 pb-8">
        {/* Profile icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: redGrad }}
          >
            <User style={{ width: 22, height: 22, color: C.cream }} />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-center px-8 mb-3"
          style={{
            fontFamily: serifFont,
            fontWeight: 300,
            fontSize: 36,
            lineHeight: 0.95,
            letterSpacing: '-0.06em',
            color: C.text,
          }}
        >
          Это твой личный кабинет в клубе.
        </h1>

        <p
          className="text-center px-8 mb-8"
          style={{
            fontFamily: bodyFont,
            fontSize: 13,
            color: `${C.text}70`,
            lineHeight: 1.45,
          }}
        >
          Здесь можно управлять своим профилем и подпиской
        </p>

        {/* User card */}
        <div className="px-4 mb-3">
          <div
            className="px-5 py-4"
            style={{
              borderRadius: 10,
              border: `1px solid ${C.text}20`,
              background: C.cream,
            }}
          >
            <p
              style={{
                fontFamily: bodyFont,
                fontWeight: 400,
                fontSize: 12,
                color: `${C.text}60`,
                marginBottom: 2,
              }}
            >
              Ваш профиль
            </p>
            <p
              style={{
                fontFamily: bodyFont,
                fontWeight: 700,
                fontSize: 17,
                color: C.text,
              }}
            >
              {MOCK_USER.firstName} {MOCK_USER.lastName}
            </p>
            <p
              style={{
                fontFamily: bodyFont,
                fontSize: 13,
                color: `${C.text}60`,
              }}
            >
              {MOCK_USER.username}
            </p>
          </div>
        </div>

        {/* Subscription */}
        <div className="px-4 mb-6">
          <div
            className="px-5 py-4"
            style={{ borderRadius: 10, background: redGrad }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 12,
                    color: 'rgba(247,241,232,0.7)',
                    marginBottom: 2,
                  }}
                >
                  Подписка активна
                </p>
                <p
                  style={{
                    fontFamily: bodyFont,
                    fontWeight: 700,
                    fontSize: 17,
                    color: C.cream,
                  }}
                >
                  до {MOCK_USER.subscriptionExpires}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <Zap style={{ width: 20, height: 20, color: C.cream }} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Sparkles
                style={{
                  width: 14,
                  height: 14,
                  color: 'rgba(247,241,232,0.7)',
                }}
              />
              <p
                style={{
                  fontFamily: bodyFont,
                  fontSize: 12,
                  color: 'rgba(247,241,232,0.7)',
                }}
              >
                Баланс: {MOCK_USER.energies} ⚡ энергий
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="px-4 mb-6">
          <p
            className="mb-3"
            style={{
              fontFamily: bodyFont,
              fontWeight: 600,
              fontSize: 12,
              color: `${C.text}50`,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}
          >
            Полезные ссылки
          </p>
          <div
            style={{
              borderRadius: 10,
              border: `1px solid ${C.text}15`,
              background: C.cream,
              overflow: 'hidden',
            }}
          >
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
                      i < links.length - 1 ? `1px solid ${C.text}10` : 'none',
                  }}
                >
                  <Icon
                    style={
                      {
                        width: 18,
                        height: 18,
                        color: C.red,
                        flexShrink: 0,
                      } as React.CSSProperties
                    }
                  />
                  <span
                    style={{
                      fontFamily: bodyFont,
                      fontSize: 14,
                      color: C.text,
                      flex: 1,
                    }}
                  >
                    {link.label}
                  </span>
                  <ChevronRight
                    style={{ width: 14, height: 14, color: `${C.text}30` }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Exit */}
        <div className="px-4">
          <button
            type="button"
            onClick={() => {
              haptic.impact('light');
              onBack();
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5"
            style={{
              borderRadius: 10,
              border: `1px solid ${C.text}20`,
              background: 'transparent',
            }}
          >
            <LogOut style={{ width: 18, height: 18, color: `${C.text}60` }} />
            <span
              style={{
                fontFamily: bodyFont,
                fontSize: 14,
                color: `${C.text}60`,
              }}
            >
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

  const navTabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
  }[] = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'path', label: 'Путь', icon: TrendingUp },
    { id: 'meditations', label: 'Практики', icon: HeadphonesIcon },
    { id: 'ratings', label: 'Рейтинги', icon: Trophy },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: C.bg }}>
      {activeTab === 'home' && <HomeTab onBack={onBack} />}
      {activeTab === 'path' && <PathTab />}
      {activeTab === 'meditations' && <MeditationsTab />}
      {activeTab === 'ratings' && <RatingsTab />}
      {activeTab === 'profile' && <ProfileTab onBack={onBack} />}

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          height: 72,
          background: C.navBg,
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
                        width: 72,
                        height: 72,
                        borderRadius: 9,
                        background: redGradHoriz,
                        border: `1px solid ${C.redBorder}`,
                      }
                    : { width: 56 }
                }
              >
                <Icon
                  style={{
                    width: 15,
                    height: 15,
                    color: C.cream,
                    marginBottom: 4,
                  }}
                />
                <span
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 10,
                    fontWeight: 500,
                    lineHeight: 0.95,
                    letterSpacing: '-0.3px',
                    color: C.cream,
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
