import React, { useState, useEffect } from 'react';

interface FullscreenButtonProps {
  onLog?: (message: string) => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ onLog }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  useEffect(() => {
    const logMessage = '🔍 FullscreenButton useEffect - инициализация';
    console.log(logMessage);
    onLog?.(logMessage);
    
    // Проверяем поддержку полноэкранного режима
    const checkFullscreenSupport = () => {
      const supported = !!(
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      );
      setFullscreenSupported(supported);
      
      const supportLog = `📱 Поддержка браузерного Fullscreen API: ${supported ? '✅' : '❌'}`;
      console.log(supportLog);
      onLog?.(supportLog);
      
      // В Telegram используем webApp.isExpanded как источник истины
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        setIsFullscreen(webApp.isExpanded);
        
        const telegramStateLog = `📱 Telegram isExpanded: ${webApp.isExpanded ? '✅' : '❌'}`;
        console.log(telegramStateLog);
        onLog?.(telegramStateLog);
      } else {
        // В браузере используем document.fullscreenElement
        const fullscreenElement = 
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement;
        
        setIsFullscreen(!!fullscreenElement);
        
        const browserStateLog = `🖥️ Браузерный Fullscreen: ${!!fullscreenElement ? '✅' : '❌'}`;
        console.log(browserStateLog);
        onLog?.(browserStateLog);
      }
    };

    checkFullscreenSupport();

    // Слушаем изменения полноэкранного режима
    const handleFullscreenChange = () => {
      if (window.Telegram?.WebApp) {
        // В Telegram слушаем viewportChanged
        const webApp = window.Telegram.WebApp;
        const newState = webApp.isExpanded;
        setIsFullscreen(newState);
        
        const changeLog = `🔄 Telegram isExpanded изменился: ${newState ? '✅' : '❌'}`;
        console.log(changeLog);
        onLog?.(changeLog);
      } else {
        // В браузере слушаем fullscreenchange
        const fullscreenElement = 
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement;
        
        const newState = !!fullscreenElement;
        setIsFullscreen(newState);
        
        const changeLog = `🔄 Браузерный Fullscreen изменился: ${newState ? '✅' : '❌'}`;
        console.log(changeLog);
        onLog?.(changeLog);
      }
    };

    // Добавляем слушатели в зависимости от среды
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('viewportChanged', handleFullscreenChange);
      const telegramListenerLog = '✅ Telegram viewportChanged listener добавлен';
      console.log(telegramListenerLog);
      onLog?.(telegramListenerLog);
    } else {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
      
      const browserListenersLog = '✅ Слушатели браузерного Fullscreen добавлены';
      console.log(browserListenersLog);
      onLog?.(browserListenersLog);
    }

    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent('viewportChanged', handleFullscreenChange);
        const telegramCleanupLog = '🧹 Telegram viewportChanged listener удален';
        console.log(telegramCleanupLog);
        onLog?.(telegramCleanupLog);
      } else {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        
        const browserCleanupLog = '🧹 Слушатели браузерного Fullscreen удалены';
        console.log(browserCleanupLog);
        onLog?.(browserCleanupLog);
      }
    };
  }, [onLog]);

  const requestFullscreen = async () => {
    try {
      const element = document.documentElement;
      
      const requestLog = '🖼️ Запрашиваем полноэкранный режим...';
      console.log(requestLog);
      onLog?.(requestLog);
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      
      const successLog = '✅ Полноэкранный режим включен!';
      console.log(successLog);
      onLog?.(successLog);
    } catch (error) {
      const errorLog = `❌ Ошибка при включении полноэкранного режима: ${error}`;
      console.error(errorLog);
      onLog?.(errorLog);
    }
  };

  const exitFullscreen = async () => {
    try {
      const exitLog = '🖼️ Выходим из полноэкранного режима...';
      console.log(exitLog);
      onLog?.(exitLog);
      
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      const successLog = '✅ Полноэкранный режим выключен!';
      console.log(successLog);
      onLog?.(successLog);
    } catch (error) {
      const errorLog = `❌ Ошибка при выключении полноэкранного режима: ${error}`;
      console.error(errorLog);
      onLog?.(errorLog);
    }
  };

  const toggleFullscreen = () => {
    const toggleLog = `🔘 FullscreenButton toggleFullscreen вызвана, текущее состояние: ${isFullscreen ? '✅' : '❌'}`;
    console.log(toggleLog);
    onLog?.(toggleLog);
    
    // Проверяем, находимся ли мы в Telegram
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      const telegramLog = '📱 Используем Telegram WebApp API';
      console.log(telegramLog);
      onLog?.(telegramLog);
      
      if (!webApp.isExpanded) {
        // Расширяем в Telegram
        const expandLog = '🖼️ Вызываем webApp.expand()';
        console.log(expandLog);
        onLog?.(expandLog);
        webApp.expand();
      } else {
        // Показываем инструкцию для выхода из Telegram
        const exitLog = '📱 Показываем инструкцию для выхода из Telegram';
        console.log(exitLog);
        onLog?.(exitLog);
        webApp.showAlert('Нажмите кнопку "Назад" в Telegram для выхода из полноэкранного режима');
      }
    } else {
      // Используем браузерный Fullscreen API
      const browserLog = '🖥️ Используем браузерный Fullscreen API';
      console.log(browserLog);
      onLog?.(browserLog);
      
      if (isFullscreen) {
        exitFullscreen();
      } else {
        requestFullscreen();
      }
    }
  };

  // Скрываем кнопку, если полноэкранный режим не поддерживается
  // if (!fullscreenSupported) {
  //   return null;
  // }

  // Определяем позицию кнопки
  const getButtonPosition = () => {
    return "fixed bottom-6 right-6 z-[9999]";
  };

  return (
    <div className={`${getButtonPosition()} flex flex-col items-center gap-2`}>
      {/* Большая кнопка полноэкранного режима */}
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
            
            // В Telegram используем webApp.isExpanded как источник истины
            if (window.Telegram?.WebApp) {
              shouldShowExitIcon = window.Telegram.WebApp.isExpanded;
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
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-orange-400/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Отладочная информация */}
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-3 text-white text-xs max-w-48">
        <div className="font-bold mb-2">🔍 Отладка Fullscreen</div>
        <div className="space-y-1">
          <div>🖥️ isFullscreen: {isFullscreen ? '✅' : '❌'}</div>
          <div>📱 Поддержка браузера: {fullscreenSupported ? '✅' : '❌'}</div>
          <div>📱 Telegram WebApp: {window.Telegram?.WebApp ? '✅' : '❌'}</div>
          <div>📱 Telegram isExpanded: {window.Telegram?.WebApp?.isExpanded ? '✅' : '❌'}</div>
          <div>📏 viewportHeight: {window.Telegram?.WebApp?.viewportHeight || 'N/A'}</div>
          <div>📐 viewportStableHeight: {window.Telegram?.WebApp?.viewportStableHeight || 'N/A'}</div>
          <div>🌐 platform: {window.Telegram?.WebApp?.platform || 'N/A'}</div>
          <div>🔧 document.fullscreenEnabled: {document.fullscreenEnabled ? '✅' : '❌'}</div>
          <div>🔧 webkitFullscreenEnabled: {(document as any).webkitFullscreenEnabled ? '✅' : '❌'}</div>
        </div>
        
        {/* Кнопка копирования отладочной информации */}
        <button
          onClick={() => {
            const debugInfo = [
              `🔍 Fullscreen Debug Info - ${new Date().toLocaleTimeString()}`,
              `🖥️ isFullscreen: ${isFullscreen}`,
              `📱 Поддержка браузера: ${fullscreenSupported}`,
              `📱 Telegram WebApp: ${window.Telegram?.WebApp ? '✅' : '❌'}`,
              `📱 Telegram isExpanded: ${window.Telegram?.WebApp?.isExpanded ? '✅' : '❌'}`,
              `📏 viewportHeight: ${window.Telegram?.WebApp?.viewportHeight || 'N/A'}`,
              `📐 viewportStableHeight: ${window.Telegram?.WebApp?.viewportStableHeight || 'N/A'}`,
              `🌐 platform: ${window.Telegram?.WebApp?.platform || 'N/A'}`,
              `🔧 webApp.version: ${window.Telegram?.WebApp?.version || 'N/A'}`,
              `🎨 webApp.colorScheme: ${window.Telegram?.WebApp?.colorScheme || 'N/A'}`,
              `🔧 document.fullscreenEnabled: ${document.fullscreenEnabled ? '✅' : '❌'}`,
              `🔧 webkitFullscreenEnabled: ${(document as any).webkitFullscreenEnabled ? '✅' : '❌'}`
            ].join('\n');
            
            navigator.clipboard.writeText(debugInfo).then(() => {
              onLog?.('📋 Отладочная информация скопирована');
            }).catch(() => {
              onLog?.('❌ Ошибка копирования отладочной информации');
            });
          }}
          className="mt-2 w-full px-2 py-1 bg-green-500/80 text-white text-xs rounded-lg hover:bg-green-500 transition-colors"
        >
          📋 Копировать отладку
        </button>
      </div>
    </div>
  );
};

export default FullscreenButton; 