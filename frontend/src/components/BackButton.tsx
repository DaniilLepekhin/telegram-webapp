import React from 'react';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick, className = '' }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // По умолчанию возвращаемся на главную страницу через Telegram WebApp API
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.click();
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Назад
    </button>
  );
};

export default BackButton; 