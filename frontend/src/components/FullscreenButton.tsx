import React, { useState, useEffect } from 'react';

const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    console.log('🔍 FullscreenButton useEffect - инициализация');
    
    // Проверяем Telegram WebApp API
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      console.log('📱 Telegram WebApp доступен:');
      console.log('  - webApp.isExpanded:', webApp.isExpanded);
      console.log('  - webApp.viewportHeight:', webApp.viewportHeight);
      console.log('  - webApp.viewportStableHeight:', webApp.viewportStableHeight);
      console.log('  - webApp.platform:', webApp.platform);
      console.log('  - webApp.version:', webApp.version);
      console.log('  - webApp.colorScheme:', webApp.colorScheme);
      console.log('  - webApp.themeParams:', webApp.themeParams);
      
      setIsExpanded(webApp.isExpanded);
    } else {
      console.log('❌ Telegram WebApp недоступен');
    }

    // Слушаем изменения полноэкранного режима
    const handleViewportChange = () => {
      console.log('🔄 FullscreenButton viewportChanged event');
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        console.log('  - webApp.isExpanded:', webApp.isExpanded);
        console.log('  - webApp.viewportHeight:', webApp.viewportHeight);
        console.log('  - webApp.viewportStableHeight:', webApp.viewportStableHeight);
        setIsExpanded(webApp.isExpanded);
      }
    };

    // Слушаем изменения браузерного полноэкранного режима
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      console.log('🖥️ Browser fullscreen change:', isFullscreenNow);
      setIsFullscreen(isFullscreenNow);
    };

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('viewportChanged', handleViewportChange);
      console.log('✅ viewportChanged listener добавлен');
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    console.log('✅ fullscreenchange listener добавлен');

    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent('viewportChanged', handleViewportChange);
        console.log('🧹 viewportChanged listener удален');
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      console.log('🧹 fullscreenchange listener удален');
    };
  }, []);

  const toggleFullscreen = () => {
    console.log('🔘 FullscreenButton toggleFullscreen вызвана');
    console.log('  - isExpanded state:', isExpanded);
    console.log('  - isFullscreen state:', isFullscreen);
    
    try {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        console.log('📱 Telegram WebApp состояние:');
        console.log('  - webApp.isExpanded:', webApp.isExpanded);
        console.log('  - webApp.viewportHeight:', webApp.viewportHeight);
        console.log('  - webApp.viewportStableHeight:', webApp.viewportStableHeight);
        console.log('  - webApp.platform:', webApp.platform);
        console.log('  - webApp.version:', webApp.version);
        
        if (!webApp.isExpanded) {
          // Расширяем на весь экран
          console.log('🖼️ Вызываем webApp.expand()');
          webApp.expand();
          console.log('✅ webApp.expand() выполнен');
        } else {
          // В Telegram Mini Apps нет прямого API для выхода из полноэкранного режима
          // Пользователь должен использовать кнопку "Назад" в Telegram
          console.log('📱 Mini App уже в полноэкранном режиме. Используйте кнопку "Назад" в Telegram для выхода.');
          
          // НЕ показываем уведомление - это раздражает пользователя
          // webApp.showAlert('Используйте кнопку "Назад" в Telegram для выхода из полноэкранного режима');
        }
      } else {
        // Fallback для браузера
        console.log('🖥️ Используем браузерный fallback');
        console.log('  - document.fullscreenElement:', document.fullscreenElement);
        
        if (!document.fullscreenElement) {
          console.log('🖼️ Вызываем document.documentElement.requestFullscreen()');
          document.documentElement.requestFullscreen();
        } else {
          console.log('📱 Вызываем document.exitFullscreen()');
          document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('❌ Ошибка переключения полноэкранного режима:', error);
    }
  };

  // Скрываем кнопку, если Telegram WebApp не доступен
  if (!window.Telegram?.WebApp) {
    return null;
  }

  // Определяем позицию кнопки в зависимости от состояния
  const getButtonPosition = () => {
    // Для тестирования - кнопка всегда внизу
    return "fixed bottom-6 right-6 z-[9999]";
    
    // Оригинальная логика (закомментирована для тестирования):
    // if (isExpanded) {
    //   // В полноэкранном режиме Telegram - кнопка ниже, чтобы не мешать верхней панели
    //   // Согласно документации, нужно учитывать высоту верхней панели
    //   return "fixed top-24 right-6 z-[9999]";
    // } else {
    //   // В обычном режиме - стандартная позиция
    //   return "fixed top-6 right-6 z-[9999]";
    // }
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