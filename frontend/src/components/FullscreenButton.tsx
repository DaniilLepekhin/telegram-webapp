import React, { useState, useEffect } from 'react';

interface FullscreenButtonProps {
  onLog?: (message: string) => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ onLog }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  useEffect(() => {
    // Проверяем поддержку полноэкранного режима
    const checkFullscreenSupport = () => {
      const supported = !!(
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      );
      setFullscreenSupported(supported);
      
      // Простое определение состояния
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        setIsFullscreen((webApp as any).isFullscreen);
      } else {
        const fullscreenElement = 
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement;
        
        setIsFullscreen(!!fullscreenElement);
      }
    };

    checkFullscreenSupport();

    // Простой слушатель изменений
    const handleFullscreenChange = () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        setIsFullscreen((webApp as any).isFullscreen);
      } else {
        const fullscreenElement = 
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement;
        
        setIsFullscreen(!!fullscreenElement);
      }
    };

    // Добавляем слушатели
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('fullscreenChanged', handleFullscreenChange);
    } else {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }

    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent('fullscreenChanged', handleFullscreenChange);
      } else {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      }
    };
  }, [onLog]);

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        await (document.documentElement as any).mozRequestFullScreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Ошибка при входе в полноэкранный режим:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Ошибка при выключении полноэкранного режима:', error);
    }
  };

  const toggleFullscreen = () => {
    // РАДИКАЛЬНЫЙ сброс позиции прокрутки
    const forceScrollReset = () => {
      // Множественные попытки сброса
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Принудительный сброс всех скроллабельных элементов
      const scrollableElements = document.querySelectorAll('*');
      scrollableElements.forEach(element => {
        if (element.scrollTop !== undefined) {
          element.scrollTop = 0;
        }
        if (element.scrollLeft !== undefined) {
          element.scrollLeft = 0;
        }
      });
      
      // Принудительный CSS transform
      document.documentElement.style.transform = 'translateY(0px)';
      document.body.style.transform = 'translateY(0px)';
      const root = document.getElementById('root');
      if (root) {
        root.style.transform = 'translateY(0px)';
      }
    };

    // Первый сброс
    forceScrollReset();
    
    // Проверяем, находимся ли мы в Telegram
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      if (!(webApp as any).isFullscreen) {
        // Расширяем WebApp и принудительно сбрасываем viewport
        webApp.expand();
        webApp.requestViewport();
        
        // Множественные сбросы с разными таймингами
        setTimeout(() => forceScrollReset(), 10);
        setTimeout(() => forceScrollReset(), 50);
        
        setTimeout(() => {
          (webApp as any).requestFullscreen();
          
          // Агрессивные сбросы после fullscreen
          setTimeout(() => forceScrollReset(), 50);
          setTimeout(() => forceScrollReset(), 100);
          setTimeout(() => forceScrollReset(), 200);
          setTimeout(() => forceScrollReset(), 500);
        }, 100);
      } else {
        // Выходим из полноэкранного режима
        (webApp as any).exitFullscreen();
        
        // Сбросы после выхода
        setTimeout(() => forceScrollReset(), 50);
        setTimeout(() => forceScrollReset(), 100);
        setTimeout(() => forceScrollReset(), 200);
      }
    } else {
      // Используем браузерный Fullscreen API
      if (isFullscreen) {
        exitFullscreen();
      } else {
        requestFullscreen();
      }
      
      // Множественные сбросы для браузера
      setTimeout(() => forceScrollReset(), 100);
      setTimeout(() => forceScrollReset(), 300);
      setTimeout(() => forceScrollReset(), 500);
    }
  };

  // Определяем позицию кнопки
  const getButtonPosition = () => {
    return "fixed bottom-6 right-6 z-[9999]";
  };

  return (
    <div className={`${getButtonPosition()}`}>
      {/* Кнопка полноэкранного режима */}
      <button
        onClick={toggleFullscreen}
        className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 backdrop-blur-xl border-2 border-white/80 rounded-2xl shadow-2xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 transform hover:scale-110 group"
        aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
        title={isFullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
      >
        <div className="flex items-center justify-center w-full h-full">
          {(() => {
            // Определяем состояние для отображения иконки
            let shouldShowExitIcon = isFullscreen;
            
            // В Telegram используем webApp.isFullscreen как источник истины
            if (window.Telegram?.WebApp) {
              shouldShowExitIcon = (window.Telegram.WebApp as any).isFullscreen;
            }
            
            return shouldShowExitIcon ? (
              <svg 
                className="w-8 h-8 text-white group-hover:text-yellow-200 transition-colors duration-300" 
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
                className="w-8 h-8 text-white group-hover:text-yellow-200 transition-colors duration-300" 
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
            );
          })()}
        </div>
      </button>
    </div>
  );
};

export default FullscreenButton; 