import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

interface PostTracking {
  id: string;
  originalUrl: string;
  trackingUrl: string;
  postTitle: string;
  channelName: string;
  createdAt: string;
  stats: TrackingStats;
  userBehavior: UserBehavior[];
}

interface TrackingStats {
  totalClicks: number;
  uniqueVisitors: number;
  conversions: number;
  unsubscribes: number;
  avgTimeOnPost: number;
  bounceRate: number;
  sources: TrafficSource[];
  dailyStats: DailyTrackingStat[];
}

interface UserBehavior {
  userId: string;
  timestamp: string;
  action: 'click' | 'view' | 'unsubscribe' | 'subscribe' | 'share';
  source: string;
  userAgent: string;
  ip?: string;
}

interface TrafficSource {
  name: string;
  clicks: number;
  conversions: number;
  percentage: number;
  color: string;
}

interface DailyTrackingStat {
  date: string;
  clicks: number;
  uniqueVisitors: number;
  conversions: number;
  unsubscribes: number;
}

const PostTracking: React.FC = () => {
  const [trackingPosts, setTrackingPosts] = useState<PostTracking[]>([]);

  const [selectedPost, setSelectedPost] = useState<PostTracking | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'behavior' | 'sources' | 'daily'>('overview');
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState({
    originalUrl: '',
    postTitle: '',
    channelName: ''
  });

  const addTrackingPost = async () => {
    if (!newPost.originalUrl || !newPost.postTitle || !newPost.channelName) return;

    try {
      // Извлекаем ID поста из URL
      const urlParts = newPost.originalUrl.split('/');
      const postId = urlParts[urlParts.length - 1];
      const channelName = urlParts[urlParts.length - 2];

      const trackingPost: PostTracking = {
        id: Date.now().toString(),
        originalUrl: newPost.originalUrl,
        trackingUrl: `https://t.me/your_bot?start=track_${Date.now()}_${postId}`,
        postTitle: newPost.postTitle,
        channelName: newPost.channelName,
        createdAt: new Date().toISOString().split('T')[0],
        stats: {
          totalClicks: 0,
          uniqueVisitors: 0,
          conversions: 0,
          unsubscribes: 0,
          avgTimeOnPost: 0,
          bounceRate: 0,
          sources: [],
          dailyStats: []
        },
        userBehavior: []
      };

      setTrackingPosts([trackingPost, ...trackingPosts]);
      setSelectedPost(trackingPost);
      setShowAddPost(false);
      setNewPost({ originalUrl: '', postTitle: '', channelName: '' });

      // Отправляем данные в Telegram
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify({
          action: 'create_tracking_link',
          postId,
          channelName,
          originalUrl: newPost.originalUrl,
          trackingUrl: trackingPost.trackingUrl
        }));
      }
    } catch (error) {
      console.error('Ошибка создания ссылки отслеживания:', error);
    }
  };

  const copyTrackingUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Ссылка скопирована в буфер обмена!');
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  const generateUTMLink = (originalUrl: string, trackingId: string) => {
    const utmParams = new URLSearchParams({
      utm_source: 'telegram',
      utm_medium: 'webapp',
      utm_campaign: `track_${trackingId}`,
      utm_content: 'post_tracking'
    });
    
    return `${originalUrl}?${utmParams.toString()}`;
  };

  const handleBack = () => {
    if ((window as any).handleGoBack) {
      (window as any).handleGoBack();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Кнопка "Назад" */}
      <BackButton onClick={handleBack} />

      {/* Кнопка полноэкранного режима */}
      <FullscreenButton />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Отслеживание постов</h1>
          <p className="text-lg text-gray-600">Создавайте ссылки для отслеживания переходов и поведения пользователей</p>
        </div>

        {/* Add Post Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Отслеживаемые посты</h2>
            <button
              onClick={() => setShowAddPost(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Добавить пост для отслеживания
            </button>
          </div>
          
          {trackingPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                <span className="text-4xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Нет отслеживаемых постов</h3>
              <p className="text-gray-600 text-lg mb-6">
                Добавьте посты для отслеживания их статистики и поведения пользователей
              </p>
              <button
                onClick={() => setShowAddPost(true)}
                className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
              >
                ➕ Добавить первый пост
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {trackingPosts.map(post => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPost?.id === post.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{post.postTitle}</h3>
                      <p className="text-gray-600 text-sm mb-2">{post.channelName}</p>
                      <a 
                        href={post.originalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {post.originalUrl}
                      </a>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">{post.stats.totalClicks}</div>
                      <div className="text-xs text-gray-500">Переходов</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPost && (
          <div className="bg-white rounded-xl shadow-lg">
            {/* Post Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPost.postTitle}</h2>
                  <p className="text-gray-600 mb-2">{selectedPost.channelName}</p>
                  <a 
                    href={selectedPost.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 text-sm"
                  >
                    {selectedPost.originalUrl}
                  </a>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-2">Создано: {selectedPost.createdAt}</div>
                  <button
                    onClick={() => copyTrackingUrl(selectedPost.trackingUrl)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    📋 Копировать ссылку
                  </button>
                </div>
              </div>
            </div>

            {/* Tracking URL Info */}
            <div className="p-6 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ссылка для отслеживания</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка отслеживания</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={selectedPost.trackingUrl}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyTrackingUrl(selectedPost.trackingUrl)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                    >
                      Копировать
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка с UTM-метками</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={generateUTMLink(selectedPost.originalUrl, selectedPost.id)}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => copyTrackingUrl(generateUTMLink(selectedPost.originalUrl, selectedPost.id))}
                      className="bg-purple-500 text-white px-4 py-2 rounded-r-lg hover:bg-purple-600 transition-colors"
                    >
                      Копировать
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Обзор', icon: '📊' },
                  { id: 'behavior', label: 'Поведение пользователей', icon: '👥' },
                  { id: 'sources', label: 'Источники трафика', icon: '🌐' },
                  { id: 'daily', label: 'Ежедневная статистика', icon: '📈' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
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
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Общая статистика переходов</h3>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedPost.stats.totalClicks.toLocaleString()}</div>
                      <div className="text-blue-100">Всего переходов</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedPost.stats.uniqueVisitors.toLocaleString()}</div>
                      <div className="text-green-100">Уникальных посетителей</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedPost.stats.conversions}</div>
                      <div className="text-purple-100">Конверсий</div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedPost.stats.unsubscribes}</div>
                      <div className="text-red-100">Отписок</div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Время на посту</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{selectedPost.stats.avgTimeOnPost} сек</div>
                      <div className="text-sm text-gray-600">Среднее время</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Bounce Rate</h4>
                      <div className="text-3xl font-bold text-orange-600 mb-2">{selectedPost.stats.bounceRate}%</div>
                      <div className="text-sm text-gray-600">Процент отказов</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Конверсия</h4>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {selectedPost.stats.totalClicks > 0 ? ((selectedPost.stats.conversions / selectedPost.stats.totalClicks) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">От переходов</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'behavior' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Поведение пользователей</h3>
                  
                  <div className="space-y-6">
                    {/* User Actions Chart */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Действия пользователей</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedPost.stats.totalClicks}</div>
                          <div className="text-sm text-gray-600">Переходы</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{selectedPost.stats.conversions}</div>
                          <div className="text-sm text-gray-600">Конверсии</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{selectedPost.stats.unsubscribes}</div>
                          <div className="text-sm text-gray-600">Отписки</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {selectedPost.userBehavior.filter(b => b.action === 'share').length}
                          </div>
                          <div className="text-sm text-gray-600">Репосты</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedPost.userBehavior.filter(b => b.action === 'subscribe').length}
                          </div>
                          <div className="text-sm text-gray-600">Подписки</div>
                        </div>
                      </div>
                    </div>

                    {/* Recent User Behavior */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Последние действия</h4>
                      <div className="space-y-3">
                        {selectedPost.userBehavior.slice(0, 10).map((behavior, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                behavior.action === 'click' ? 'bg-blue-500' :
                                behavior.action === 'conversion' ? 'bg-green-500' :
                                behavior.action === 'unsubscribe' ? 'bg-red-500' :
                                behavior.action === 'share' ? 'bg-purple-500' : 'bg-orange-500'
                              }`}></div>
                              <span className="font-medium text-gray-700">
                                {behavior.action === 'click' ? 'Переход' :
                                 behavior.action === 'conversion' ? 'Конверсия' :
                                 behavior.action === 'unsubscribe' ? 'Отписка' :
                                 behavior.action === 'share' ? 'Репост' : 'Подписка'}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">{behavior.source}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(behavior.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sources' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Источники трафика</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sources Chart */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Распределение по источникам</h4>
                      <div className="space-y-4">
                        {selectedPost.stats.sources.map((source, index) => (
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
                      {selectedPost.stats.sources.map((source, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-gray-800">{source.name}</h5>
                            <span className="text-sm font-medium" style={{ color: source.color }}>
                              {source.clicks}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{source.conversions} конверсий</span>
                            <span>Конверсия: {source.clicks > 0 ? ((source.conversions / source.clicks) * 100).toFixed(1) : 0}%</span>
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
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Переходы</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Уникальные</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Конверсии</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Отписки</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPost.stats.dailyStats.map((stat, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-700">
                              {new Date(stat.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right text-blue-600 font-medium">
                              {stat.clicks}
                            </td>
                            <td className="py-3 px-4 text-right text-green-600 font-medium">
                              {stat.uniqueVisitors}
                            </td>
                            <td className="py-3 px-4 text-right text-purple-600 font-medium">
                              {stat.conversions}
                            </td>
                            <td className="py-3 px-4 text-right text-red-600 font-medium">
                              {stat.unsubscribes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Post Modal */}
        {showAddPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Добавить пост для отслеживания</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка на пост</label>
                  <input
                    type="url"
                    value={newPost.originalUrl}
                    onChange={(e) => setNewPost({...newPost, originalUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://t.me/channel/123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название поста</label>
                  <input
                    type="text"
                    value={newPost.postTitle}
                    onChange={(e) => setNewPost({...newPost, postTitle: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Название поста"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название канала</label>
                  <input
                    type="text"
                    value={newPost.channelName}
                    onChange={(e) => setNewPost({...newPost, channelName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="@channel_name"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddPost(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={addTrackingPost}
                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600"
                  >
                    Создать отслеживание
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostTracking; 