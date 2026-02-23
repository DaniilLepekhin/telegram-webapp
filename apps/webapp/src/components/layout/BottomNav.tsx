'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BarChart3, Link2, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';

const NAV_ITEMS = [
  { href: '/',             icon: Home,     label: 'Кейсы'     },
  { href: '/analytics',   icon: BarChart3, label: 'Аналитика' },
  { href: '/tracking',    icon: Link2,     label: 'Ссылки'    },
  { href: '/gamification',icon: Trophy,    label: 'Прокачка'  },
  { href: '/profile',     icon: User,      label: 'Профиль'   },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { haptic } = useTelegram();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-2 mb-2">
        <div className="glass-strong rounded-3xl px-2 py-2 flex items-center justify-around">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => haptic.selection()}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all relative min-w-[56px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-brand-500/20 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-5 h-5 relative z-10 transition-colors',
                    isActive ? 'text-brand-400' : 'text-white/30',
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium relative z-10 transition-colors',
                    isActive ? 'text-brand-400' : 'text-white/30',
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
