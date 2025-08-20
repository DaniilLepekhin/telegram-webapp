import React, { useState, useEffect } from 'react';
import { usePaste } from '../hooks/usePaste';
import UserStats from './UserStats';

interface TelegramChannel {
  id: number;
  title: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
  isAdmin: boolean;
  canInviteUsers: boolean;
  memberCount?: number;
  botIsAdmin?: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  media: string[];
  buttons: Button[];
  channelId: string;
  channelName: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
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
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<TelegramChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [sessionStartTime] = useState(() => Date.now());
  
  // Хуки для вставки из буфера
  const titlePaste = usePaste((text) => setPost(prev => ({ ...prev, title: text })));
  const contentPaste = usePaste((text) => setPost(prev => ({ ...prev, content: text })));
  
  const [post, setPost] = useState<Partial<Post>>({
    title: '',
    content: '',
    media: [],
    buttons: [],
    status: 'draft'
  });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  // Отправка аналитики
  const sendAnalytics = async (actionType: string, actionData?: any) => {
    try {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        await fetch('/api/telegram/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: webApp.initData,
            actionType,
            actionData,
            pageUrl: window.location.pathname,
            sessionId
          })
        });
      }
    } catch (error) {
      console.error('Error sending analytics:', error);
    }
  };

  // Завершение сессии при размонтировании компонента
  useEffect(() => {
    return () => {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      sendAnalytics('session_end', { duration: sessionDuration });
    };
  }, [sessionStartTime]);

  // Определение каналов
  const detectChannels = async () => {
    setLoading(true);
    setLogs([]);
    addLog('🔍 Начинаем поиск каналов...');

    try {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        addLog('✅ Telegram WebApp доступен');
        
        // Пытаемся получить каналы через API
        const response = await fetch('/api/telegram/get-channels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: webApp.initData,
            user: webApp.initDataUnsafe?.user,
            sessionId
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.channels) {
            addLog(`✅ Найдено каналов через API: ${data.channels.length}`);
            setChannels(data.channels);
            if (data.channels.length > 0) {
              setSelectedChannel(data.channels[0]);
            }
          } else {
            addLog('⚠️ API вернул ошибку, используем демо-данные');
            useDemoChannels();
          }
        } else {
          addLog('⚠️ Ошибка API, используем демо-данные');
          useDemoChannels();
        }
      } else {
        addLog('⚠️ Telegram WebApp недоступен, используем демо-данные');
        useDemoChannels();
      }
    } catch (error) {
      addLog(`❌ Ошибка: ${error}`);
      useDemoChannels();
    } finally {
      setLoading(false);
    }
  };

  const useDemoChannels = () => {
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
      },
      {
        id: 3,
        title: 'Новости проекта',
        username: 'news_channel',
        type: 'channel',
        isAdmin: true,
        canInviteUsers: true,
        memberCount: 8920,
        botIsAdmin: false
      }
    ];
    
    addLog(`✅ Загружено демо-каналов: ${demoChannels.length}`);
    setChannels(demoChannels);
    setSelectedChannel(demoChannels[0]);
  };

  useEffect(() => {
    detectChannels();
  }, []);

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
    if (!selectedChannel || !post.title || !post.content) {
      alert('Заполните все обязательные поля!');
      return;
    }

    setLoading(true);
    addLog('🚀 Начинаем публикацию поста...');

    // Отправляем аналитику о создании поста
    await sendAnalytics('post_created', {
      channelId: selectedChannel.id,
      channelName: selectedChannel.title,
      postTitle: post.title,
      buttonsCount: post.buttons?.length || 0
    });

    try {
      const postData = {
        ...post,
        channelId: selectedChannel.id.toString(),
        channelName: selectedChannel.title,
        publishedAt: new Date(),
        status: 'published' as const
      };

      // Сохраняем в localStorage для демонстрации
      const savedPosts = JSON.parse(localStorage.getItem('telegram_posts') || '[]');
      const newPost = {
        ...postData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      savedPosts.unshift(newPost);
      localStorage.setItem('telegram_posts', JSON.stringify(savedPosts));

      addLog('✅ Пост сохранен локально');

      // Имитация отправки в Telegram
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addLog('✅ Пост успешно опубликован в Telegram!');
      alert('Пост успешно опубликован!');

      // Очищаем форму
      setPost({
        title: '',
        content: '',
        media: [],
        buttons: [],
        status: 'draft'
      });

    } catch (error) {
      addLog(`❌ Ошибка публикации: ${error}`);
      alert('Ошибка при публикации поста');
    } finally {
      setLoading(false);
    }
  };

  const getPublishedPosts = () => {
    try {
      return JSON.parse(localStorage.getItem('telegram_posts') || '[]');
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Выберите канал</h3>
                <button
                  onClick={detectChannels}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? '🔍 Поиск...' : '🔄 Обновить'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 ">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Поиск каналов...</h3>
                  <p className="text-white/60">Анализируем ваши права в Telegram</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => {
                      setSelectedChannel(channel);
                      sendAnalytics('channel_selected', {
                        channelId: channel.id,
                        channelName: channel.title,
                        channelType: channel.type
                      });
                    }}
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
                    </button>
                  ))}
                </div>
              )}

              {/* Debug Logs */}
              {logs.length > 0 && (
                <div className="mt-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">🔍 Логи отладки</h4>
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
                  </div>
                  <div className="bg-black/50 rounded-lg p-3 max-h-32 overflow-y-auto">
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
                    onPaste={titlePaste.handlePaste}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    placeholder="Введите заголовок поста..."
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Текст поста</label>
                  <textarea
                    value={post.content}
                    onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                    onPaste={contentPaste.handlePaste}
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
                disabled={loading || !selectedChannel || !post.title || !post.content}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                {loading ? 'Публикуем...' : '🚀 Опубликовать пост'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">История постов</h3>
            <div className="space-y-4">
              {getPublishedPosts().map((post: Post) => (
                <div key={post.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-white">{post.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.status === 'published' ? 'bg-green-500/20 text-green-300' :
                      post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {post.status === 'published' ? 'Опубликован' :
                       post.status === 'scheduled' ? 'Запланирован' : 'Ошибка'}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{post.channelName}</p>
                  <p className="text-white/60 text-xs">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {getPublishedPosts().length === 0 && (
                <div className="text-white/60 text-center py-8">
                  <div className="text-4xl mb-2">📋</div>
                  <div>История постов пуста</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <UserStats />
            
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Аналитика постов</h3>
              <div className="text-white/60 text-center py-8">
                <div className="text-4xl mb-2">📊</div>
                <div>Аналитика постов будет доступна здесь</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostBuilder; 