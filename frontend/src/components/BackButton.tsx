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
        fixed top-4 left-4 z-50
        w-10 h-10
        bg-white/90 backdrop-blur-sm
        border border-gray-200/50
        rounded-full
        shadow-lg shadow-black/10
        hover:shadow-xl hover:shadow-black/20
        hover:bg-white/95
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
        className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors duration-200"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
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