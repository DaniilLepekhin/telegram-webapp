import React, { useState, useEffect } from 'react';

interface TrackingLink {
  id: string;
  name: string;
  baseUrl: string;
  parameters: {
    post?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    tag?: string;
  };
  createdAt: Date;
  clicks: number;
  conversions: number;
}

const TrackingLinksManager: React.FC = () => {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<TrackingLink | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = () => {
    const savedLinks = JSON.parse(localStorage.getItem('trackingLinks') || '[]');
    setLinks(savedLinks);
  };

  const handleLinkCreated = (newLink: TrackingLink) => {
    setLinks([...links, newLink]);
    setShowCreator(false);
  };

  const deleteLink = (linkId: string) => {
    if (confirm('Удалить эту ссылку и всю статистику?')) {
      const updatedLinks = links.filter(link => link.id !== linkId);
      setLinks(updatedLinks);
      localStorage.setItem('trackingLinks', JSON.stringify(updatedLinks));
    }
  };

  const copyLink = async (link: TrackingLink) => {
    const params = new URLSearchParams();
    Object.entries(link.parameters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const fullUrl = params.toString() ? `${link.baseUrl}?${params.toString()}` : link.baseUrl;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert('Ссылка скопирована!');
    } catch (error) {
      console.error('Ошибка копирования:', error);
    }
  };

  const getConversionRate = (clicks: number, conversions: number) => {
    if (clicks === 0) return 0;
    return ((conversions / clicks) * 100).toFixed(1);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Трекинговые ссылки</h3>
        <button
          onClick={() => setShowCreator(true)}
          className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
        >
          + Создать ссылку
        </button>
      </div>

      {/* Creator */}
      {showCreator && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Создать новую ссылку</h4>
            <button
              onClick={() => setShowCreator(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          {/* Здесь будет компонент TrackingLinkCreator */}
          <div className="text-white/60 text-center py-8">
            Компонент создания ссылок будет добавлен
          </div>
        </div>
      )}

      {/* Links List */}
      {links.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Нет трекинговых ссылок</h3>
          <p className="text-white/60 mb-4">Создайте первую ссылку для отслеживания источников трафика</p>
          <button
            onClick={() => setShowCreator(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Создать первую ссылку
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-2">{link.name}</h4>
                  <div className="text-sm text-white/60 mb-3">
                    Создана: {formatDate(link.createdAt)}
                  </div>
                  
                  {/* Параметры */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {link.parameters.post && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                        Пост: {link.parameters.post}
                      </span>
                    )}
                    {link.parameters.utm_source && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                        {link.parameters.utm_source}
                      </span>
                    )}
                    {link.parameters.utm_campaign && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        {link.parameters.utm_campaign}
                      </span>
                    )}
                    {link.parameters.tag && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">
                        {link.parameters.tag}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Действия */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyLink(link)}
                    className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Копировать ссылку"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Удалить ссылку"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Статистика */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{link.clicks}</div>
                  <div className="text-xs text-white/60">Переходов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{link.conversions}</div>
                  <div className="text-xs text-white/60">Конверсий</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {getConversionRate(link.clicks, link.conversions)}%
                  </div>
                  <div className="text-xs text-white/60">Конверсия</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Статистика */}
      {links.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Общая статистика</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{links.length}</div>
              <div className="text-xs text-white/60">Всего ссылок</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {links.reduce((sum, link) => sum + link.clicks, 0)}
              </div>
              <div className="text-xs text-white/60">Всего переходов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {links.reduce((sum, link) => sum + link.conversions, 0)}
              </div>
              <div className="text-xs text-white/60">Всего конверсий</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {(() => {
                  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
                  const totalConversions = links.reduce((sum, link) => sum + link.conversions, 0);
                  return totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0';
                })()}%
              </div>
              <div className="text-xs text-white/60">Общая конверсия</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingLinksManager;