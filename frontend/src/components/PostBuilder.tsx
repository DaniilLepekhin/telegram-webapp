import React, { useState, useRef } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

interface PostButton {
  id: string;
  text: string;
  url: string;
  type: 'url' | 'callback' | 'web_app';
}

interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
  order: number;
}

interface PostContent {
  text: string;
  media: MediaFile[];
  buttons: PostButton[];
  htmlEnabled: boolean;
  channelId?: string;
}

interface Channel {
  id: string;
  title: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
  isAdmin: boolean;
  botIsAdmin: boolean;
  memberCount: number;
}

interface PostHistory {
  id: string;
  channelId: string;
  channelTitle: string;
  text: string;
  mediaCount: number;
  buttonCount: number;
  sentAt: string;
  views: number;
  clicks: number;
  ctr: number; // Click-through rate
}

const PostBuilder: React.FC = () => {
  const [postContent, setPostContent] = useState<PostContent>({
    text: '',
    media: [],
    buttons: [],
    htmlEnabled: true
  });

  const [activeTab, setActiveTab] = useState<'compose' | 'preview' | 'templates' | 'history' | 'channels'>('compose');
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [editingButton, setEditingButton] = useState<PostButton | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [channels, setChannels] = useState<Channel[]>([]);
  const [postHistory, setPostHistory] = useState<PostHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получить каналы пользователя
  const fetchUserChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем ID пользователя из Telegram WebApp
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!userId) {
        throw new Error('Не удалось получить ID пользователя');
      }

      const response = await fetch(`/api/channels/user-channels/${userId}`);
      const data = await response.json();

      if (data.success) {
        setChannels(data.channels);
      } else {
        throw new Error(data.error || 'Ошибка при получении каналов');
      }
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Проверить права в канале
  const checkChannelPermissions = async (channelId: string) => {
    try {
      const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!userId) return;

      const response = await fetch(`/api/channels/check-permissions/${channelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      
      if (data.success) {
        // Обновляем права в локальном состоянии
        setChannels(prev => prev.map(channel => 
          channel.id === channelId 
            ? { 
                ...channel, 
                isAdmin: data.permissions.userIsAdmin,
                botIsAdmin: data.permissions.botIsAdmin
              }
            : channel
        ));
      }
    } catch (err) {
      console.error('Error checking permissions:', err);
    }
  };

  // Получить историю постов канала
  const fetchChannelPosts = async (channelId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/channels/channel-posts/${channelId}`);
      const data = await response.json();

      if (data.success) {
        setPostHistory(data.posts);
      } else {
        throw new Error(data.error || 'Ошибка при получении постов');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании компонента
  React.useEffect(() => {
    fetchUserChannels();
  }, []);

  // Загружаем историю постов при выборе канала
  React.useEffect(() => {
    if (selectedChannel) {
      fetchChannelPosts(selectedChannel.id);
    }
  }, [selectedChannel]);

  const handleBack = () => {
    if ((window as any).handleGoBack) {
      (window as any).handleGoBack();
    } else {
      window.location.reload();
    }
  };

  const addButton = () => {
    setEditingButton({
      id: Date.now().toString(),
      text: '',
      url: '',
      type: 'url'
    });
    setShowButtonModal(true);
  };

  const saveButton = () => {
    if (!editingButton || !editingButton.text || !editingButton.url) return;

    if (editingButton.id) {
      // Редактирование существующей кнопки
      setPostContent(prev => ({
        ...prev,
        buttons: prev.buttons.map(btn => 
          btn.id === editingButton.id ? editingButton : btn
        )
      }));
    } else {
      // Добавление новой кнопки
      setPostContent(prev => ({
        ...prev,
        buttons: [...prev.buttons, editingButton]
      }));
    }

    setShowButtonModal(false);
    setEditingButton(null);
  };

  const removeButton = (buttonId: string) => {
    setPostContent(prev => ({
      ...prev,
      buttons: prev.buttons.filter(btn => btn.id !== buttonId)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newMedia: MediaFile[] = files.map((file, index) => ({
      id: Date.now().toString() + index,
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      order: postContent.media.length + index
    }));

    setPostContent(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia]
    }));
  };

  const removeMedia = (mediaId: string) => {
    setPostContent(prev => ({
      ...prev,
      media: prev.media.filter(media => media.id !== mediaId)
    }));
  };

  const reorderMedia = (mediaId: string, direction: 'up' | 'down') => {
    setPostContent(prev => {
      const media = [...prev.media];
      const index = media.findIndex(m => m.id === mediaId);
      
      if (direction === 'up' && index > 0) {
        [media[index], media[index - 1]] = [media[index - 1], media[index]];
      } else if (direction === 'down' && index < media.length - 1) {
        [media[index], media[index + 1]] = [media[index + 1], media[index]];
      }

      // Обновляем порядок
      media.forEach((item, idx) => {
        item.order = idx;
      });

      return { ...prev, media };
    });
  };

  const clearMedia = () => {
    setPostContent(prev => ({
      ...prev,
      media: []
    }));
  };

  const selectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setPostContent(prev => ({ ...prev, channelId: channel.id }));
    setShowChannelModal(false);
  };

  const applyTemplate = (template: string) => {
    switch (template) {
      case 'text-only':
        setPostContent({
          text: '<b>Заголовок</b>\n\nОписание поста с <i>форматированием</i>',
          media: [],
          buttons: [],
          htmlEnabled: true,
          channelId: selectedChannel?.id
        });
        break;
      case 'text-with-button':
        setPostContent({
          text: '<b>Заголовок</b>\n\nОписание с кнопкой действия',
          media: [],
          buttons: [{ id: '1', text: 'Подробнее', url: 'https://example.com', type: 'url' }],
          htmlEnabled: true,
          channelId: selectedChannel?.id
        });
        break;
      case 'photo-with-text':
        setPostContent({
          text: '<b>Фото с описанием</b>\n\nКраткое описание к изображению',
          media: [],
          buttons: [],
          htmlEnabled: true,
          channelId: selectedChannel?.id
        });
        break;
      case 'mixed-media':
        setPostContent({
          text: '<b>Смешанный контент</b>\n\nФото и видео в одном посте',
          media: [],
          buttons: [
            { id: '1', text: 'Смотреть все', url: 'https://example.com', type: 'url' },
            { id: '2', text: 'Подписаться', url: 'https://t.me/channel', type: 'url' }
          ],
          htmlEnabled: true,
          channelId: selectedChannel?.id
        });
        break;
    }
  };

  const sendPost = async () => {
    if (!postContent.text.trim()) {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Добавьте текст к посту');
      }
      return;
    }

    if (!selectedChannel) {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Выберите канал для публикации');
      }
      return;
    }

    try {
      setLoading(true);
      
      // Проверяем права перед отправкой
      await checkChannelPermissions(selectedChannel.id);
      
      const currentChannel = channels.find(c => c.id === selectedChannel.id);
      if (!currentChannel?.isAdmin || !currentChannel?.botIsAdmin) {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert('Недостаточно прав для публикации в этом канале');
        }
        return;
      }

      // Сохраняем пост в базу данных
      const response = await fetch('/api/channels/save-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          text: postContent.text,
          mediaCount: postContent.media.length,
          buttonCount: postContent.buttons.length,
          buttons: postContent.buttons
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.showAlert('Пост успешно отправлен в канал!');
        }
        
        // Обновляем историю постов
        if (selectedChannel) {
          fetchChannelPosts(selectedChannel.id);
        }
        
        // Очищаем форму
        setPostContent({
          text: '',
          media: [],
          buttons: [],
          htmlEnabled: true,
          channelId: selectedChannel.id
        });
      } else {
        throw new Error(data.error || 'Ошибка при отправке поста');
      }
    } catch (err) {
      console.error('Error sending post:', err);
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert(`Ошибка при отправке поста: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const availableChannels = channels.filter(channel => channel.isAdmin && channel.botIsAdmin);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Кнопка "Назад" */}
      <BackButton onClick={handleBack} />

      {/* Кнопка полноэкранного режима */}
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

        {/* Channel Selector */}
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="text-lg font-bold text-white">Канал для публикации</h3>
              {selectedChannel ? (
                <div>
                  <p className="text-white/70 text-sm">
                    {selectedChannel.title} • {selectedChannel.memberCount.toLocaleString()} подписчиков
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedChannel.isAdmin ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {selectedChannel.isAdmin ? '✅ Админ' : '❌ Не админ'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedChannel.botIsAdmin ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {selectedChannel.botIsAdmin ? '🤖 Бот админ' : '❌ Бот не админ'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-red-400 text-sm">Канал не выбран</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              )}
              <button
                onClick={() => setShowChannelModal(true)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {selectedChannel ? 'Изменить' : 'Выбрать канал'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg mx-4 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="glass-card mb-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'compose', label: 'Создать', icon: '✏️' },
              { id: 'preview', label: 'Предпросмотр', icon: '👁️' },
              { id: 'templates', label: 'Шаблоны', icon: '📋' },
              { id: 'history', label: 'История', icon: '📚' },
              { id: 'channels', label: 'Каналы', icon: '📢' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-400 bg-green-500/10'
                    : 'border-transparent text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            {/* Text Editor */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Текст поста</h3>
                <label className="flex items-center space-x-2 text-white/80">
                  <input
                    type="checkbox"
                    checked={postContent.htmlEnabled}
                    onChange={(e) => setPostContent(prev => ({ ...prev, htmlEnabled: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">HTML разметка</span>
                </label>
              </div>
              
              <textarea
                value={postContent.text}
                onChange={(e) => setPostContent(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Введите текст поста... Поддерживается HTML разметка: <b>жирный</b>, <i>курсив</i>, <code>код</code>"
                className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm resize-none focus:outline-none focus:border-white/40"
              />
              
              {postContent.htmlEnabled && (
                <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-300 font-semibold mb-2">Доступные HTML теги:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-200">
                    <div>&lt;b&gt;жирный текст&lt;/b&gt;</div>
                    <div>&lt;i&gt;курсив&lt;/i&gt;</div>
                    <div>&lt;code&gt;код&lt;/code&gt;</div>
                    <div>&lt;pre&gt;блок кода&lt;/pre&gt;</div>
                    <div>&lt;a href="..."&gt;ссылка&lt;/a&gt;</div>
                    <div>&lt;s&gt;зачеркнутый&lt;/s&gt;</div>
                  </div>
                </div>
              )}
            </div>

            {/* Media Upload */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Медиа файлы</h3>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    📁 Добавить файлы
                  </button>
                  
                  {postContent.media.length > 0 && (
                    <button
                      onClick={clearMedia}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🗑️ Очистить все
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {postContent.media.length > 0 && (
                  <div className="space-y-3">
                    {postContent.media.map((media, index) => (
                      <div key={media.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden">
                            {media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt={`Media ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {media.file.name}
                          </div>
                          <div className="text-white/60 text-sm">
                            {media.type === 'image' ? '🖼️ Изображение' : '🎥 Видео'} • 
                            {(media.file.size / 1024 / 1024).toFixed(1)} МБ
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => reorderMedia(media.id, 'up')}
                            disabled={index === 0}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => reorderMedia(media.id, 'down')}
                            disabled={index === postContent.media.length - 1}
                            className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeMedia(media.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Кнопки</h3>
                <button
                  onClick={addButton}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ➕ Добавить кнопку
                </button>
              </div>

              {postContent.buttons.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <div className="text-4xl mb-2">🔘</div>
                  <p>Кнопки не добавлены</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {postContent.buttons.map((button, index) => (
                    <div key={button.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <div className="text-white font-medium">{button.text}</div>
                        <div className="text-white/60 text-sm">{button.url}</div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingButton(button);
                            setShowButtonModal(true);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => removeButton(button.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Send Button */}
            <div className="text-center">
              <button
                onClick={sendPost}
                disabled={!selectedChannel || loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Отправка...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Отправить в канал</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Предпросмотр поста</h3>
            
            <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
              {/* Media Preview */}
              {postContent.media.length > 0 && (
                <div className="mb-4">
                  {postContent.media.length > 1 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {postContent.media.slice(0, 4).map((media, index) => (
                        <div key={media.id} className="aspect-square bg-gray-200 rounded overflow-hidden">
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={media.url}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-200 rounded overflow-hidden">
                      {postContent.media[0]?.type === 'image' ? (
                        <img
                          src={postContent.media[0].url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={postContent.media[0].url}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Text Preview */}
              {postContent.text && (
                <div className="mb-4 text-gray-800">
                  <div dangerouslySetInnerHTML={{ 
                    __html: postContent.htmlEnabled ? 
                      postContent.text.replace(/\n/g, '<br>') : 
                      postContent.text.replace(/\n/g, '<br>').replace(/<[^>]*>/g, '')
                  }} />
                </div>
              )}

              {/* Buttons Preview */}
              {postContent.buttons.length > 0 && (
                <div className="space-y-2">
                  {postContent.buttons.map(button => (
                    <button
                      key={button.id}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded text-sm"
                    >
                      {button.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Шаблоны постов</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'text-only', title: 'Только текст', desc: 'Простой текстовый пост', icon: '📝' },
                { id: 'text-with-button', title: 'Текст + кнопка', desc: 'Пост с одной кнопкой', icon: '🔘' },
                { id: 'photo-with-text', title: 'Фото + текст', desc: 'Изображение с описанием', icon: '📸' },
                { id: 'mixed-media', title: 'Смешанный контент', desc: 'Фото и видео с кнопками', icon: '🖼️' }
              ].map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-left"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-xl">{template.icon}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{template.title}</h3>
                    <p className="text-white/70 text-sm">{template.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6">История постов</h3>
            
            {postHistory.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <div className="text-4xl mb-2">📚</div>
                <p>История постов пуста</p>
              </div>
            ) : (
              <div className="space-y-4">
                {postHistory.map(post => (
                  <div key={post.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{post.channelTitle}</h4>
                        <p className="text-white/80 text-sm mb-2">{post.text}</p>
                        <div className="flex items-center space-x-4 text-white/60 text-xs">
                          <span>📅 {formatDate(post.sentAt)}</span>
                          <span>🖼️ {post.mediaCount} файлов</span>
                          <span>🔘 {post.buttonCount} кнопок</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-500/20 rounded-lg p-3">
                        <div className="text-blue-300 font-bold text-lg">{post.views.toLocaleString()}</div>
                        <div className="text-blue-200 text-xs">Просмотры</div>
                      </div>
                      <div className="bg-green-500/20 rounded-lg p-3">
                        <div className="text-green-300 font-bold text-lg">{post.clicks.toLocaleString()}</div>
                        <div className="text-green-200 text-xs">Клики</div>
                      </div>
                      <div className="bg-purple-500/20 rounded-lg p-3">
                        <div className="text-purple-300 font-bold text-lg">{post.ctr}%</div>
                        <div className="text-purple-200 text-xs">CTR</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-6">Управление каналами</h3>
            
            <div className="space-y-4">
              {channels.map(channel => (
                <div key={channel.id} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{channel.title}</h4>
                      <div className="flex items-center space-x-4 text-white/60 text-sm">
                        <span>@{channel.username || 'без username'}</span>
                        <span>👥 {channel.memberCount.toLocaleString()}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          channel.type === 'channel' ? 'bg-blue-500/20 text-blue-300' :
                          channel.type === 'group' ? 'bg-green-500/20 text-green-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>
                          {channel.type === 'channel' ? 'Канал' : 
                           channel.type === 'group' ? 'Группа' : 'Супергруппа'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs ${
                        channel.isAdmin ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {channel.isAdmin ? '✅ Админ' : '❌ Не админ'}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        channel.botIsAdmin ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {channel.botIsAdmin ? '🤖 Бот админ' : '❌ Бот не админ'}
                      </div>
                    </div>
                  </div>
                  
                  {channel.isAdmin && channel.botIsAdmin && (
                    <button
                      onClick={() => selectChannel(channel)}
                      className="mt-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Выбрать для публикации
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button Modal */}
      {showButtonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingButton?.id ? 'Редактировать кнопку' : 'Добавить кнопку'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Текст кнопки</label>
                <input
                  type="text"
                  value={editingButton?.text || ''}
                  onChange={(e) => setEditingButton(prev => prev ? { ...prev, text: e.target.value } : null)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:border-white/40"
                  placeholder="Нажмите кнопку"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">URL или действие</label>
                <input
                  type="text"
                  value={editingButton?.url || ''}
                  onChange={(e) => setEditingButton(prev => prev ? { ...prev, url: e.target.value } : null)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:border-white/40"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Тип кнопки</label>
                <select
                  value={editingButton?.type || 'url'}
                  onChange={(e) => setEditingButton(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white backdrop-blur-sm focus:outline-none focus:border-white/40"
                >
                  <option value="url">URL ссылка</option>
                  <option value="callback">Callback кнопка</option>
                  <option value="web_app">Web App</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowButtonModal(false);
                  setEditingButton(null);
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={saveButton}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channel Selection Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-lg w-full max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Выберите канал для публикации</h3>
            
            <div className="space-y-3">
              {availableChannels.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p>Нет доступных каналов</p>
                  <p className="text-sm">Убедитесь, что вы админ и бот добавлен как админ</p>
                </div>
              ) : (
                availableChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => selectChannel(channel)}
                    className="w-full text-left bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold">{channel.title}</h4>
                        <p className="text-white/60 text-sm">
                          @{channel.username || 'без username'} • {channel.memberCount.toLocaleString()} подписчиков
                        </p>
                      </div>
                      <div className="text-green-400">✓</div>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setShowChannelModal(false)}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostBuilder; 