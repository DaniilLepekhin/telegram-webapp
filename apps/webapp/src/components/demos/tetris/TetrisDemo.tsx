'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { MiniPiece, TetrisBoard } from './TetrisBoard';
import { TetrisControls } from './TetrisControls';
import { createInitialState, reducer, tickSpeed } from './tetris-engine';
import type { Action } from './tetris-engine';

interface TetrisDemoProps {
  onBack: () => void;
}

// Object container allows const + mutation — persists across component mounts
const sessionBestStore = { value: 0 };

export function TetrisDemo({ onBack }: TetrisDemoProps) {
  const { haptic } = useTelegram();
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [started, setStarted] = useState(false);
  // localBest is local state that triggers re-render when best improves
  const [localBest, setLocalBest] = useState(sessionBestStore.value);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const act = useCallback(
    (action: Action) => {
      dispatch(action);
      if (action === 'LEFT' || action === 'RIGHT' || action === 'ROTATE') {
        haptic.selection();
      } else if (action === 'HARD_DROP') {
        haptic.impact('medium');
      } else if (action === 'DOWN') {
        haptic.impact('light');
      }
    },
    [haptic],
  );

  // Gravity tick
  useEffect(() => {
    if (!started || state.isPaused || state.isOver) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    const ms = tickSpeed(state.level);
    tickRef.current = setInterval(() => dispatch('TICK'), ms);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [started, state.isPaused, state.isOver, state.level]);

  // Update session best — safe in effect, no render-time mutation
  useEffect(() => {
    if (state.score > sessionBestStore.value) {
      sessionBestStore.value = state.score;
      setLocalBest(state.score);
    }
  }, [state.score]);

  // Haptic on line clear (detect score jumps)
  const prevLinesRef = useRef(state.lines);
  useEffect(() => {
    const diff = state.lines - prevLinesRef.current;
    if (diff > 0) {
      haptic.notification(diff >= 4 ? 'success' : 'warning');
    }
    prevLinesRef.current = state.lines;
  }, [state.lines, haptic]);

  // Haptic on game over
  const wasOverRef = useRef(false);
  useEffect(() => {
    if (state.isOver && !wasOverRef.current) {
      haptic.notification('error');
    }
    wasOverRef.current = state.isOver;
  }, [state.isOver, haptic]);

  // Keyboard support (desktop preview)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Action> = {
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        ArrowDown: 'DOWN',
        ArrowUp: 'ROTATE',
        ' ': 'HARD_DROP',
        c: 'HOLD',
        C: 'HOLD',
        p: 'TOGGLE_PAUSE',
        P: 'TOGGLE_PAUSE',
      };
      if (map[e.key]) {
        e.preventDefault();
        act(map[e.key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [act]);

  // Swipe gesture on board
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    swipeRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeRef.current.x;
    const dy = t.clientY - swipeRef.current.y;
    const dt = Date.now() - swipeRef.current.t;
    swipeRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const isSwipe = Math.max(absDx, absDy) > 20;

    if (!isSwipe) {
      // Tap = rotate
      act('ROTATE');
      return;
    }

    // Fast flick down = hard drop
    if (absDy > absDx && dy > 0 && dt < 250 && absDy > 60) {
      act('HARD_DROP');
    } else if (absDx > absDy) {
      act(dx < 0 ? 'LEFT' : 'RIGHT');
    } else if (dy > 0) {
      act('DOWN');
    } else {
      act('ROTATE');
    }
  };

  const handleStart = () => {
    haptic.notification('success');
    dispatch('RESTART');
    setStarted(true);
  };

  return (
    <div className="relative min-h-screen bg-th-bg flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-th-bg/80 backdrop-blur-xl border-b border-th-border/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-th/60"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Кейсы</span>
          </button>

          <h1 className="text-sm font-bold text-th absolute left-1/2 -translate-x-1/2">
            Tetris
          </h1>

          <div className="flex items-center gap-1">
            {started && !state.isOver && (
              <button
                type="button"
                onClick={() => act('TOGGLE_PAUSE')}
                className="glass p-2 rounded-xl"
              >
                {state.isPaused ? (
                  <Play className="w-4 h-4 text-th/60" />
                ) : (
                  <Pause className="w-4 h-4 text-th/60" />
                )}
              </button>
            )}
            {started && (
              <button
                type="button"
                onClick={handleStart}
                className="glass p-2 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 text-th/60" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 pt-3 pb-4 flex flex-col gap-3 max-w-sm mx-auto w-full">
        {/* Score row */}
        <div className="grid grid-cols-3 gap-2">
          <ScoreCard
            label="Счёт"
            value={state.score.toLocaleString('ru-RU')}
            highlight
          />
          <ScoreCard label="Уровень" value={String(state.level)} />
          <ScoreCard label="Линии" value={String(state.lines)} />
        </div>

        {/* Main area: board + sidebar */}
        <div className="flex gap-2 items-start">
          {/* Board */}
          <div
            className="flex-1 touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <TetrisBoard state={state} />
          </div>

          {/* Sidebar */}
          <div className="w-16 flex flex-col gap-2">
            <MiniPiece type={state.next} label="Next" />
            <MiniPiece type={state.held} label="Hold" dimmed={!state.canHold} />
            {/* Best score */}
            <div className="glass rounded-xl p-2 flex flex-col items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <p className="text-[9px] text-th/30 font-semibold uppercase tracking-wider text-center">
                Best
              </p>
              <p className="text-[10px] font-bold text-amber-400 text-center leading-tight">
                {localBest.toLocaleString('ru-RU')}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        {started && (
          <TetrisControls
            onAction={act}
            isPaused={state.isPaused}
            isOver={state.isOver}
          />
        )}

        {/* Game over actions */}
        <AnimatePresence>
          {state.isOver && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg active:scale-[0.97] transition-transform"
              >
                Играть снова
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start screen */}
        <AnimatePresence>
          {!started && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center bg-th-bg/80 backdrop-blur-sm z-20"
            >
              <div className="text-center px-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  className="text-7xl mb-6"
                >
                  🎮
                </motion.div>
                <h2 className="text-2xl font-black text-th mb-2">Tetris</h2>
                <p className="text-sm text-th/40 mb-8 leading-relaxed">
                  Тап — поворот · Свайп — движение
                  <br />
                  Быстрый свайп вниз — сброс
                </p>
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-10 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg active:scale-[0.97] transition-transform"
                >
                  Играть
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'glass-card p-2 text-center',
        highlight && 'border border-brand-500/20',
      )}
    >
      <p className="text-[9px] text-th/30 font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p
        className={cn(
          'text-sm font-bold mt-0.5',
          highlight ? 'text-brand-300' : 'text-th',
        )}
      >
        {value}
      </p>
    </div>
  );
}
