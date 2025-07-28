import React, { useState } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

interface Post {
  id: string;
  title: string;
  content: string;
  media: string[];
  buttons: Button[];
  channel: string;
  scheduledAt?: Date;
}

interface Button {
  id: string;
  text: string;
  type: 'url' | 'callback' | 'web_app';
  url?: string;
  callback?: string;
}

const PostBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'analytics'>('create');
  const [post, setPost] = useState<Partial<Post>>({
    title: '',
    content: '',
    media: [],
    buttons: [],
    channel: ''
  });
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const channels = [
    { id: '1', name: 'Основной канал', subscribers: 15420 },
    { id: '2', name: 'Новости', subscribers: 8920 },
    { id: '3', name: 'Анонсы', subscribers: 3240 }
  ];

  const handleAddButton = () => {
    const newButton: Button = {
      id: Date.now().toString(),
      text: 'Новая кнопка',
      type: 'url',
      url: ''
    };
    setPost(prev => ({
      ...prev,
      buttons: [...(prev.buttons || []), newButton]
    }));
  };

  const handleButtonChange = (buttonId: string, field: keyof Button, value: string) => {
    setPost(prev => ({
      ...prev,
      buttons: prev.buttons?.map(btn => 
        btn.id === buttonId ? { ...btn, [field]: value } : btn
      )
    }));
  };

  const handleRemoveButton = (buttonId: string) => {
    setPost(prev => ({
      ...prev,
      buttons: prev.buttons?.filter(btn => btn.id !== buttonId)
    }));
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      // Здесь будет логика публикации
      console.log('Публикуем пост:', post);
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Пост успешно опубликован!');
    } catch (error) {
      alert('Ошибка при публикации поста');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <BackButton onClick={() => window.history.back()} />
      <FullscreenButton />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">📝</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
            Конструктор постов
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
            Создавайте красивые посты с кнопками для Telegram каналов
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-xl rounded-2xl p-1 mb-8">
          {[
            { id: 'create', label: 'Создать пост', icon: '✏️' },
            { id: 'history', label: 'История', icon: '📋' },
            { id: 'analytics', label: 'Аналитика', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Channel Selection */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Выберите канал</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedChannel === channel.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/10 hover:border-white/40'
                    }`}
                  >
                    <div className="text-white font-semibold">{channel.name}</div>
                    <div className="text-white/60 text-sm">{channel.subscribers.toLocaleString()} подписчиков</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Post Content */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Содержание поста</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Заголовок</label>
                  <input
                    type="text"
                    value={post.title}
                    onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="Введите заголовок поста..."
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Текст поста</label>
                  <textarea
                    value={post.content}
                    onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Введите текст поста... Поддерживается HTML разметка"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Медиа файлы</label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-white/60">Перетащите фото/видео сюда или кликните для выбора</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Кнопки</h3>
                <button
                  onClick={handleAddButton}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  + Добавить кнопку
                </button>
              </div>

              <div className="space-y-4">
                {post.buttons?.map((button, index) => (
                  <div key={button.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">Кнопка {index + 1}</span>
                      <button
                        onClick={() => handleRemoveButton(button.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/60 text-sm mb-1">Текст кнопки</label>
                        <input
                          type="text"
                          value={button.text}
                          onChange={(e) => handleButtonChange(button.id, 'text', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/60 text-sm mb-1">Тип</label>
                        <select
                          value={button.type}
                          onChange={(e) => handleButtonChange(button.id, 'type', e.target.value as any)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                        >
                          <option value="url">URL</option>
                          <option value="callback">Callback</option>
                          <option value="web_app">Web App</option>
                        </select>
                      </div>
                    </div>

                    {button.type === 'url' && (
                      <div className="mt-3">
                        <label className="block text-white/60 text-sm mb-1">URL</label>
                        <input
                          type="url"
                          value={button.url || ''}
                          onChange={(e) => handleButtonChange(button.id, 'url', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Publish Button */}
            <div className="text-center">
              <button
                onClick={handlePublish}
                disabled={isLoading || !selectedChannel || !post.title || !post.content}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                {isLoading ? 'Публикуем...' : '🚀 Опубликовать пост'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">История постов</h3>
            <div className="text-white/60 text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <div>История постов будет доступна здесь</div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Аналитика постов</h3>
            <div className="text-white/60 text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <div>Аналитика будет доступна здесь</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostBuilder; 