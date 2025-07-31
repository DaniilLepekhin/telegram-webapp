import React, { useState, useEffect } from 'react';

const TestPage: React.FC = () => {
  const [telegramAvailable, setTelegramAvailable] = useState<boolean>(false);
  const [initData, setInitData] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<string>('');

  useEffect(() => {
    // Проверяем доступность Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      setTelegramAvailable(true);
      setInitData(window.Telegram.WebApp.initData);
      setUser(window.Telegram.WebApp.initDataUnsafe?.user);
    } else {
      setTelegramAvailable(false);
    }

    // Проверяем API
    fetch('/api/telegram/stats/users')
      .then(response => response.json())
      .then(data => {
        setApiStatus(data.success ? 'API работает' : 'API ошибка');
      })
      .catch(error => {
        setApiStatus(`API ошибка: ${error.message}`);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            🧪 Тестовая страница
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Telegram WebApp Status */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">Telegram WebApp</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-white/70">Доступен:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                    telegramAvailable ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
                  }`}>
                    {telegramAvailable ? '✅ Да' : '❌ Нет'}
                  </span>
                </div>
                
                {telegramAvailable && (
                  <>
                    <div className="text-white/70">
                      <div>InitData: <span className="text-white font-mono text-sm">{initData ? '✅ Есть' : '❌ Нет'}</span></div>
                      <div>User: <span className="text-white font-mono text-sm">{user ? '✅ Есть' : '❌ Нет'}</span></div>
                    </div>
                    
                    {user && (
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-white/70 text-sm">Пользователь:</div>
                        <div className="text-white font-mono text-xs mt-1">
                          {JSON.stringify(user, null, 2)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* API Status */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">Backend API</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-white/70">Статус:</span>
                  <span className="ml-2 px-2 py-1 rounded text-sm font-medium bg-blue-500/30 text-blue-300">
                    {apiStatus || 'Проверяется...'}
                  </span>
                </div>
                
                <div className="text-white/70">
                  <div>Backend: <span className="text-white font-mono text-sm">Проксируется через nginx</span></div>
                  <div>Health: <span className="text-white font-mono text-sm">/api/telegram/stats/users</span></div>
                </div>
              </div>
            </div>

            {/* Browser Info */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">Браузер</h2>
              <div className="space-y-3 text-white/70">
                <div>User Agent: <span className="text-white font-mono text-xs">{navigator.userAgent}</span></div>
                <div>URL: <span className="text-white font-mono text-xs">{window.location.href}</span></div>
                <div>Referrer: <span className="text-white font-mono text-xs">{document.referrer || 'Нет'}</span></div>
              </div>
            </div>

            {/* Network Info */}
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-6 border border-orange-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">Сеть</h2>
              <div className="space-y-3 text-white/70">
                <div>Online: <span className={`text-white ${navigator.onLine ? 'text-green-300' : 'text-red-300'}`}>
                  {navigator.onLine ? '✅ Да' : '❌ Нет'}
                </span></div>
                <div>Connection: <span className="text-white font-mono text-xs">
                  {(navigator as any).connection?.effectiveType || 'Неизвестно'}
                </span></div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              🔄 Обновить страницу
            </button>
            
            <button
              onClick={() => {
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.showAlert('Тестовая страница работает!');
                } else {
                  alert('Telegram WebApp недоступен');
                }
              }}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-300"
            >
              📱 Тест Telegram API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 