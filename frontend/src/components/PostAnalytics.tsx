import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

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
  const [posts, setPosts] = useState<PostData[]>([]);

  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Красивая кнопка "Назад" */}
      <BackButton onClick={() => {
        if ((window as any).handleGoBack) {
          (window as any).handleGoBack();
        } else {
          window.location.reload();
        }
      }} />
      
      {/* Кнопка полноэкранного режима */}
      <FullscreenButton />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">📝</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
            Аналитика постов
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
            Подробная статистика и аналитика ваших постов
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Add Post Button */}
          <div className="flex justify-end">
            <button
              onClick={addPost}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
            >
              ➕ Добавить пост
            </button>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Нет постов для анализа</h3>
              <p className="text-white/60 text-lg mb-6">
                Добавьте свои посты, чтобы начать отслеживать их статистику
              </p>
              <button
                onClick={() => setShowAddPost(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105"
              >
                ➕ Добавить первый пост
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                      <p className="text-white/60 text-sm mb-2">{post.publishDate}</p>
                      <p className="text-white/80 text-sm line-clamp-2">{post.content}</p>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {post.engagementRate}% вовлеченность
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{post.views.toLocaleString()}</div>
                      <div className="text-white/60 text-sm">Просмотры</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{post.likes.toLocaleString()}</div>
                      <div className="text-white/60 text-sm">Лайки</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{post.comments.toLocaleString()}</div>
                      <div className="text-white/60 text-sm">Комментарии</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{post.clicks.toLocaleString()}</div>
                      <div className="text-white/60 text-sm">Клики</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateTrackingLink(post)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                    >
                      🔗 Создать ссылку
                    </button>
                    <button
                      onClick={() => {/* View details */}}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                    >
                      📊 Детали
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostAnalytics; 