import React from 'react';

interface CafeHeaderProps {
  title: string;
  subtitle?: string;
}

const CafeHeader: React.FC<CafeHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center pt-6 pb-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl shadow-xl mb-3">
        <span className="text-2xl">☕</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
      {subtitle && <p className="text-white/70">{subtitle}</p>}
    </div>
  );
};

export default CafeHeader;



