import React, { useState, useEffect } from 'react';

interface TrackingLink {
  id: number;
  name: string;
  linkHash: string;
  postId?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  tag?: string;
  isActive: boolean;
  createdAt: string;
  clicks?: number;
  subscribers?: number;
  conversionRate?: number;
}

interface TrackingLinksManagerProps {
  channelId: number;
}

const TrackingLinksManager: React.FC<TrackingLinksManagerProps> = ({ channelId }) => {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Форма создания новой ссылки
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkPostId, setNewLinkPostId] = useState('');
  const [newLinkUtmSource, setNewLinkUtmSource] = useState('');
  const [newLinkUtmMedium, setNewLinkUtmMedium] = useState('');
  const [newLinkUtmCampaign, setNewLinkUtmCampaign] = useState('');
  const [newLinkUtmTerm, setNewLinkUtmTerm] = useState('');
  const [newLinkUtmContent, setNewLinkUtmContent] = useState('');
  const [newLinkTag, setNewLinkTag] = useState('');
  const [creating, setCreating] = useState(false);

  // Загружаем трекинговые ссылки
  useEffect(() => {
    fetchTrackingLinks();
  }, [channelId]);

  const fetchTrackingLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/telegram/tracking-links/${channelId}`);
      const data = await response.json();
      
      if (data.success) {
        setLinks(data.links);
      } else {
        setError(data.error || 'Ошибка загрузки ссылок');
      }
    } catch (err) {
      console.error('Ошибка загрузки трекинговых ссылок:', err);
      setError('Ошибка загрузки ссылок');
    } finally {
      setLoading(false);
    }
  };

  const createTrackingLink = async () => {
    if (!newLinkName.trim()) {
      setError('Введите название ссылки');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/telegram/create-tracking-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
          userId: 123456789, // Временно используем тестовый ID
          name: newLinkName,
          postId: newLinkPostId ? parseInt(newLinkPostId) : null,
          utmSource: newLinkUtmSource || null,
          utmMedium: newLinkUtmMedium || null,
          utmCampaign: newLinkUtmCampaign || null,
          utmTerm: newLinkUtmTerm || null,
          utmContent: newLinkUtmContent || null,
          tag: newLinkTag || null,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Добавляем новую ссылку в список
        setLinks(prev => [data.link, ...prev]);
        
        // Очищаем форму
        setNewLinkName('');
        setNewLinkPostId('');
        setNewLinkUtmSource('');
        setNewLinkUtmMedium('');
        setNewLinkUtmCampaign('');
        setNewLinkUtmTerm('');
        setNewLinkUtmContent('');
        setNewLinkTag('');
        setShowCreateForm(false);
      } else {
        setError(data.error || 'Ошибка создания ссылки');
      }
    } catch (err) {
      console.error('Ошибка создания трекинговой ссылки:', err);
      setError('Ошибка создания ссылки');
    } finally {
      setCreating(false);
    }
  };

  const deleteTrackingLink = async (linkId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту ссылку?')) {
      return;
    }

    try {
      const response = await fetch(`/api/telegram/tracking-links/${linkId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setLinks(prev => prev.filter(link => link.id !== linkId));
      } else {
        setError(data.error || 'Ошибка удаления ссылки');
      }
    } catch (err) {
      console.error('Ошибка удаления трекинговой ссылки:', err);
      setError('Ошибка удаления ссылки');
    }
  };

  const generateShareableLink = (linkHash: string) => {
    return `https://app.daniillepekhin.ru/track/${linkHash}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Трекинговые ссылки</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showCreateForm ? 'Отмена' : 'Создать ссылку'}
        </button>
      </div>

      {/* Форма создания новой ссылки */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-4">Создать новую ссылку</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название ссылки *
              </label>
              <input
                type="text"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Например: Реклама ВКонтакте"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID поста (опционально)
              </label>
              <input
                type="number"
                value={newLinkPostId}
                onChange={(e) => setNewLinkPostId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UTM Source
              </label>
              <input
                type="text"
                value={newLinkUtmSource}
                onChange={(e) => setNewLinkUtmSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="vkontakte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UTM Medium
              </label>
              <input
                type="text"
                value={newLinkUtmMedium}
                onChange={(e) => setNewLinkUtmMedium(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="cpc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UTM Campaign
              </label>
              <input
                type="text"
                value={newLinkUtmCampaign}
                onChange={(e) => setNewLinkUtmCampaign(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="summer_sale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Метка креатива
              </label>
              <input
                type="text"
                value={newLinkTag}
                onChange={(e) => setNewLinkTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="video_1"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={createTrackingLink}
              disabled={creating || !newLinkName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-sm font-medium transition-colors"
            >
              {creating ? 'Создание...' : 'Создать ссылку'}
            </button>
          </div>
        </div>
      )}

      {/* Список существующих ссылок */}
      {links.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p className="text-gray-500">Нет трекинговых ссылок</p>
          <p className="text-sm text-gray-400">Создайте первую ссылку для отслеживания трафика</p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <div key={link.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{link.name}</h4>
                    {link.isActive ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Активна</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Неактивна</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Ссылка: <code className="bg-gray-100 px-2 py-1 rounded">{generateShareableLink(link.linkHash)}</code></p>
                    {link.postId && <p>Пост: #{link.postId}</p>}
                    {link.utmSource && <p>UTM Source: {link.utmSource}</p>}
                    {link.utmMedium && <p>UTM Medium: {link.utmMedium}</p>}
                    {link.utmCampaign && <p>UTM Campaign: {link.utmCampaign}</p>}
                    {link.tag && <p>Метка: {link.tag}</p>}
                    <p className="text-xs text-gray-400">Создана: {new Date(link.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(generateShareableLink(link.linkHash))}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Копировать
                  </button>
                  <button
                    onClick={() => deleteTrackingLink(link.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackingLinksManager;