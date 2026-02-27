'use client';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const hideBottomNav = useUIStore((s) => s.hideBottomNav);

  return (
    <main className={cn('relative z-10', !hideBottomNav && 'pb-28')}>
      {children}
    </main>
  );
}
