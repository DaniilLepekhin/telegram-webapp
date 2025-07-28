import React, { useState, useEffect } from 'react';

const FullscreenButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Инициализация состояния
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      setIsExpanded(webApp.isExpanded);
      
      // Слушаем изменения viewport
      const handleViewportChange = () => {
        setIsExpanded(webApp.isExpanded);
      };
      
      webApp.onEvent('viewportChanged', handleViewportChange);
      
      return () => {
        webApp.offEvent('viewportChanged', handleViewportChange);
      };
    }
  }, []);

  const toggleFullscreen = () => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      if (!webApp.isExpanded) {
        // Расширяем на весь экран
        webApp.expand();
        console.log('🖼️ Расширяем Mini App на весь экран');
      } else {
        // Показываем уведомление с кнопкой для выхода
        webApp.showConfirm(
          'Хотите выйти из полноэкранного режима?',
          (confirmed: boolean) => {
            if (confirmed) {
              // Показываем инструкцию как выйти
              webApp.showAlert('Нажмите кнопку "Назад" в Telegram для выхода из полноэкранного режима');
              console.log('📱 Пользователь подтвердил выход из полноэкранного режима');
            }
          }
        );
        console.log('📱 Показываем диалог подтверждения выхода');
      }
    }
  };

  // Скрываем кнопку, если Telegram WebApp не доступен
  if (!window.Telegram?.WebApp) {
    return null;
  }

  // Позиция кнопки - всегда в правом верхнем углу

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed top-6 right-6 w-12 h-12 bg-white/95 backdrop-blur-xl border-2 border-white/80 rounded-full shadow-2xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:scale-110 group z-[9999]"
      aria-label={isExpanded ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
      title={isExpanded ? "Нажмите для выхода из полноэкранного режима" : "Развернуть на весь экран"}
    >
      <div className="flex items-center justify-center w-full h-full">
        {isExpanded ? (
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
              d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" 
            />
          </svg>
        ) : (
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
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0l5.25 5.25M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15m-11.25 5.25h4.5m-4.5 0v-4.5m0 4.5L9 15" 
            />
          </svg>
        )}
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
};

export default FullscreenButton; 