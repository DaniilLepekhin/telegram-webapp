import React, { useState, useEffect } from 'react';

interface PostData {
  id: string;
  channelId: string;
  title: string;
  content: string;
  postUrl: string;
  publishDate: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  conversions: number;
  trafficSources: TrafficSource[];
  dailyStats: PostDailyStat[];
  engagementRate: number;
  ctr: number;
  conversionRate: number;
}

interface TrafficSource {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface PostDailyStat {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

const PostAnalytics: React.FC = () => {
  const [posts, setPosts] = useState<PostData[]>([
    {
      id: '1',
      channelId: '1',
      title: 'Как увеличить продажи в 3 раза',
      content: 'Практические советы по увеличению продаж...',
      postUrl: 'https://t.me/my_channel/123',
      publishDate: '2024-02-15',
      views: 15420,
      likes: 892,
      comments: 156,
      shares: 234,
      saves: 89,
      clicks: 1234,
      conversions: 67,
      engagementRate: 8.5,
      ctr: 8.0,
      conversionRate: 5.4,
      trafficSources: [
        { name: 'Органический трафик', count: 8920, percentage: 58, color: '#10B981' },
        { name: 'Реклама ВКонтакте', count: 3240, percentage: 21, color: '#3B82F6' },
        { name: 'Instagram Ads', count: 2160, percentage: 14, color: '#F59E0B' },
        { name: 'Прямые переходы', count: 1100, percentage: 7, color: '#EF4444' }
      ],
      dailyStats: [
        { date: '2024-02-15', views: 2340, likes: 156, comments: 23, shares: 45, clicks: 234 },
        { date: '2024-02-14', views: 1890, likes: 134, comments: 19, shares: 38, clicks: 189 },
        { date: '2024-02-13', views: 1456, likes: 98, comments: 15, shares: 29, clicks: 145 },
        { date: '2024-02-12', views: 2012, likes: 167, comments: 28, shares: 52, clicks: 201 },
        { date: '2024-02-11', views: 1789, likes: 145, comments: 22, shares: 41, clicks: 178 },
        { date: '2024-02-10', views: 2345, likes: 198, comments: 31, shares: 58, clicks: 234 },
        { date: '2024-02-09', views: 1678, likes: 123, comments: 18, shares: 34, clicks: 167 }
      ]
    },
    {
      id: '2',
      channelId: '1',
      title: 'Новый продукт уже в продаже!',
      content: 'Представляем наш новый продукт...',
      postUrl: 'https://t.me/my_channel/124',
      publishDate: '2024-02-14',
      views: 8920,
      likes: 567,
      comments: 89,
      shares: 123,
      saves: 45,
      clicks: 892,
      conversions: 45,
      engagementRate: 9.2,
      ctr: 10.0,
      conversionRate: 5.0,
      trafficSources: [
        { name: 'Органический трафик', count: 5340, percentage: 60, color: '#10B981' },
        { name: 'Реклама ВКонтакте', count: 1780, percentage: 20, color: '#3B82F6' },
        { name: 'Instagram Ads', count: 1240, percentage: 14, color: '#F59E0B' },
        { name: 'Прямые переходы', count: 560, percentage: 6, color: '#EF4444' }
      ],
      dailyStats: [
        { date: '2024-02-14', views: 1890, likes: 134, comments: 19, shares: 38, clicks: 189 },
        { date: '2024-02-13', views: 1456, likes: 98, comments: 15, shares: 29, clicks: 145 },
        { date: '2024-02-12', views: 2012, likes: 167, comments: 28, shares: 52, clicks: 201 },
        { date: '2024-02-11', views: 1789, likes: 145, comments: 22, shares: 41, clicks: 178 },
        { date: '2024-02-10', views: 2345, likes: 198, comments: 31, shares: 58, clicks: 234 },
        { date: '2024-02-09', views: 1678, likes: 123, comments: 18, shares: 34, clicks: 167 },
        { date: '2024-02-08', views: 1456, likes: 98, comments: 15, shares: 29, clicks: 145 }
      ]
    }
  ]);

  const [selectedPost, setSelectedPost] = useState<PostData | null>(posts[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'daily' | 'engagement'>('overview');
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    postUrl: ''
  });

  const addPost = () => {
    if (!newPost.title || !newPost.content || !newPost.postUrl) return;

    const post: PostData = {
      id: Date.now().toString(),
      channelId: '1',
      title: newPost.title,
      content: newPost.content,
      postUrl: newPost.postUrl,
      publishDate: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
      conversions: 0,
      engagementRate: 0,
      ctr: 0,
      conversionRate: 0,
      trafficSources: [],
      dailyStats: []
    };

    setPosts([post, ...posts]);
    setSelectedPost(post);
    setShowAddPost(false);
    setNewPost({ title: '', content: '', postUrl: '' });
  };

  const generateTrackingLink = (post: PostData) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        action: 'generate_tracking_link',
        postId: post.id,
        postTitle: post.title,
        postUrl: post.postUrl
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Аналитика постов</h1>
          <p className="text-lg text-gray-600">Отслеживайте эффективность каждого поста</p>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Ваши посты</h2>
            <button
              onClick={() => setShowAddPost(true)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              + Добавить пост
            </button>
          </div>
          
          <div className="space-y-4">
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPost?.id === post.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{post.publishDate}</p>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-blue-600">👁 {post.views.toLocaleString()}</span>
                      <span className="text-red-600">❤️ {post.likes}</span>
                      <span className="text-green-600">💬 {post.comments}</span>
                      <span className="text-purple-600">📤 {post.shares}</span>
                      <span className="text-orange-600">🔗 {post.clicks}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{post.engagementRate}%</div>
                    <div className="text-xs text-gray-500">Engagement</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedPost && (
          <div className="bg-white rounded-xl shadow-lg">
            {/* Post Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPost.title}</h2>
                  <p className="text-gray-600 mb-2">{selectedPost.publishDate}</p>
                  <a 
                    href={selectedPost.postUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 text-sm"
                  >
                    {selectedPost.postUrl}
                  </a>
                </div>
                <button
                  onClick={() => generateTrackingLink(selectedPost)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  🔗 Создать ссылку отслеживания
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Обзор', icon: '📊' },
                  { id: 'traffic', label: 'Источники трафика', icon: '🌐' },
                  { id: 'daily', label: 'Ежедневная статистика', icon: '📈' },
                  { id: 'engagement', label: 'Вовлечённость', icon: '💬' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
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
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Общая статистика поста</h3>
                  
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedPost.views.toLocaleString()}</div>
                      <div className="text-blue-100">Просмотров</div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedPost.likes}</div>
                      <div className="text-red-100">Лайков</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedPost.comments}</div>
                      <div className="text-green-100">Комментариев</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                      <div className="text-3xl font-bold mb-2">{selectedPost.shares}</div>
                      <div className="text-purple-100">Репостов</div>
                    </div>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Вовлечённость</h4>
                      <div className="text-3xl font-bold text-purple-600 mb-2">{selectedPost.engagementRate}%</div>
                      <div className="text-sm text-gray-600">Лайки + комментарии / просмотры</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">CTR</h4>
                      <div className="text-3xl font-bold text-blue-600 mb-2">{selectedPost.ctr}%</div>
                      <div className="text-sm text-gray-600">Клики / просмотры</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Конверсия</h4>
                      <div className="text-3xl font-bold text-green-600 mb-2">{selectedPost.conversionRate}%</div>
                      <div className="text-sm text-gray-600">Конверсии / клики</div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Дополнительная статистика</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Клики по ссылкам</span>
                          <span className="font-semibold">{selectedPost.clicks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Сохранения</span>
                          <span className="font-semibold">{selectedPost.saves}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Конверсии</span>
                          <span className="font-semibold">{selectedPost.conversions}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Средние показатели</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Просмотров в день</span>
                          <span className="font-semibold">{Math.round(selectedPost.views / 7)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Лайков в день</span>
                          <span className="font-semibold">{Math.round(selectedPost.likes / 7)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Комментариев в день</span>
                          <span className="font-semibold">{Math.round(selectedPost.comments / 7)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'traffic' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Источники трафика поста</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Traffic Sources Chart */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Распределение по источникам</h4>
                      <div className="space-y-4">
                        {selectedPost.trafficSources.map((source, index) => (
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

                    {/* Traffic Source Details */}
                    <div className="space-y-4">
                      {selectedPost.trafficSources.map((source, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-gray-800">{source.name}</h5>
                            <span className="text-sm font-medium" style={{ color: source.color }}>
                              {source.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{source.percentage}% от общего трафика</span>
                            <span>Конверсия: {Math.round(source.percentage * 0.6)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'daily' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Ежедневная статистика поста</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-800">Дата</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Просмотры</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Лайки</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Комментарии</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Репосты</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-800">Клики</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPost.dailyStats.map((stat, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-700">
                              {new Date(stat.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right text-blue-600 font-medium">
                              {stat.views.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-red-600 font-medium">
                              {stat.likes}
                            </td>
                            <td className="py-3 px-4 text-right text-green-600 font-medium">
                              {stat.comments}
                            </td>
                            <td className="py-3 px-4 text-right text-purple-600 font-medium">
                              {stat.shares}
                            </td>
                            <td className="py-3 px-4 text-right text-orange-600 font-medium">
                              {stat.clicks}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'engagement' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Анализ вовлечённости</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Engagement Chart */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Вовлечённость по дням</h4>
                      <div className="flex items-end justify-between h-32">
                        {selectedPost.dailyStats.map((stat, index) => {
                          const engagement = ((stat.likes + stat.comments) / stat.views) * 100;
                          return (
                            <div key={index} className="flex flex-col items-center">
                              <div
                                className="bg-purple-500 rounded-t w-8 transition-all duration-300 hover:bg-purple-600"
                                style={{ height: `${(engagement / Math.max(...selectedPost.dailyStats.map(s => ((s.likes + s.comments) / s.views) * 100))) * 100}%` }}
                              ></div>
                              <div className="text-xs text-gray-600 mt-2">{engagement.toFixed(1)}%</div>
                              <div className="text-xs text-gray-500">День {index + 1}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Engagement Analysis */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Показатели вовлечённости</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Общая вовлечённость</span>
                            <span className="font-semibold text-purple-600">{selectedPost.engagementRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Лайки/просмотры</span>
                            <span className="font-semibold">{(selectedPost.likes / selectedPost.views * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Комментарии/просмотры</span>
                            <span className="font-semibold">{(selectedPost.comments / selectedPost.views * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Репосты/просмотры</span>
                            <span className="font-semibold">{(selectedPost.shares / selectedPost.views * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Рекомендации</h4>
                        <div className="space-y-2 text-sm">
                          {selectedPost.engagementRate > 8 ? (
                            <p className="text-green-600">✅ Отличная вовлечённость! Продолжайте в том же духе.</p>
                          ) : (
                            <p className="text-orange-600">⚠️ Вовлечённость ниже среднего. Попробуйте добавить больше интерактивности.</p>
                          )}
                          {selectedPost.ctr > 7 ? (
                            <p className="text-green-600">✅ Высокий CTR! Ссылки работают эффективно.</p>
                          ) : (
                            <p className="text-orange-600">⚠️ CTR можно улучшить. Попробуйте более привлекательные призывы к действию.</p>
                          )}
                        </div>
                      </div>
                    </div>
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
              <h3 className="text-xl font-bold text-gray-800 mb-4">Добавить новый пост</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заголовок поста</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Введите заголовок поста"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Содержание</label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Краткое описание поста"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка на пост</label>
                  <input
                    type="url"
                    value={newPost.postUrl}
                    onChange={(e) => setNewPost({...newPost, postUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://t.me/channel/123"
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
                    onClick={addPost}
                    className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
                  >
                    Добавить
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

export default PostAnalytics; 