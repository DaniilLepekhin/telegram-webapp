import React, { useState, useEffect } from 'react';

interface TelegramChannel {
  id: number;
  title: string;
  username?: string;
  type: 'channel' | 'group' | 'supergroup';
}

interface LinkGeneratorProps {
  channels: TelegramChannel[];
  onClose: () => void;
}

const LinkGenerator: React.FC<LinkGeneratorProps> = ({ channels, onClose }) => {
  const [selectedChannel, setSelectedChannel] = useState<TelegramChannel | null>(null);
  const [linkType, setLinkType] = useState<'post' | 'subscribe'>('subscribe');
  const [postUrl, setPostUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');

  // Блокируем скролл фона при открытии модального окна
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const generateTrackingLink = async () => {
    if (!selectedChannel || !linkTitle.trim()) {
      alert('Выберите канал и введите название ссылки');
      return;
    }

    if (linkType === 'post' && !postUrl.trim()) {
      alert('Введите ссылку на пост');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        channelId: selectedChannel.id,
        linkType,
        targetUrl: linkType === 'post' ? postUrl : `https://t.me/${selectedChannel.username}`,
        title: linkTitle,
        description: '',
        utmParams: {},
        enableABTest: false,
        abTestName: null,
        abGroups: null,
        enableExpiry: false,
        expiryDate: null,
        expiryClicks: null,
        generateQR: false
      };

      const response = await fetch('/api/tracking/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedLink(data.trackingUrl);
      } else {
        alert('Ошибка создания ссылки');
      }
    } catch (error) {
      console.error('Error generating tracking link:', error);
      alert('Ошибка создания ссылки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-xl font-bold text-white">🔗 Создать ссылку</h2>
            <p className="text-white/60 text-sm mt-1">Простая настройка</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {!generatedLink ? (
            <>
              {/* Выбор канала */}
              <div>
                <label className="block text-white font-medium mb-3">📢 Выберите канал</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedChannel?.id === channel.id
                          ? 'border-purple-400 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">
                            {channel.type === 'channel' ? '📢' : '👥'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm truncate">{channel.title}</h3>
                          {channel.username && (
                            <p className="text-white/60 text-xs truncate">@{channel.username}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Тип ссылки */}
              <div>
                <label className="block text-white font-medium mb-3">🎯 Тип ссылки</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLinkType('subscribe')}
                    className={`p-3 rounded-lg border transition-all ${
                      linkType === 'subscribe'
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">📱</div>
                      <h3 className="text-white font-medium text-sm">Подписка</h3>
                    </div>
                  </button>
                  <button
                    onClick={() => setLinkType('post')}
                    className={`p-3 rounded-lg border transition-all ${
                      linkType === 'post'
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">📝</div>
                      <h3 className="text-white font-medium text-sm">Пост</h3>
                    </div>
                  </button>
                </div>
              </div>

              {/* URL поста */}
              {linkType === 'post' && (
                <div>
                  <label className="block text-white font-medium mb-2">🔗 Ссылка на пост</label>
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://t.me/channel/123"
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Название ссылки */}
              <div>
                <label className="block text-white font-medium mb-2">📝 Название ссылки</label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Моя кампания"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                />
              </div>

              {/* Кнопка создания */}
              <button
                onClick={generateTrackingLink}
                disabled={loading || !selectedChannel || !linkTitle.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? '🔄 Создание...' : '🚀 Создать ссылку'}
              </button>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">🎉</span>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Ссылка создана!</h3>
                <p className="text-white/60 mb-4">Ваша ссылка готова к использованию</p>
                
                <div className="bg-white/10 border border-white/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 p-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedLink)}
                      className="bg-blue-500/20 text-blue-300 px-3 py-2 rounded hover:bg-blue-500/30 transition-colors text-sm"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setGeneratedLink('');
                    setSelectedChannel(null);
                    setLinkTitle('');
                    setPostUrl('');
                  }}
                  className="bg-green-500/20 text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                >
                  ➕ Еще
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-colors text-sm"
                >
                  ✅ Готово
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default LinkGenerator;