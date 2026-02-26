'use client';

import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useRef } from 'react';
import type { Action } from './tetris-engine';

/** DAS = Delayed Auto Shift: initial delay before auto-repeat starts */
const DAS_MS = 150;
/** ARR = Auto Repeat Rate: interval between repeated actions */
const ARR_MS = 50;

interface TetrisControlsProps {
  onAction: (action: Action) => void;
  isPaused: boolean;
  isOver: boolean;
}

export function TetrisControls({
  onAction,
  isPaused,
  isOver,
}: TetrisControlsProps) {
  const dasRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRepeat = useCallback(() => {
    if (dasRef.current) {
      clearTimeout(dasRef.current);
      dasRef.current = null;
    }
    if (arrRef.current) {
      clearInterval(arrRef.current);
      arrRef.current = null;
    }
  }, []);

  /** Press-and-hold button: fires once immediately, then repeats after DAS delay */
  const makeRepeatHandlers = useCallback(
    (action: Action) => ({
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        if (isPaused || isOver) return;
        stopRepeat();
        onAction(action);
        dasRef.current = setTimeout(() => {
          arrRef.current = setInterval(() => onAction(action), ARR_MS);
        }, DAS_MS);
      },
      onPointerUp: stopRepeat,
      onPointerLeave: stopRepeat,
      onPointerCancel: stopRepeat,
    }),
    [onAction, isPaused, isOver, stopRepeat],
  );

  /** Single-fire button (rotate, hard drop) */
  const makeSingleHandlers = useCallback(
    (action: Action) => ({
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        if (isPaused || isOver) return;
        onAction(action);
      },
    }),
    [onAction, isPaused, isOver],
  );

  if (isOver) return null;

  const disabled = isPaused;

  return (
    <div
      className={cn(
        'w-full select-none',
        disabled && 'opacity-40 pointer-events-none',
      )}
    >
      {/* Row 1: Rotate (center) */}
      <div className="flex justify-center mb-2">
        <button
          type="button"
          {...makeSingleHandlers('ROTATE')}
          className="glass active:scale-90 active:bg-white/10 transition-all touch-none
            flex items-center justify-center rounded-2xl text-th/60 w-16 h-12"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Row 2: Left | Hard Drop | Right */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          {...makeRepeatHandlers('LEFT')}
          className="glass active:scale-90 active:bg-white/10 transition-all touch-none
            flex items-center justify-center rounded-2xl text-th/60 h-14"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          {...makeSingleHandlers('HARD_DROP')}
          className="glass active:scale-90 active:bg-white/10 transition-all touch-none
            flex items-center justify-center rounded-2xl text-th/60 h-14"
        >
          <div className="flex flex-col items-center gap-0.5">
            <ChevronDown className="w-5 h-5 -mb-1" />
            <ChevronDown className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          {...makeRepeatHandlers('RIGHT')}
          className="glass active:scale-90 active:bg-white/10 transition-all touch-none
            flex items-center justify-center rounded-2xl text-th/60 h-14"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Row 3: Soft drop (repeat) */}
      <div className="flex justify-center mt-2">
        <button
          type="button"
          {...makeRepeatHandlers('DOWN')}
          className="glass active:scale-90 active:bg-white/10 transition-all touch-none
            flex items-center justify-center rounded-2xl text-th/60 w-full h-10"
        >
          <div className="flex items-center gap-1 text-xs font-semibold text-th/40">
            <ChevronDown className="w-4 h-4" /> Шаг вниз
          </div>
        </button>
      </div>
    </div>
  );
}
