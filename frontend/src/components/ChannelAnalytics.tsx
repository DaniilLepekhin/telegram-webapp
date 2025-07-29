import React, { useState, useEffect } from 'react';
import ChannelDetector from './ChannelDetector';
import TrackingLinksManager from './TrackingLinksManager';
import SourceAnalytics from './SourceAnalytics';
import AdvancedAnalytics from './AdvancedAnalytics';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

interface TelegramChannel {
  id: number;
  title: string;
  username: string;
  type: string;
  memberCount: number;
  isAdmin: boolean;
  canInviteUsers: boolean;
  botIsAdmin?: boolean;
}

interface ChannelAnalyticsProps {
  onBack: () => void;
}

const ChannelAnalytics: React.FC<ChannelAnalyticsProps> = ({ onBack }) => {
  const [detectedChannels, setDetectedChannels] = useState<TelegramChannel[]>([]);
  const [selectedTelegramChannel, setSelectedTelegramChannel] = useState<TelegramChannel | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'analytics'>('overview');

  const handleChannelsDetected = (channels: TelegramChannel[]) => {
    setDetectedChannels(channels);
    if (channels.length > 0 && !selectedTelegramChannel) {
      setSelectedTelegramChannel(channels[0]);
    }
  };

  const handleChannelSelect = (channel: TelegramChannel) => {
    setSelectedTelegramChannel(channel);
  };

  const handleAddBot = async (channel: TelegramChannel) => {
    try {
      const response = await fetch('/api/telegram/add-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: channel.id,
          permissions: {
            canInviteUsers: true,
            canPostMessages: false,
            canEditMessages: false,
            canDeleteMessages: false,
            canRestrictMembers: false,
            canPromoteMembers: false
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Бот успешно добавлен в канал!');
        // Обновляем статус бота в списке каналов
        setDetectedChannels(prev => 
          prev.map(ch => 
            ch.id === channel.id 
              ? { ...ch, botIsAdmin: true }
              : ch
          )
        );
      } else {
        alert('Ошибка добавления бота: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка добавления бота:', error);
      alert('Ошибка добавления бота');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BackButton onBack={onBack} />
          <h1 className="text-lg font-semibold text-gray-900">Аналитика каналов</h1>
        </div>
        <FullscreenButton />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Channel Detector */}
        <ChannelDetector onChannelsDetected={handleChannelsDetected} />

        {detectedChannels.length > 0 && selectedTelegramChannel && (
          <div className="mt-6">
            {/* Channel Selection */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-md font-medium text-gray-900 mb-3">Выберите канал для анализа</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {detectedChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTelegramChannel.id === channel.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleChannelSelect(channel)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{channel.title}</h4>
                      {channel.botIsAdmin && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Бот подключен
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      @{channel.username} • {channel.memberCount.toLocaleString()} подписчиков
                    </div>
                    {!channel.botIsAdmin && channel.canInviteUsers && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBot(channel);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Добавить бота
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Обзор
                  </button>
                  <button
                    onClick={() => setActiveTab('tracking')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'tracking'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Трекинговые ссылки
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'analytics'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Расширенная аналитика
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedTelegramChannel.memberCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">Подписчиков</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-green-700">Трекинговых ссылок</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">0%</div>
                        <div className="text-sm text-purple-700">Конверсия</div>
                      </div>
                    </div>
                    
                    <SourceAnalytics channelId={selectedTelegramChannel.id} />
                  </div>
                )}

                {activeTab === 'tracking' && (
                  <div className="mt-6">
                    <TrackingLinksManager channelId={selectedTelegramChannel.id} />
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="mt-6">
                    <AdvancedAnalytics channelId={selectedTelegramChannel.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelAnalytics; 