import React, { useState } from 'react';

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

interface TrackingLinkCreatorProps {
  channelId: string;
  channelName: string;
  onLinkCreated: (link: TrackingLink) => void;
}

const TrackingLinkCreator: React.FC<TrackingLinkCreatorProps> = ({
  channelId,
  channelName,
  onLinkCreated
}) => {
  const [linkName, setLinkName] = useState('');
  const [postNumber, setPostNumber] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [creativeTag, setCreativeTag] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const buildParameters = () => {
    const params = new URLSearchParams();
    
    if (postNumber) params.append('post', postNumber);
    if (utmSource) params.append('utm_source', utmSource);
    if (utmMedium) params.append('utm_medium', utmMedium);
    if (utmCampaign) params.append('utm_campaign', utmCampaign);
    if (utmContent) params.append('utm_content', utmContent);
    if (creativeTag) params.append('tag', creativeTag);
    
    return params.toString();
  };

  const createTrackingLink = async () => {
    if (!linkName.trim()) {
      alert('Введите название ссылки');
      return;
    }

    setIsCreating(true);

    try {
      const linkId = generateUniqueId();
      const parameters = buildParameters();
      const baseUrl = `https://yourdomain.com/track/${linkId}`;
      const fullUrl = parameters ? `${baseUrl}?${parameters}` : baseUrl;

      const newLink: TrackingLink = {
        id: linkId,
        name: linkName,
        baseUrl,
        parameters: {
          post: postNumber || undefined,
          utm_source: utmSource || undefined,
          utm_medium: utmMedium || undefined,
          utm_campaign: utmCampaign || undefined,
          utm_content: utmContent || undefined,
          tag: creativeTag || undefined
        },
        createdAt: new Date(),
        clicks: 0,
        conversions: 0
      };

      // Сохраняем ссылку в localStorage (в реальном проекте - в БД)
      const existingLinks = JSON.parse(localStorage.getItem('trackingLinks') || '[]');
      existingLinks.push(newLink);
      localStorage.setItem('trackingLinks', JSON.stringify(existingLinks));

      onLinkCreated(newLink);

      // Копируем ссылку в буфер обмена
      await navigator.clipboard.writeText(fullUrl);

      // Очищаем форму
      setLinkName('');
      setPostNumber('');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
      setUtmContent('');
      setCreativeTag('');

      alert('Ссылка создана и скопирована в буфер обмена!');
    } catch (error) {
      console.error('Ошибка создания ссылки:', error);
      alert('Ошибка создания ссылки');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">🔗 Создать ссылку</h3>
      
      <div className="space-y-4">
        {/* Название ссылки */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Название ссылки *
          </label>
          <input
            type="text"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            placeholder="Например: YouTube кампания котики"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Номер поста */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Номер поста (необязательно)
          </label>
          <input
            type="number"
            value={postNumber}
            onChange={(e) => setPostNumber(e.target.value)}
            placeholder="Например: 206"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* UTM параметры */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Источник (utm_source)
            </label>
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="youtube, instagram, facebook"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Канал (utm_medium)
            </label>
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="cpc, email, social"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Кампания (utm_campaign)
            </label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="cat_video_1, summer_promo"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Контент (utm_content)
            </label>
            <input
              type="text"
              value={utmContent}
              onChange={(e) => setUtmContent(e.target.value)}
              placeholder="video_creative_1, banner_1"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Метка креатива */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Метка креатива (tag)
          </label>
          <input
            type="text"
            value={creativeTag}
            onChange={(e) => setCreativeTag(e.target.value)}
            placeholder="video_content, story_content"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Кнопка создания */}
        <button
          onClick={createTrackingLink}
          disabled={isCreating || !linkName.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isCreating ? 'Создаю...' : '🚀 Создать ссылку'}
        </button>
      </div>

      {/* Подсказки */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl">
        <h4 className="text-white font-medium mb-2">💡 Подсказки:</h4>
        <ul className="text-white/70 text-sm space-y-1">
          <li>• Используйте понятные названия для ссылок</li>
          <li>• Номер поста поможет отследить эффективность конкретных постов</li>
          <li>• UTM-метки помогут анализировать источники трафика</li>
          <li>• Метка креатива поможет различать разные рекламные материалы</li>
        </ul>
      </div>
    </div>
  );
};

export default TrackingLinkCreator;