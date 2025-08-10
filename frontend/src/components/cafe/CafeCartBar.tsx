import React from 'react';

interface CafeCartBarProps {
  branch: string;
  time: string;
  total: number;
  onCheckout: () => void;
}

const CafeCartBar: React.FC<CafeCartBarProps> = ({ branch, time, total, onCheckout }) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 backdrop-blur-xl bg-slate-900/80 border-t border-white/10">
      <div className="max-w-4xl mx-auto p-3 flex items-center justify-between">
        <div className="text-white/80 text-sm">{branch} • {time}</div>
        <div className="flex items-center gap-3">
          <div className="text-white text-lg font-semibold">{total} ₽</div>
          <button onClick={onCheckout} className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold">
            Оформить
          </button>
        </div>
      </div>
    </div>
  );
};

export default CafeCartBar;


