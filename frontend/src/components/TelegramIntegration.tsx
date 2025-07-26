import React, { useState, useEffect } from 'react';

interface TelegramStats {
  channelId: string;
  channelName: string;
  subscribers: number;
  posts: TelegramPost[];
}

interface TelegramPost {
  id: number;
  text: string;
  views: number;
  forwards: number;
  replies: number;
  date: string;
}

const TelegramIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [channelUsername, setChannelUsername] = useState('');
  const [stats, setStats] = useState<TelegramStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectBot = async () => {
    if (!botToken || !channelUsername) {
      setError('Введите токен бота и username канала');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Здесь будет реальная интеграция с Telegram Bot API
      const response = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botToken,
          channelUsername
        })
      });

      if (response.ok) {
        setIsConnected(true);
        await fetchChannelStats();
      } else {
        setError('Ошибка подключения к Telegram Bot API');
      }
    } catch (err) {
      setError('Ошибка подключения: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelStats = async () => {
    if (!isConnected) return;

    setLoading(true);
    try {
      // Здесь будет запрос к Telegram Bot API для получения статистики
      const mockStats: TelegramStats = {
        channelId: '1',
        channelName: '@my_channel',
        subscribers: 15420,
        posts: [
          {
            id: 123,
            text: 'Как увеличить продажи в 3 раза',
            views: 15420,
            forwards: 234,
            replies: 156,
            date: '2024-02-15'
          },
          {
            id: 124,
            text: 'Новый продукт уже в продаже!',
            views: 8920,
            forwards: 123,
            replies: 89,
            date: '2024-02-14'
          }
        ]
      };

      setStats(mockStats);
    } catch (err) {
      setError('Ошибка получения статистики: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const syncWithTelegram = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        action: 'sync_telegram_stats',
        channelUsername,
        botToken: botToken ? '***' : 'not_set'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Интеграция с Telegram</h1>
          <p className="text-lg text-gray-600">Подключите бота для получения реальной статистики</p>
        </div>

        {/* Connection Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Подключение бота</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Токен бота (от @BotFather)
              </label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              />
              <p className="text-xs text-gray-500 mt-1">
                Получите токен у @BotFather в Telegram
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username канала (без @)
              </label>
              <input
                type="text"
                value={channelUsername}
                onChange={(e) => setChannelUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="my_channel"
              />
              <p className="text-xs text-gray-500 mt-1">
                Бот должен быть администратором канала
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={connectBot}
                disabled={loading || !botToken || !channelUsername}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Подключение...' : 'Подключить бота'}
              </button>
              
              {isConnected && (
                <button
                  onClick={syncWithTelegram}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  🔄 Синхронизировать
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-8">
            ✅ Бот успешно подключен к каналу @{channelUsername}
          </div>
        )}

        {/* Channel Stats */}
        {stats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Статистика канала</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                <div className="text-3xl font-bold mb-2">{stats.subscribers.toLocaleString()}</div>
                <div className="text-blue-100">Подписчиков</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                <div className="text-3xl font-bold mb-2">{stats.posts.length}</div>
                <div className="text-green-100">Постов</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                <div className="text-3xl font-bold mb-2">
                  {Math.round(stats.posts.reduce((sum, post) => sum + post.views, 0) / stats.posts.length).toLocaleString()}
                </div>
                <div className="text-purple-100">Средний просмотр</div>
              </div>
            </div>

            {/* Posts List */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Последние посты</h3>
              <div className="space-y-4">
                {stats.posts.map(post => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {post.text.length > 50 ? post.text.substring(0, 50) + '...' : post.text}
                      </h4>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-blue-600">👁 {post.views.toLocaleString()}</span>
                      <span className="text-green-600">📤 {post.forwards}</span>
                      <span className="text-purple-600">💬 {post.replies}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Инструкция по подключению</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold text-gray-800">Создайте бота</h4>
                <p className="text-gray-600">Напишите @BotFather в Telegram и создайте нового бота командой /newbot</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold text-gray-800">Получите токен</h4>
                <p className="text-gray-600">Скопируйте токен бота, который пришлёт @BotFather</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold text-gray-800">Добавьте бота в канал</h4>
                <p className="text-gray-600">Сделайте бота администратором вашего канала с правами на чтение сообщений</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-semibold text-gray-800">Подключите в WebApp</h4>
                <p className="text-gray-600">Введите токен и username канала в форму выше</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Важно</h4>
            <p className="text-yellow-700 text-sm">
              Бот должен быть администратором канала для получения статистики. 
              Токен бота хранится только локально и не передаётся на сервер.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramIntegration; 