import React, { useState, useEffect } from 'react';
import LinkGenerator from './LinkGenerator';
import LinkAnalytics from './LinkAnalytics';
import SimpleModal from './SimpleModal';

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
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [showLinkAnalytics, setShowLinkAnalytics] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  const detectChannels = async () => {
    setLoading(true);
    setLogs([]);
    
    try {
      addLog('🔍 Начинаем поиск каналов...');
      
      if (!window.Telegram?.WebApp) {
        throw new Error('Telegram WebApp недоступен');
      }

      if (!window.Telegram.WebApp.initDataUnsafe?.user) {
        throw new Error('Данные пользователя недоступны');
      }

      addLog('📡 Отправляем запрос к API...');
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

      if (!response.ok) {
        throw new Error('Ошибка получения каналов');
      }

      const data = await response.json();
      
      if (data.success && data.channels.length > 0) {
        addLog(`✅ Найдено каналов: ${data.channels.length}`);
        setChannels(data.channels);
        setSelectedChannel(data.channels[0]);
      } else {
        addLog('⚠️ Каналы не найдены');
        setChannels([]);
        setSelectedChannel(null);
      }
    } catch (err) {
      addLog(`❌ Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      setChannels([]);
      setSelectedChannel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    detectChannels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* КРАСИВЫЙ СТАТИЧНЫЙ ФОН */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full filter blur-xl opacity-20"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full filter blur-xl opacity-20"></div>
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
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 ">
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

          {/* Tracking Links Section */}
          {channels.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-8 border border-white/20">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl">🔗</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">🔗 Ссылки</h2>
                <p className="text-white/70 text-sm">Создание и аналитика</p>
              </div>

              <div className="space-y-4">
                {/* Создать ссылку */}
                <div 
                  onClick={() => setShowLinkGenerator(true)}
                  className="group bg-gradient-to-br from-green-500/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-600/30 rounded-xl p-4 border border-green-500/30 cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔗</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Создать ссылку</h3>
                      <p className="text-white/60 text-sm">Быстрое создание</p>
                    </div>
                  </div>
                </div>

                {/* Аналитика ссылок */}
                <div 
                  onClick={() => setShowLinkAnalytics(true)}
                  className="group bg-gradient-to-br from-purple-500/20 to-pink-600/20 hover:from-purple-500/30 hover:to-pink-600/30 rounded-xl p-4 border border-purple-500/30 cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Аналитика</h3>
                      <p className="text-white/60 text-sm">Статистика переходов</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Возможности */}
              <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📱</div>
                  <h4 className="text-white font-medium mb-0.5 sm:mb-1 text-sm sm:text-base">QR-коды</h4>
                  <p className="text-white/60 text-xs sm:text-sm">Для оффлайн промо</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🌍</div>
                  <h4 className="text-white font-medium mb-0.5 sm:mb-1 text-sm sm:text-base">Геоданные</h4>
                  <p className="text-white/60 text-xs sm:text-sm">Откуда переходят</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🧪</div>
                  <h4 className="text-white font-medium mb-0.5 sm:mb-1 text-sm sm:text-base">A/B тесты</h4>
                  <p className="text-white/60 text-xs sm:text-sm">Разные версии</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">⏰</div>
                  <h4 className="text-white font-medium mb-0.5 sm:mb-1 text-sm sm:text-base">Лимиты</h4>
                  <p className="text-white/60 text-xs sm:text-sm">Время жизни</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Link Generator Modal */}
      <SimpleModal
        isOpen={showLinkGenerator}
        onClose={() => setShowLinkGenerator(false)}
        title="🔗 Создать ссылку"
      >
        <LinkGenerator
          channels={channels}
          onClose={() => setShowLinkGenerator(false)}
        />
      </SimpleModal>

      {/* Link Analytics Modal */}
      <SimpleModal
        isOpen={showLinkAnalytics}
        onClose={() => setShowLinkAnalytics(false)}
        title="📊 Аналитика ссылок"
      >
        <LinkAnalytics
          onClose={() => setShowLinkAnalytics(false)}
        />
      </SimpleModal>
    </div>
  );
};

export default ChannelAnalytics; 