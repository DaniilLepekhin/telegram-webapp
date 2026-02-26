// ─── Constants ───────────────────────────────────────────────────────────────
export const COLS = 10;
export const ROWS = 20;
export const TICK_MS_BASE = 800; // level 1 speed
export const TICK_MS_MIN = 80; // max speed
export const LINES_PER_LEVEL = 10;
export const POINTS = {
  1: 100,
  2: 300,
  3: 500,
  4: 800, // "Tetris"
  soft: 1,
  hard: 2,
} as const;

// ─── Piece definitions ───────────────────────────────────────────────────────
export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

/** Shape is a 2D boolean grid for each rotation state */
const SHAPES: Record<PieceType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
};

/** Neon color for each piece type (Nebula UI palette) */
export const PIECE_COLORS: Record<PieceType, string> = {
  I: '#06b6d4', // cyan
  O: '#eab308', // yellow
  T: '#a855f7', // purple
  S: '#22c55e', // green
  Z: '#ef4444', // red
  J: '#3b82f6', // blue
  L: '#f97316', // orange
};

/** Tailwind-friendly class names for ghost/preview rendering */
export const PIECE_TW: Record<PieceType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-400',
  S: 'bg-green-400',
  Z: 'bg-red-400',
  J: 'bg-blue-400',
  L: 'bg-orange-400',
};

export const PIECE_TW_GLOW: Record<PieceType, string> = {
  I: 'shadow-[0_0_6px_rgba(6,182,212,0.6)]',
  O: 'shadow-[0_0_6px_rgba(234,179,8,0.6)]',
  T: 'shadow-[0_0_6px_rgba(168,85,247,0.6)]',
  S: 'shadow-[0_0_6px_rgba(34,197,94,0.6)]',
  Z: 'shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  J: 'shadow-[0_0_6px_rgba(59,130,246,0.6)]',
  L: 'shadow-[0_0_6px_rgba(249,115,22,0.6)]',
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Piece {
  type: PieceType;
  rotation: number; // 0-3
  x: number; // col offset (can be negative)
  y: number; // row offset (can be negative, piece spawns above board)
}

/** null = empty cell, PieceType = filled with that piece's color */
export type Cell = PieceType | null;
export type Board = Cell[][];

export interface GameState {
  board: Board;
  current: Piece;
  next: PieceType;
  held: PieceType | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  isOver: boolean;
  isPaused: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null) as Cell[]);
}

const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

function randomPiece(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

export function getShape(type: PieceType, rotation: number): number[][] {
  return SHAPES[type][rotation % 4];
}

function spawn(type: PieceType): Piece {
  const shape = getShape(type, 0);
  return {
    type,
    rotation: 0,
    x: Math.floor((COLS - shape[0].length) / 2),
    y: -1, // start slightly above board
  };
}

function collides(board: Board, piece: Piece): boolean {
  const shape = getShape(piece.type, piece.rotation);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const bx = piece.x + c;
      const by = piece.y + r;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && board[by][bx] !== null) return true;
    }
  }
  return false;
}

function lock(board: Board, piece: Piece): Board {
  const next = board.map((row) => [...row]);
  const shape = getShape(piece.type, piece.rotation);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const bx = piece.x + c;
      const by = piece.y + r;
      if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
        next[by][bx] = piece.type;
      }
    }
  }
  return next;
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - remaining.length;
  const newRows = Array.from(
    { length: cleared },
    () => Array(COLS).fill(null) as Cell[],
  );
  return { board: [...newRows, ...remaining], cleared };
}

/** Find the lowest position this piece can drop to (for ghost piece) */
export function ghostY(board: Board, piece: Piece): number {
  let gy = piece.y;
  while (!collides(board, { ...piece, y: gy + 1 })) {
    gy++;
  }
  return gy;
}

export function tickSpeed(level: number): number {
  return Math.max(TICK_MS_MIN, TICK_MS_BASE - (level - 1) * 70);
}

// ─── Game state machine ──────────────────────────────────────────────────────

export function createInitialState(): GameState {
  const first = randomPiece();
  return {
    board: createEmptyBoard(),
    current: spawn(first),
    next: randomPiece(),
    held: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    isOver: false,
    isPaused: false,
  };
}

export type Action =
  | 'LEFT'
  | 'RIGHT'
  | 'DOWN' // soft drop (1 row)
  | 'ROTATE'
  | 'HARD_DROP'
  | 'HOLD'
  | 'TICK' // gravity tick
  | 'TOGGLE_PAUSE'
  | 'RESTART';

export function reducer(state: GameState, action: Action): GameState {
  if (action === 'RESTART') return createInitialState();

  if (action === 'TOGGLE_PAUSE') {
    if (state.isOver) return state;
    return { ...state, isPaused: !state.isPaused };
  }

  if (state.isOver || state.isPaused) return state;

  switch (action) {
    case 'LEFT': {
      const moved = { ...state.current, x: state.current.x - 1 };
      return collides(state.board, moved)
        ? state
        : { ...state, current: moved };
    }
    case 'RIGHT': {
      const moved = { ...state.current, x: state.current.x + 1 };
      return collides(state.board, moved)
        ? state
        : { ...state, current: moved };
    }
    case 'DOWN': {
      const moved = { ...state.current, y: state.current.y + 1 };
      if (!collides(state.board, moved)) {
        return { ...state, current: moved, score: state.score + POINTS.soft };
      }
      // Lock
      return lockAndSpawn(state);
    }
    case 'ROTATE': {
      const rotated = {
        ...state.current,
        rotation: (state.current.rotation + 1) % 4,
      };
      // Try basic rotation
      if (!collides(state.board, rotated)) {
        return { ...state, current: rotated };
      }
      // Wall kick attempts: left, right, up
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [-2, 0],
        [2, 0],
      ]) {
        const kicked = { ...rotated, x: rotated.x + dx, y: rotated.y + dy };
        if (!collides(state.board, kicked)) {
          return { ...state, current: kicked };
        }
      }
      return state; // can't rotate
    }
    case 'HARD_DROP': {
      const gy = ghostY(state.board, state.current);
      const distance = gy - state.current.y;
      const dropped = { ...state.current, y: gy };
      const locked = lock(state.board, dropped);
      const { board, cleared } = clearLines(locked);
      const newLines = state.lines + cleared;
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
      const lineScore =
        cleared > 0 ? (POINTS[cleared as 1 | 2 | 3 | 4] ?? 0) * newLevel : 0;
      const nextPiece = spawn(state.next);
      const isOver = collides(board, nextPiece);
      return {
        ...state,
        board,
        current: nextPiece,
        next: randomPiece(),
        canHold: true,
        score: state.score + distance * POINTS.hard + lineScore,
        lines: newLines,
        level: newLevel,
        isOver,
      };
    }
    case 'HOLD': {
      if (!state.canHold) return state;
      const heldType = state.held;
      const newHeld = state.current.type;
      const nextCurrent = heldType ? spawn(heldType) : spawn(state.next);
      const newNext = heldType ? state.next : randomPiece();
      return {
        ...state,
        current: nextCurrent,
        held: newHeld,
        next: heldType ? state.next : newNext,
        canHold: false,
      };
    }
    case 'TICK': {
      const moved = { ...state.current, y: state.current.y + 1 };
      if (!collides(state.board, moved)) {
        return { ...state, current: moved };
      }
      return lockAndSpawn(state);
    }
    default:
      return state;
  }
}

function lockAndSpawn(state: GameState): GameState {
  const locked = lock(state.board, state.current);
  const { board, cleared } = clearLines(locked);
  const newLines = state.lines + cleared;
  const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
  const lineScore =
    cleared > 0 ? (POINTS[cleared as 1 | 2 | 3 | 4] ?? 0) * newLevel : 0;
  const nextPiece = spawn(state.next);
  const isOver = collides(board, nextPiece);
  return {
    ...state,
    board,
    current: nextPiece,
    next: randomPiece(),
    canHold: true,
    score: state.score + lineScore,
    lines: newLines,
    level: newLevel,
    isOver,
  };
}
