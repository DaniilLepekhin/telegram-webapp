import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';
import TrackingLinksManager from './TrackingLinksManager';
import SourceAnalytics from './SourceAnalytics';
import ChannelDetector from './ChannelDetector';

interface TelegramChannel {
  id: number;
  title: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
  isAdmin: boolean;
  canInviteUsers: boolean;
  memberCount?: number;
}

interface ChannelData {
  id: string;
  name: string;
  username: string;
  subscribers: number;
  growth: number;
  sources: TrafficSource[];
  dailyStats: DailyStat[];
}

interface TrafficSource {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface DailyStat {
  date: string;
  subscribers: number;
  unsubscribers: number;
  netGrowth: number;
}

const ChannelAnalytics: React.FC = () => {
  const [detectedChannels, setDetectedChannels] = useState<TelegramChannel[]>([]);
  const [selectedTelegramChannel, setSelectedTelegramChannel] = useState<TelegramChannel | null>(null);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'tracking' | 'daily' | 'ads'>('overview');
  const [showChannelDetector, setShowChannelDetector] = useState(false);

  const handleChannelsDetected = (channels: TelegramChannel[]) => {
    setDetectedChannels(channels);
    
    // Преобразуем Telegram каналы в формат ChannelData
    const channelData: ChannelData[] = channels.map(channel => ({
      id: channel.id.toString(),
      name: channel.title,
      username: channel.username ? `@${channel.username}` : '',
      subscribers: channel.memberCount || 0,
      growth: 0, // Будет рассчитываться после подключения бота
      sources: [
        { name: 'Органический трафик', count: Math.floor((channel.memberCount || 0) * 0.6), percentage: 60, color: '#10B981' },
        { name: 'Реклама ВКонтакте', count: Math.floor((channel.memberCount || 0) * 0.2), percentage: 20, color: '#3B82F6' },
        { name: 'Instagram Ads', count: Math.floor((channel.memberCount || 0) * 0.15), percentage: 15, color: '#F59E0B' },
        { name: 'Google Ads', count: Math.floor((channel.memberCount || 0) * 0.05), percentage: 5, color: '#EF4444' }
      ],
      dailyStats: []
    }));
    
    setChannels(channelData);
    
    if (channelData.length > 0) {
      setSelectedChannel(channelData[0]);
    }
  };

  const handleChannelSelected = (channel: TelegramChannel) => {
    setSelectedTelegramChannel(channel);
    
    // Находим соответствующий ChannelData
    const channelData = channels.find(c => c.id === channel.id.toString());
    if (channelData) {
      setSelectedChannel(channelData);
    }
  };

  const handleBack = () => {
    if ((window as any).handleGoBack) {
      (window as any).handleGoBack();
    } else {
      window.location.reload();
    }
  };

  const generateSubscriptionLink = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        action: 'generate_subscription_link',
        channelId: selectedChannel?.id,
        channelName: selectedChannel?.name
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Красивая кнопка "Назад" */}
      <BackButton onClick={handleBack} />
      
      {/* Кнопка полноэкранного режима */}
      <FullscreenButton />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">📈</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
            Аналитика каналов
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
            Продвинутая аналитика и отслеживание эффективности ваших Telegram каналов
          </p>
        </div>

        {/* Channel Detection */}
        {detectedChannels.length === 0 ? (
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Автоматическое определение каналов</h2>
                <p className="text-white/60">Найдем все каналы, где вы являетесь администратором</p>
              </div>
              
              <ChannelDetector
                onChannelsDetected={handleChannelsDetected}
                onChannelSelected={handleChannelSelected}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Channel Selector */}
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Ваши каналы</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowChannelDetector(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                    >
                      🔄 Обновить
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedChannel?.id === channel.id
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400'
                          : 'bg-white/5 hover:bg-white/10 border border-white/20'
                      }`}
                    >
                      <h3 className="font-semibold text-white mb-1">{channel.name}</h3>
                      <p className="text-white/60 text-sm mb-2">{channel.username}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-400">{channel.subscribers.toLocaleString()}</span>
                        <span className="text-sm text-green-400">+{channel.growth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedChannel && (
              <>
                {/* Tabs */}
                <div className="mb-8">
                  <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-4">
                    {[
                      { id: 'overview', label: 'Обзор', icon: '📊' },
                      { id: 'sources', label: 'Источники', icon: '🌐' },
                      { id: 'tracking', label: 'Трекинг', icon: '🔗' },
                      { id: 'daily', label: 'Ежедневно', icon: '📅' },
                      { id: 'ads', label: 'Реклама', icon: '💰' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl">👥</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{selectedChannel.subscribers.toLocaleString()}</h3>
                        <p className="text-white/60">Подписчиков</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📈</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-green-400 mb-1">+{selectedChannel.growth}</h3>
                        <p className="text-white/60">Рост за день</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl">🎯</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-purple-400 mb-1">4.8%</h3>
                        <p className="text-white/60">Вовлеченность</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl">💰</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-orange-400 mb-1">₽12.5K</h3>
                        <p className="text-white/60">Доход</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sources' && (
                    <SourceAnalytics channelId={selectedChannel.id} />
                  )}

                  {activeTab === 'tracking' && (
                    <TrackingLinksManager />
                  )}

                  {activeTab === 'daily' && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-white mb-6">Ежедневная статистика</h3>
                      <div className="space-y-3">
                        {selectedChannel.dailyStats.map((stat, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div>
                              <div className="text-white font-medium">{new Date(stat.date).toLocaleDateString()}</div>
                              <div className="text-white/60 text-sm">Чистый рост: +{stat.netGrowth}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-400 font-bold">+{stat.subscribers}</div>
                              <div className="text-red-400 text-sm">-{stat.unsubscribers}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'ads' && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-white mb-6">Рекламные кампании</h3>
                      <div className="text-center py-8">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">💰</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Реклама не настроена</h3>
                        <p className="text-white/60">Настройте рекламные кампании для отслеживания эффективности</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={generateSubscriptionLink}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                  >
                    🔗 Создать ссылку для отслеживания
                  </button>
                  <button className="flex-1 bg-white/10 text-white py-4 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20">
                    📊 Экспорт данных
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Channel Detector Modal */}
        {showChannelDetector && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Определение каналов</h3>
                <button
                  onClick={() => setShowChannelDetector(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <ChannelDetector
                onChannelsDetected={handleChannelsDetected}
                onChannelSelected={handleChannelSelected}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelAnalytics; 