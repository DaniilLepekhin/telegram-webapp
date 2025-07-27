import React, { useState, useEffect } from 'react';

const FullscreenControls: React.FC = () => {
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
      
      // Проверяем текущее состояние
      const fullscreenElement = 
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;
      
      setIsFullscreen(!!fullscreenElement);
    };

    checkFullscreenSupport();

    // Слушаем изменения полноэкранного режима
    const handleFullscreenChange = () => {
      const fullscreenElement = 
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;
      
      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const requestFullscreen = async () => {
    try {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      
      console.log('🖼️ Полноэкранный режим включен!');
    } catch (error) {
      console.error('❌ Ошибка при включении полноэкранного режима:', error);
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
      
      console.log('🖼️ Полноэкранный режим выключен!');
    } catch (error) {
      console.error('❌ Ошибка при выключении полноэкранного режима:', error);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  };

  if (!fullscreenSupported) {
    return (
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
        <h3 className="text-sm font-medium mb-2">🖼️ Полноэкранный режим</h3>
        <p className="text-xs">
          ⚠️ Полноэкранный режим не поддерживается в этом браузере.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">🖼️ Полноэкранный режим</h3>
        <button
          onClick={toggleFullscreen}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            isFullscreen 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFullscreen ? '🚫 Выйти' : '🖼️ Включить'}
        </button>
      </div>
      
      <div className="text-xs space-y-1">
        <p><strong>Статус:</strong> {isFullscreen ? '🖼️ Полноэкранный' : '📱 Обычный'}</p>
        <p><strong>Поддержка:</strong> ✅ Доступна</p>
        <p className="text-blue-600">
          💡 <strong>Совет:</strong> Полноэкранный режим делает Mini App более иммерсивным!
        </p>
      </div>
    </div>
  );
};

export default FullscreenControls; 