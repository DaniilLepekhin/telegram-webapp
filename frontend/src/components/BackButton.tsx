import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed top-6 left-6 z-[9999]
        w-12 h-12
        bg-white/95 backdrop-blur-md
        border-2 border-white/80
        rounded-full
        shadow-2xl shadow-black/20
        hover:shadow-2xl hover:shadow-black/30
        hover:bg-white
        active:scale-95
        transition-all duration-200 ease-out
        flex items-center justify-center
        group
        ${className}
      `}
      aria-label="Назад"
    >
      {/* Иконка стрелки */}
      <svg
        className="w-6 h-6 text-gray-800 group-hover:text-gray-900 transition-colors duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      
      {/* Эффект при наведении */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
    </button>
  );
};

export default BackButton; 