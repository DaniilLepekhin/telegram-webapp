'use client';

import { cn } from '@/lib/utils';
import {
  COLS,
  PIECE_TW,
  PIECE_TW_GLOW,
  ROWS,
  getShape,
  ghostY,
} from './tetris-engine';
import type { GameState } from './tetris-engine';

interface TetrisBoardProps {
  state: GameState;
}

export function TetrisBoard({ state }: TetrisBoardProps) {
  const { board, current, isOver } = state;

  // Build display grid: board cells + ghost + active piece
  const display: string[] = board.flatMap((row) =>
    row.map((cell) => (cell ? PIECE_TW[cell] : '')),
  );

  // Ghost piece (where piece will land)
  if (!isOver) {
    const gy = ghostY(board, current);
    const shape = getShape(current.type, current.rotation);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const bx = current.x + c;
        const by = gy + r;
        if (
          by >= 0 &&
          by < ROWS &&
          bx >= 0 &&
          bx < COLS &&
          !display[by * COLS + bx]
        ) {
          display[by * COLS + bx] = `ghost-${current.type}`;
        }
      }
    }
  }

  // Active piece on top
  if (!isOver) {
    const shape = getShape(current.type, current.rotation);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const bx = current.x + c;
        const by = current.y + r;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
          display[by * COLS + bx] = `active-${current.type}`;
        }
      }
    }
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/[0.06]"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        aspectRatio: `${COLS} / ${ROWS}`,
        width: '100%',
        background: 'rgba(0,0,0,0.35)',
      }}
    >
      {display.map((cell, i) => {
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const key = `${row}-${col}`;

        if (!cell) {
          return <div key={key} className="border border-white/[0.025]" />;
        }

        if (cell.startsWith('ghost-')) {
          const type = cell.slice(6) as keyof typeof PIECE_TW;
          return (
            <div
              key={key}
              className={cn(
                'border border-white/[0.025] rounded-[1px]',
                PIECE_TW[type],
                'opacity-20',
              )}
            />
          );
        }

        if (cell.startsWith('active-')) {
          const type = cell.slice(7) as keyof typeof PIECE_TW;
          return (
            <div
              key={key}
              className={cn(
                'border border-white/10 rounded-[1px]',
                PIECE_TW[type],
                PIECE_TW_GLOW[type],
              )}
            />
          );
        }

        // Locked board cell
        return (
          <div
            key={key}
            className={cn(
              'border border-white/[0.06] rounded-[1px] opacity-90',
              cell,
            )}
          />
        );
      })}

      {/* Game over overlay */}
      {isOver && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-2xl font-black text-white mb-1">GAME OVER</p>
            <p className="text-sm text-white/50">
              Счёт: {state.score.toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mini preview for next / hold piece ──────────────────────────────────────

interface MiniPieceProps {
  type: string | null;
  label: string;
  dimmed?: boolean;
}

export function MiniPiece({ type, label, dimmed = false }: MiniPieceProps) {
  const shape = type ? getShape(type as keyof typeof PIECE_TW, 0) : null;
  const color = type ? PIECE_TW[type as keyof typeof PIECE_TW] : null;

  return (
    <div
      className={cn(
        'glass rounded-xl p-2 transition-opacity',
        dimmed && 'opacity-40',
      )}
    >
      <p className="text-[9px] text-th/30 font-semibold uppercase tracking-wider mb-1.5 text-center">
        {label}
      </p>
      <div className="flex items-center justify-center h-10">
        {shape && color ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${shape[0].length}, 11px)`,
              gridTemplateRows: `repeat(${shape.length}, 11px)`,
              gap: '1px',
            }}
          >
            {shape.flatMap((row, r) =>
              row.map((filled, c) => (
                <div
                  key={`mini-${label}-${type}-${r * 4 + c}`}
                  className={cn(
                    'rounded-[1px]',
                    filled ? color : 'bg-transparent',
                  )}
                />
              )),
            )}
          </div>
        ) : (
          <span className="text-th/15 text-xs">—</span>
        )}
      </div>
    </div>
  );
}
