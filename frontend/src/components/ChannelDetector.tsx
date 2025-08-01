import React, { useState, useEffect } from 'react';

interface TelegramChannel {
  id: number;
  title: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
  isAdmin: boolean;
  canInviteUsers: boolean;
  memberCount?: number;
}

interface ChannelDetectorProps {
  onChannelsDetected: (channels: TelegramChannel[]) => void;
  onChannelSelected: (channel: TelegramChannel) => void;
}

const ChannelDetector: React.FC<ChannelDetectorProps> = ({
  onChannelsDetected,
  onChannelSelected
}) => {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<TelegramChannel | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  // Функция для получения каналов через Telegram Bot API
  const detectChannels = async () => {
    setLoading(true);
    setError(null);
    setLogs([]); // Очищаем логи

    try {
      addLog('Начинаем определение каналов...');
      addLog(`window.Telegram: ${window.Telegram ? 'доступен' : 'недоступен'}`);
      addLog(`window.Telegram?.WebApp: ${window.Telegram?.WebApp ? 'доступен' : 'недоступен'}`);
      
      // Проверяем, есть ли доступ к Telegram WebApp
      if (!window.Telegram?.WebApp) {
        addLog('Telegram WebApp недоступен');
        throw new Error('Telegram WebApp недоступен. Откройте приложение через Telegram бота.');
      }

      // Проверяем, есть ли данные пользователя
      addLog(`initDataUnsafe: ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe)}`);
      addLog(`user: ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe?.user)}`);
      
      if (!window.Telegram.WebApp.initDataUnsafe?.user) {
        addLog('Данные пользователя недоступны');
        throw new Error('Данные пользователя недоступны. Попробуйте перезапустить приложение.');
      }

      addLog('Отправляем запрос к API...');
      // Отправляем запрос на получение каналов
      const response = await fetch('/api/telegram/get-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: window.Telegram.WebApp.initData,
          user: window.Telegram.WebApp.initDataUnsafe?.user
        })
      });

      addLog(`Ответ от API: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error('Ошибка получения каналов');
      }

      const data = await response.json();
      addLog(`Данные от API: ${JSON.stringify(data, null, 2)}`);

      if (data.success) {
        const detectedChannels = data.channels.filter((channel: TelegramChannel) =>
          channel.isAdmin && channel.canInviteUsers
        );

        addLog(`Отфильтрованные каналы: ${JSON.stringify(detectedChannels, null, 2)}`);
        setChannels(detectedChannels);
        onChannelsDetected(detectedChannels);

        if (detectedChannels.length === 0) {
          setError('Не найдено каналов, где вы являетесь администратором с правами добавления пользователей');
        }
      } else {
        throw new Error(data.error || 'Ошибка получения каналов');
      }
    } catch (err) {
      addLog(`Ошибка определения каналов: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setChannels([]);
      onChannelsDetected([]);
    } finally {
      setLoading(false);
    }
  };

  const forceRefreshChannels = async () => {
    setLoading(true);
    setError(null);
    setLogs([]); // Очищаем логи

    try {
      addLog('⚡ Принудительное обновление каналов (без кеша)...');
      addLog(`window.Telegram: ${window.Telegram ? 'доступен' : 'недоступен'}`);
      addLog(`window.Telegram?.WebApp: ${window.Telegram?.WebApp ? 'доступен' : 'недоступен'}`);
      
      // Проверяем, есть ли доступ к Telegram WebApp
      if (!window.Telegram?.WebApp) {
        addLog('Telegram WebApp недоступен');
        throw new Error('Telegram WebApp недоступен. Откройте приложение через Telegram бота.');
      }

      // Проверяем, есть ли данные пользователя
      addLog(`initDataUnsafe: ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe)}`);
      addLog(`user: ${JSON.stringify(window.Telegram.WebApp.initDataUnsafe?.user)}`);
      
      if (!window.Telegram.WebApp.initDataUnsafe?.user) {
        addLog('Данные пользователя недоступны');
        throw new Error('Данные пользователя недоступны. Попробуйте перезапустить приложение.');
      }

      addLog('📡 Отправляем запрос к API с принудительным обновлением...');
      // Отправляем запрос на получение каналов с флагом принудительного обновления
      const response = await fetch('/api/telegram/get-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: window.Telegram.WebApp.initData,
          user: window.Telegram.WebApp.initDataUnsafe?.user,
          forceRefresh: true // Флаг для принудительного обновления
        })
      });

      addLog(`📡 Ответ от API: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error('Ошибка получения каналов');
      }

      const data = await response.json();
      addLog(`📊 Данные от API: ${JSON.stringify(data, null, 2)}`);

      if (data.success) {
        const detectedChannels = data.channels.filter((channel: TelegramChannel) =>
          channel.isAdmin && channel.canInviteUsers
        );

        addLog(`✅ Отфильтрованные каналы: ${JSON.stringify(detectedChannels, null, 2)}`);
        setChannels(detectedChannels);
        onChannelsDetected(detectedChannels);

        if (detectedChannels.length === 0) {
          setError('Не найдено каналов, где вы являетесь администратором с правами добавления пользователей');
        }
      } else {
        throw new Error(data.error || 'Ошибка получения каналов');
      }
    } catch (err) {
      addLog(`❌ Ошибка определения каналов: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleChannelSelect = (channel: TelegramChannel) => {
    setSelectedChannel(channel);
    onChannelSelected(channel);
  };

  const addBotToChannel = async (channel: TelegramChannel) => {
    try {
      // Отправляем запрос на добавление бота в канал
      const response = await fetch('/api/telegram/add-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: channel.id,
          channelTitle: channel.title,
          initData: window.Telegram.WebApp.initData
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка добавления бота');
      }

      const data = await response.json();

      if (data.success) {
        alert(`Бот успешно добавлен в канал "${channel.title}"!`);
        // Здесь можно обновить статус канала
      } else {
        throw new Error(data.error || 'Ошибка добавления бота');
      }
    } catch (err) {
      console.error('Ошибка добавления бота:', err);
      alert(`Ошибка добавления бота: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    }
  };

  useEffect(() => {
    // Автоматически определяем каналы при загрузке
    detectChannels();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Определение каналов</h3>
          <p className="text-white/60 text-sm mt-1">
            Автоматически найдем каналы, где вы являетесь администратором
          </p>
        </div>
        <button
          onClick={detectChannels}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '🔍 Поиск...' : '🔄 Обновить'}
        </button>
        <button
          onClick={() => {
            setLogs([]);
            detectChannels();
          }}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 ml-2"
        >
          🔍 Отладка
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 ">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Поиск каналов...</h3>
          <p className="text-white/60">Анализируем ваши права в Telegram каналах</p>
        </div>
      )}

      {/* Debug Logs - Always show when logs exist */}
      {/* Debug Logs */}
      {showLogs && (
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">🔍 Логи отладки</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const logText = logs.join('\n');
                  navigator.clipboard.writeText(logText);
                  alert('Логи скопированы в буфер обмена!');
                }}
                className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
              >
                📋 Копировать
              </button>
              <button
                onClick={() => setShowLogs(false)}
                className="bg-red-500/20 text-red-300 px-3 py-1 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                ❌ Закрыть
              </button>
            </div>
          </div>
          <div className="bg-black/50 rounded-lg p-4 max-h-60 overflow-y-auto">
            <div className="space-y-1 text-xs font-mono">
              {logs.length === 0 ? (
                <div className="text-yellow-400">Нет логов. Нажмите "Обновить" для генерации логов.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-green-400">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Channels State */}
      {!loading && !error && channels.length === 0 && (
        <div className="bg-yellow-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/30">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-400 text-xl">🔍</span>
            <div>
              <h4 className="text-white font-medium mb-2">Каналы не найдены</h4>
              <p className="text-white/60 text-sm mb-4">
                Убедитесь, что вы добавили бота в канал как администратора и у вас есть права на добавление пользователей.
              </p>
              <div className="space-y-2 text-sm text-white/80">
                <p>• Добавьте бота в канал как администратора</p>
                <p>• Убедитесь, что у вас есть права администратора в канале</p>
                <p>• Нажмите "Обновить" после добавления бота</p>
              </div>
              <button
                onClick={detectChannels}
                className="mt-4 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
              >
                🔄 Обновить список
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-400/30">
          <div className="flex items-start space-x-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <div>
              <h4 className="text-white font-medium mb-2">Ошибка определения каналов</h4>
              <p className="text-white/60 text-sm">{error}</p>
              <button
                onClick={detectChannels}
                className="mt-3 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channels List */}
      {channels.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-white">
              Найдено каналов: {channels.length}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={detectChannels}
                className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                title="Обновить список каналов"
              >
                🔄 Обновить
              </button>
              <button
                onClick={forceRefreshChannels}
                className="bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                title="Принудительно обновить (без кеша)"
              >
                ⚡ Принудительно
              </button>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="bg-yellow-500/20 text-yellow-300 px-3 py-2 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                title="Показать логи отладки"
              >
                📋 Логи
              </button>
            </div>
          </div>

          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-300 ${
                selectedChannel?.id === channel.id
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-white/20 hover:bg-white/15'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">
                        {channel.type === 'channel' ? '📢' : '👥'}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-white font-semibold">{channel.title}</h5>
                      {channel.username && (
                        <p className="text-white/60 text-sm">@{channel.username}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-white/60">
                      Тип: {channel.type === 'channel' ? 'Канал' : 'Группа'}
                    </span>
                    {channel.memberCount && (
                      <span className="text-white/60">
                        Участников: {channel.memberCount.toLocaleString()}
                      </span>
                    )}
                    <span className="text-green-400">✅ Администратор</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleChannelSelect(channel)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedChannel?.id === channel.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Выбрать
                  </button>
                  <button
                    onClick={() => addBotToChannel(channel)}
                    className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                    title="Добавить бота в канал"
                  >
                    🤖
                  </button>
                </div>
              </div>

              {/* Bot Status */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Статус бота:</span>
                  <span className="text-yellow-400 text-sm">Не добавлен</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Channels Found */}
      {channels.length === 0 && !loading && !error && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📢</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Каналы не найдены</h3>
          <p className="text-white/60 mb-4">
            У вас нет каналов, где вы являетесь администратором с правами добавления пользователей
          </p>
          <div className="space-y-2 text-sm text-white/60">
            <p>Для работы с аналитикой необходимо:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Быть администратором канала</li>
              <li>Иметь права на добавление пользователей</li>
              <li>Или создать новый канал</li>
            </ul>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/30">
        <h4 className="text-lg font-semibold text-white mb-4">💡 Как это работает</h4>
        <div className="space-y-3 text-sm text-white/80">
          <div className="flex items-start space-x-3">
            <span className="text-blue-400">1.</span>
            <div>
              <div className="text-white font-medium">Автоматическое определение</div>
              <div className="text-white/60">Система находит все каналы, где вы администратор</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-400">2.</span>
            <div>
              <div className="text-white font-medium">Выбор канала</div>
              <div className="text-white/60">Выберите канал для подключения аналитики</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-400">3.</span>
            <div>
              <div className="text-white font-medium">Добавление бота</div>
              <div className="text-white/60">Бот автоматически добавится в выбранный канал</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetector;