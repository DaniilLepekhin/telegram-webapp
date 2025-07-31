import React, { useState, useEffect } from 'react';

interface TelegramChannel {
  id: number;
  title: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
  memberCount?: number;
  isAdmin: boolean;
  canInviteUsers: boolean;
  botIsAdmin?: boolean;
}

interface ChannelAnalyticsProps {
  onBack: () => void;
}

const ChannelAnalytics: React.FC<ChannelAnalyticsProps> = ({ onBack }) => {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<TelegramChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  const detectChannels = async () => {
    setLoading(true);
    setLogs([]);
    
    addLog('🔍 Начинаем поиск каналов...');
    
    // Имитация задержки
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Демо-данные
    const demoChannels: TelegramChannel[] = [
      {
        id: 1,
        title: 'Мой Телеграм Канал',
        username: 'my_channel',
        type: 'channel',
        isAdmin: true,
        canInviteUsers: true,
        memberCount: 15420,
        botIsAdmin: false
      },
      {
        id: 2,
        title: 'Группа Поддержки',
        username: 'support_group',
        type: 'supergroup',
        isAdmin: true,
        canInviteUsers: true,
        memberCount: 2340,
        botIsAdmin: true
      }
    ];
    
    addLog(`✅ Найдено каналов: ${demoChannels.length}`);
    setChannels(demoChannels);
    setSelectedChannel(demoChannels[0]);
    setLoading(false);
  };

  useEffect(() => {
    detectChannels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Аналитика Каналов
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Автоматическое определение и аналитика ваших Telegram каналов
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Channel Detection Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">🔍 Определение каналов</h2>
                <p className="text-white/70">Поиск каналов, где вы являетесь администратором</p>
              </div>
              <button
                onClick={detectChannels}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '🔍 Поиск...' : '🔄 Обновить'}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Поиск каналов...</h3>
                <p className="text-white/60">Анализируем ваши права в Telegram</p>
              </div>
            )}

            {/* Channels List */}
            {channels.length > 0 && !loading && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Найдено каналов: {channels.length}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`group relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                        selectedChannel?.id === channel.id
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-xl">📢</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          selectedChannel?.id === channel.id
                            ? 'border-purple-400 bg-purple-400'
                            : 'border-white/40'
                        }`}>
                          {selectedChannel?.id === channel.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-1"></div>
                          )}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">{channel.title}</h4>
                      <p className="text-white/70 text-sm mb-3">@{channel.username}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">👥 {channel.memberCount?.toLocaleString() || 'N/A'}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          channel.botIsAdmin
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {channel.botIsAdmin ? 'Бот добавлен' : 'Бот не добавлен'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Channels Found */}
            {channels.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📢</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Каналы не найдены</h3>
                <p className="text-white/60 mb-4">
                  У вас нет каналов, где вы являетесь администратором
                </p>
                <div className="space-y-2 text-sm text-white/60">
                  <p>Для работы с аналитикой необходимо:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Быть администратором канала</li>
                    <li>Иметь права на добавление пользователей</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Debug Logs */}
          {logs.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">🔍 Логи отладки</h3>
                <button
                  onClick={() => {
                    const logText = logs.join('\n');
                    navigator.clipboard.writeText(logText);
                    alert('Логи скопированы в буфер обмена!');
                  }}
                  className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                >
                  📋 Копировать
                </button>
              </div>
              <div className="bg-black/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-1 text-xs font-mono">
                  {logs.map((log, index) => (
                    <div key={index} className="text-green-400">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Channel Analytics */}
          {selectedChannel && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">📈 Аналитика канала</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">👥</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedChannel.memberCount?.toLocaleString() || 'N/A'}
                  </h3>
                  <p className="text-white/70 text-sm">Подписчиков</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🔗</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">0</h3>
                  <p className="text-white/70 text-sm">Трекинг-ссылок</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">👁️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">0</h3>
                  <p className="text-white/70 text-sm">Просмотров</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">0%</h3>
                  <p className="text-white/70 text-sm">Конверсия</p>
                </div>
              </div>

              {!selectedChannel.botIsAdmin && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">🤖 Добавьте бота в канал</h3>
                      <p className="text-white/70">Для получения аналитики необходимо добавить бота в канал</p>
                    </div>
                    <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105">
                      Добавить бота
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelAnalytics; 