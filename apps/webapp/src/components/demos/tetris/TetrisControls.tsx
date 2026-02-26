'use client';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import type { Action } from './tetris-engine';

interface TetrisControlsProps {
  onAction: (action: Action) => void;
  isPaused: boolean;
  isOver: boolean;
}

export function TetrisControls({ onAction, isOver }: TetrisControlsProps) {
  const btn = (action: Action, children: React.ReactNode, className = '') => (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        onAction(action);
      }}
      className={`glass active:scale-90 active:bg-white/10 transition-all select-none touch-none
        flex items-center justify-center rounded-2xl text-th/60 ${className}`}
    >
      {children}
    </button>
  );

  if (isOver) return null;

  return (
    <div className="w-full select-none">
      {/* Row 1: Rotate (center) */}
      <div className="flex justify-center mb-2">
        {btn('ROTATE', <RefreshCw className="w-5 h-5" />, 'w-16 h-12')}
      </div>

      {/* Row 2: Left | Hard Drop | Right */}
      <div className="grid grid-cols-3 gap-2">
        {btn('LEFT', <ChevronLeft className="w-6 h-6" />, 'h-14')}
        {btn(
          'HARD_DROP',
          <div className="flex flex-col items-center gap-0.5">
            <ChevronDown className="w-5 h-5 -mb-1" />
            <ChevronDown className="w-5 h-5" />
          </div>,
          'h-14',
        )}
        {btn('RIGHT', <ChevronRight className="w-6 h-6" />, 'h-14')}
      </div>

      {/* Row 3: Soft drop */}
      <div className="flex justify-center mt-2">
        {btn(
          'DOWN',
          <div className="flex items-center gap-1 text-xs font-semibold text-th/40">
            <ChevronDown className="w-4 h-4" /> Шаг вниз
          </div>,
          'w-full h-10',
        )}
      </div>
    </div>
  );
}
