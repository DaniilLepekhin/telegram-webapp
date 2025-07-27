import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';

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
  const [channels, setChannels] = useState<ChannelData[]>([
    {
      id: '1',
      name: 'Мой канал',
      username: '@my_channel',
      subscribers: 15420,
      growth: 234,
      sources: [
        { name: 'Органический трафик', count: 8920, percentage: 58, color: '#10B981' },
        { name: 'Реклама ВКонтакте', count: 3240, percentage: 21, color: '#3B82F6' },
        { name: 'Instagram Ads', count: 2160, percentage: 14, color: '#F59E0B' },
        { name: 'Google Ads', count: 1100, percentage: 7, color: '#EF4444' }
      ],
      dailyStats: [
        { date: '2024-02-15', subscribers: 156, unsubscribers: 12, netGrowth: 144 },
        { date: '2024-02-14', subscribers: 189, unsubscribers: 8, netGrowth: 181 },
        { date: '2024-02-13', subscribers: 145, unsubscribers: 15, netGrowth: 130 },
        { date: '2024-02-12', subscribers: 201, unsubscribers: 6, netGrowth: 195 },
        { date: '2024-02-11', subscribers: 178, unsubscribers: 11, netGrowth: 167 },
        { date: '2024-02-10', subscribers: 234, unsubscribers: 9, netGrowth: 225 },
        { date: '2024-02-09', subscribers: 167, unsubscribers: 13, netGrowth: 154 }
      ]
    }
  ]);

  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(channels[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'daily' | 'ads'>('overview');

  const addChannel = () => {
    const newChannel: ChannelData = {
      id: Date.now().toString(),
      name: 'Новый канал',
      username: '@new_channel',
      subscribers: 0,
      growth: 0,
      sources: [],
      dailyStats: []
    };
    setChannels([...channels, newChannel]);
    setSelectedChannel(newChannel);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 relative">
      {/* Красивая кнопка "Назад" */}
      <BackButton onClick={handleBack} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Аналитика каналов</h1>
            <p className="text-lg text-gray-600">Отслеживайте подписчиков и источники трафика</p>
          </div>
        </div>

        {/* Channel Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Ваши каналы</h2>
            <button
              onClick={addChannel}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              + Добавить канал
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map(channel => (
              <div
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedChannel?.id === channel.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-800">{channel.name}</h3>
                <p className="text-gray-600 text-sm">{channel.username}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    {channel.subscribers.toLocaleString()}
                  </span>
                  <span className={`text-sm font-medium ${
                    channel.growth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {channel.growth > 0 ? '+' : ''}{channel.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedChannel && (
          <div className="bg-white rounded-xl shadow-lg">
            {/* Channel Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedChannel.name}</h2>
                  <p className="text-gray-600">{selectedChannel.username}</p>
                </div>
                <button
                  onClick={generateSubscriptionLink}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  🔗 Создать ссылку подписки
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Обзор', icon: '📊' },
                  { id: 'sources', label: 'Источники трафика', icon: '🌐' },
                  { id: 'daily', label: 'Ежедневная статистика', icon: '📈' },
                  { id: 'ads', label: 'Рекламные кампании', icon: '📢' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Общая статистика</h3>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedChannel.subscribers.toLocaleString()}</div>
                      <div className="text-blue-100">Подписчиков</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">+{selectedChannel.growth}</div>
                      <div className="text-green-100">Рост за день</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">4</div>
                      <div className="text-purple-100">Источника трафика</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">15.2%</div>
                      <div className="text-orange-100">Конверсия</div>
                    </div>
                  </div>

                  {/* Growth Chart */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Рост за неделю</h4>
                    <div className="flex items-end justify-between h-32">
                      {selectedChannel.dailyStats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-500 rounded-t w-8 transition-all duration-300 hover:bg-blue-600"
                            style={{ height: `${(stat.netGrowth / Math.max(...selectedChannel.dailyStats.map(s => s.netGrowth))) * 100}%` }}
                          ></div>
                          <div className="text-xs text-gray-600 mt-2">{stat.netGrowth}</div>
                          <div className="text-xs text-gray-500">День {index + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sources' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Источники трафика</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pie Chart */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Распределение по источникам</h4>
                      <div className="space-y-4">
                        {selectedChannel.sources.map((source, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: source.color }}
                              ></div>
                              <span className="font-medium text-gray-700">{source.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{ 
                                    width: `${source.percentage}%`,
                                    backgroundColor: source.color
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-12">{source.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Source Details */}
                    <div className="space-y-4">
                      {selectedChannel.sources.map((source, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-gray-800">{source.name}</h5>
                            <span className="text-sm font-medium" style={{ color: source.color }}>
                              {source.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{source.percentage}% от общего трафика</span>
                            <span>Конверсия: {Math.round(source.percentage * 0.8)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'daily' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Ежедневная статистика</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-800">Дата</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Подписчики</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Отписались</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Чистый рост</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedChannel.dailyStats.map((stat, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-700">
                              {new Date(stat.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right text-green-600 font-medium">
                              +{stat.subscribers}
                            </td>
                            <td className="py-3 px-4 text-right text-red-600 font-medium">
                              -{stat.unsubscribers}
                            </td>
                            <td className={`py-3 px-4 text-right font-medium ${
                              stat.netGrowth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stat.netGrowth > 0 ? '+' : ''}{stat.netGrowth}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'ads' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Рекламные кампании</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                      <h4 className="text-lg font-semibold mb-2">ВКонтакте</h4>
                      <div className="text-3xl font-bold mb-2">3,240</div>
                      <div className="text-blue-100">Подписчиков</div>
                      <div className="text-sm mt-2">Конверсия: 21%</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-xl">
                      <h4 className="text-lg font-semibold mb-2">Instagram</h4>
                      <div className="text-3xl font-bold mb-2">2,160</div>
                      <div className="text-pink-100">Подписчиков</div>
                      <div className="text-sm mt-2">Конверсия: 14%</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                      <h4 className="text-lg font-semibold mb-2">Google Ads</h4>
                      <div className="text-3xl font-bold mb-2">1,100</div>
                      <div className="text-red-100">Подписчиков</div>
                      <div className="text-sm mt-2">Конверсия: 7%</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-xl">
                      <h4 className="text-lg font-semibold mb-2">Facebook</h4>
                      <div className="text-3xl font-bold mb-2">890</div>
                      <div className="text-yellow-100">Подписчиков</div>
                      <div className="text-sm mt-2">Конверсия: 6%</div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                      📊 Подключить рекламную платформу
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelAnalytics; 