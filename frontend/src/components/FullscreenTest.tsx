import React, { useState, useEffect } from 'react';

const FullscreenTest: React.FC = () => {
  const [webAppStatus, setWebAppStatus] = useState<string>('Проверяем...');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [viewportHeight, setViewportHeight] = useState<number>(0);

  useEffect(() => {
    const checkWebApp = () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        setIsExpanded(webApp.isExpanded);
        setViewportHeight(webApp.viewportHeight);
        setWebAppStatus('✅ Telegram WebApp доступен');
        
        // Слушаем изменения
        webApp.onEvent('viewportChanged', () => {
          setIsExpanded(webApp.isExpanded);
          setViewportHeight(webApp.viewportHeight);
        });
      } else {
        setWebAppStatus('❌ Telegram WebApp недоступен');
      }
    };

    checkWebApp();
  }, []);

  const expandWebApp = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      console.log('🖼️ Расширяем WebApp');
    }
  };

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        console.log('🖼️ Полноэкранный режим включен');
      }).catch((error) => {
        console.log('❌ Ошибка полноэкранного режима:', error);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Тест полноэкранного режима</h1>
        
        <div className="space-y-6">
          {/* Статус WebApp */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Статус Telegram WebApp</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/80">Статус:</span>
                <span className="text-white font-semibold">{webAppStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Расширен:</span>
                <span className={`font-semibold ${isExpanded ? 'text-green-400' : 'text-red-400'}`}>
                  {isExpanded ? 'Да' : 'Нет'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Высота viewport:</span>
                <span className="text-white font-semibold">{viewportHeight}px</span>
              </div>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Управление</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={expandWebApp}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
              >
                🖼️ Расширить WebApp
              </button>
              
              <button
                onClick={requestFullscreen}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
              >
                🖥️ Полноэкранный режим
              </button>
            </div>
          </div>

          {/* Информация о браузере */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Информация о браузере</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/80">User Agent:</span>
                <span className="text-white text-sm">{navigator.userAgent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Полноэкранный API:</span>
                <span className={`font-semibold ${document.fullscreenEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {document.fullscreenEnabled ? 'Поддерживается' : 'Не поддерживается'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Текущий режим:</span>
                <span className={`font-semibold ${document.fullscreenElement ? 'text-green-400' : 'text-red-400'}`}>
                  {document.fullscreenElement ? 'Полноэкранный' : 'Обычный'}
                </span>
              </div>
            </div>
          </div>

          {/* Инструкции */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">Инструкции</h2>
            <div className="space-y-3 text-white/80">
              <p>1. <strong>Расширить WebApp:</strong> Использует Telegram WebApp API для расширения на весь экран</p>
              <p>2. <strong>Полноэкранный режим:</strong> Использует браузерный Fullscreen API</p>
              <p>3. <strong>В Telegram:</strong> Кнопка "Назад" в Telegram выходит из полноэкранного режима</p>
              <p>4. <strong>В браузере:</strong> Нажмите F11 или Esc для выхода из полноэкранного режима</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenTest; 