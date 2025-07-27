import React, { useState, useEffect } from 'react';

const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Проверяем Telegram WebApp API
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      setIsExpanded(webApp.isExpanded);
    }

    // Слушаем изменения полноэкранного режима
    const handleViewportChange = () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        setIsExpanded(webApp.isExpanded);
      }
    };

    // Слушаем изменения браузерного полноэкранного режима
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('viewportChanged', handleViewportChange);
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent('viewportChanged', handleViewportChange);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    try {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        if (!webApp.isExpanded) {
          // Расширяем на весь экран
          webApp.expand();
          console.log('🖼️ Расширяем Mini App на весь экран');
        } else {
          // В Telegram Mini Apps нет прямого API для выхода из полноэкранного режима
          // Пользователь должен использовать кнопку "Назад" в Telegram
          console.log('📱 Mini App уже в полноэкранном режиме. Используйте кнопку "Назад" в Telegram для выхода.');
          
          // НЕ показываем уведомление - это раздражает пользователя
          // webApp.showAlert('Используйте кнопку "Назад" в Telegram для выхода из полноэкранного режима');
        }
      } else {
        // Fallback для браузера
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Ошибка переключения полноэкранного режима:', error);
    }
  };

  // Скрываем кнопку, если Telegram WebApp не доступен
  if (!window.Telegram?.WebApp) {
    return null;
  }

  // Определяем позицию кнопки в зависимости от состояния
  const getButtonPosition = () => {
    if (isExpanded) {
      // В полноэкранном режиме Telegram - кнопка ниже, чтобы не мешать верхней панели
      // Согласно документации, нужно учитывать высоту верхней панели
      return "fixed top-24 right-6 z-[9999]";
    } else {
      // В обычном режиме - стандартная позиция
      return "fixed top-6 right-6 z-[9999]";
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className={`${getButtonPosition()} w-12 h-12 bg-white/95 backdrop-blur-xl border-2 border-white/80 rounded-full shadow-2xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:scale-110 group`}
      aria-label={isExpanded ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
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