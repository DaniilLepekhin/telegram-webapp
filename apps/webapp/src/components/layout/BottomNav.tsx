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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3"
      style={{ paddingBottom: 'calc(0.5rem + var(--tg-safe-area-bottom, 0px))' }}>

      {/* Floating dock container */}
      <div className="dock rounded-2xl mx-auto max-w-md">
        <div className="relative flex items-center justify-around px-2 py-2">
          {TABS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => haptic.selection()}
                className="relative flex flex-col items-center gap-[2px] min-w-[48px] py-1.5 rounded-xl z-10"
              >
                {active && (
                  <motion.div
                    layoutId="dock-pill"
                    className="absolute inset-0 dock-indicator rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    'relative w-5 h-5 transition-colors duration-150',
                    active ? 'text-brand-400 drop-shadow-[0_0_6px_rgba(108,92,231,0.5)]' : 'text-white/30',
                  )}
                  strokeWidth={active ? 2.2 : 1.5}
                />
                <span className={cn(
                  'relative text-[9px] font-semibold transition-colors duration-150',
                  active ? 'text-brand-300' : 'text-white/25',
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
              onClick={() => {
                haptic.impact('light');
                isFullscreen ? exitFullscreen() : requestFullscreen();
              }}
              className="relative flex flex-col items-center gap-[2px] min-w-[36px] py-1.5 rounded-xl"
            >
              {isFullscreen
                ? <Minimize2 className="w-4 h-4 text-white/30" strokeWidth={1.5} />
                : <Maximize2 className="w-4 h-4 text-white/30" strokeWidth={1.5} />
              }
              <span className="text-[8px] text-white/20 font-semibold">
                {isFullscreen ? 'Выход' : 'Экран'}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
