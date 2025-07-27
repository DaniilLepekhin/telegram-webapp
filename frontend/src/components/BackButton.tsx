import React, { useState, useEffect } from 'react';
import { useLogs } from '../contexts/LogsContext';

interface BackButtonProps {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addLog } = useLogs();

  useEffect(() => {
    // Проверяем Telegram WebApp API
    if (window.Telegram?.WebApp) {
      setIsExpanded(window.Telegram.WebApp.isExpanded);
      
      // Слушаем изменения
      const handleViewportChange = () => {
        if (window.Telegram?.WebApp) {
          setIsExpanded(window.Telegram.WebApp.isExpanded);
        }
      };

      window.Telegram.WebApp.onEvent('viewportChanged', handleViewportChange);
      
      return () => {
        window.Telegram.WebApp.offEvent('viewportChanged', handleViewportChange);
      };
    }
  }, []);

  // Определяем позицию кнопки в зависимости от состояния
  const getButtonPosition = () => {
    if (isExpanded) {
      // В полноэкранном режиме Telegram - кнопка ниже, чтобы не мешать верхней панели
      // Согласно документации, нужно учитывать высоту верхней панели
      return "fixed top-24 left-6 z-[9999]";
    } else {
      // В обычном режиме - стандартная позиция
      return "fixed top-6 left-6 z-[9999]";
    }
  };

  return (
    <button
      onClick={() => {
        const message = '🔘 BackButton clicked!';
        console.log(message);
        addLog(message);
        onClick();
      }}
      className={`${getButtonPosition()} w-12 h-12 bg-white/95 backdrop-blur-xl border-2 border-white/80 rounded-full shadow-2xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:scale-110 group`}
      aria-label="Назад"
    >
      <div className="flex items-center justify-center w-full h-full">
        <svg
          className="w-5 h-5 text-gray-800 group-hover:text-purple-600 transition-colors duration-300"
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

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
};

export default BackButton; 