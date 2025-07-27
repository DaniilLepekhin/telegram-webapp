import React, { useEffect, useState } from 'react';

interface FullscreenManagerProps {
  isTelegramWebApp: boolean;
}

const FullscreenManager: React.FC<FullscreenManagerProps> = ({ isTelegramWebApp }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);

  useEffect(() => {
    if (!isTelegramWebApp || !window.Telegram?.WebApp) return;

    const webApp = window.Telegram.WebApp;

    // Проверяем поддержку полноэкранного режима (Bot API 8.0+)
    const checkFullscreenSupport = () => {
      // Проверяем наличие методов для полноэкранного режима
      const hasRequestFullscreen = typeof webApp.requestFullscreen === 'function';
      const hasExitFullscreen = typeof webApp.exitFullscreen === 'function';
      const hasIsFullscreen = typeof webApp.isFullscreen !== 'undefined';
      
      setIsFullscreenSupported(hasRequestFullscreen && hasExitFullscreen && hasIsFullscreen);
      setIsFullscreen(webApp.isFullscreen || false);
      
      console.log('🖼️ Поддержка полноэкранного режима:', {
        hasRequestFullscreen,
        hasExitFullscreen,
        hasIsFullscreen,
        isFullscreen: webApp.isFullscreen
      });
    };

    checkFullscreenSupport();

    // Обработчик изменения полноэкранного режима
    const handleFullscreenChanged = () => {
      console.log('🖼️ Полноэкранный режим изменился:', webApp.isFullscreen);
      setIsFullscreen(webApp.isFullscreen || false);
    };

    // Обработчик ошибки полноэкранного режима
    const handleFullscreenFailed = () => {
      console.log('❌ Ошибка переключения полноэкранного режима');
    };

    // Подписываемся на события
    webApp.onEvent('fullscreenChanged', handleFullscreenChanged);
    webApp.onEvent('fullscreenFailed', handleFullscreenFailed);

    return () => {
      webApp.offEvent('fullscreenChanged', handleFullscreenChanged);
      webApp.offEvent('fullscreenFailed', handleFullscreenFailed);
    };
  }, [isTelegramWebApp]);

  const requestFullscreen = () => {
    if (!isTelegramWebApp || !window.Telegram?.WebApp) return;
    
    const webApp = window.Telegram.WebApp;
    console.log('🖼️ Запрашиваем полноэкранный режим...');
    webApp.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (!isTelegramWebApp || !window.Telegram?.WebApp) return;
    
    const webApp = window.Telegram.WebApp;
    console.log('🖼️ Выходим из полноэкранного режима...');
    webApp.exitFullscreen();
  };

  if (!isTelegramWebApp) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">🖼️ Полноэкранный режим</h3>
          <p className="text-xs mt-1">
            Статус: {isFullscreen ? '✅ Полноэкранный' : '📱 Обычный'}
          </p>
          <p className="text-xs">
            Поддержка: {isFullscreenSupported ? '✅ Доступна' : '❌ Недоступна'}
          </p>
        </div>
        
        {isFullscreenSupported && (
          <div className="space-x-2">
            {!isFullscreen ? (
              <button
                onClick={requestFullscreen}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                🖼️ Полный экран
              </button>
            ) : (
              <button
                onClick={exitFullscreen}
                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
              >
                📱 Обычный
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FullscreenManager; 