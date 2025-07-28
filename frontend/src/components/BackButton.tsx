import React from 'react';

interface BackButtonProps {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-6 left-6 z-[9999] w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 backdrop-blur-xl border-2 border-white/80 rounded-2xl shadow-2xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:scale-110 group"
      aria-label="Назад"
      title="Назад"
    >
      <div className="flex items-center justify-center w-full h-full">
        <svg 
          className="w-6 h-6 text-white group-hover:text-yellow-200 transition-colors duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
      </div>
    </button>
  );
};

export default BackButton; 