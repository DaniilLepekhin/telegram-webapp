'use client';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const hideBottomNav = useUIStore((s) => s.hideBottomNav);

  return (
    <main
      className={cn('relative z-10 overflow-y-auto', !hideBottomNav && 'pb-28')}
      style={{
        height: '100dvh',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        overscrollBehavior: 'contain',
      }}
    >
      {children}
    </main>
  );
}
