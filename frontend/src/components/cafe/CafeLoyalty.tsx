import React from 'react';

interface CafeLoyaltyProps {
  code: string;
}

const CafeLoyalty: React.FC<CafeLoyaltyProps> = ({ code }) => {
  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
      <h3 className="text-white font-semibold mb-2">🎁 Бонусная программа</h3>
      <p className="text-white/70 text-sm mb-3">Покажите QR/код бариста для начисления или списания бонусов</p>
      <div className="bg-white rounded-lg p-3 text-center select-all text-slate-800">{code}</div>
    </div>
  );
};

export default CafeLoyalty;



