'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BarChart2, Link2, Zap, User, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';

const TABS = [
  { href: '/',             icon: Home,     label: 'Кейсы'    },
  { href: '/analytics',   icon: BarChart2, label: 'Метрики'  },
  { href: '/tracking',    icon: Link2,     label: 'Ссылки'   },
  { href: '/gamification',icon: Zap,       label: 'Прокачка' },
  { href: '/profile',     icon: User,      label: 'Профиль'  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { haptic, isFullscreen, requestFullscreen, exitFullscreen, tg } = useTelegram();

  const canFullscreen = tg?.isVersionAtLeast('8.0') ?? false;

  const handleToggleFullscreen = () => {
    haptic.impact('light');
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-surface-0/90 backdrop-blur-2xl" />
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.06]" />

      <div className="relative flex items-center justify-around px-1"
        style={{ paddingBottom: 'calc(0.5rem + var(--tg-safe-area-bottom, 0px))', paddingTop: '0.5rem' }}>
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => haptic.selection()}
              className="relative flex flex-col items-center gap-[3px] min-w-[52px] py-1"
            >
              {active && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute -inset-1.5 rounded-2xl bg-brand-500/12"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={cn(
                  'relative w-[22px] h-[22px] transition-colors duration-150',
                  active ? 'text-brand-400' : 'text-white/28',
                )}
                strokeWidth={active ? 2.2 : 1.6}
              />
              <span className={cn(
                'relative text-[9px] font-semibold tracking-wide transition-colors duration-150',
                active ? 'text-brand-400' : 'text-white/28',
              )}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Fullscreen toggle */}
        {canFullscreen && (
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="relative flex flex-col items-center gap-[3px] min-w-[40px] py-1"
            title={isFullscreen ? 'Свернуть' : 'На весь экран'}
          >
            {isFullscreen
              ? <Minimize2 className="w-[20px] h-[20px] text-white/40" strokeWidth={1.6} />
              : <Maximize2 className="w-[20px] h-[20px] text-white/40" strokeWidth={1.6} />
            }
            <span className="text-[8px] text-white/28 font-semibold">
              {isFullscreen ? 'Выход' : 'Экран'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
