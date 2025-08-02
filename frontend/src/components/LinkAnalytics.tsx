import React, { useState, useEffect } from 'react';

interface TrackingLink {
  id: number;
  link_id: string;
  title: string;
  description: string;
  link_type: 'post' | 'subscribe';
  target_url: string;
  chat_title: string;
  username: string;
  qr_code_url: string;
  is_active: boolean;
  click_count: number;
  total_clicks: number;
  countries_count: number;
  total_subscriptions: number;
  created_at: string;
  expires_at: string;
  auto_disable_after_clicks: number;
  ab_test_name: string;
}

interface ClickAnalytics {
  total_clicks: number;
  unique_countries: number;
  active_days: number;
  device_type: string;
  device_count: number;
}

interface CountryStats {
  country: string;
  city: string;
  clicks: number;
}

interface UTMStats {
  utm_params: Record<string, string>;
  clicks: number;
}

interface TimelineStats {
  date: string;
  clicks: number;
  unique_visitors: number;
}

interface ABStats {
  ab_test_group: string;
  clicks: number;
}

interface LinkAnalyticsProps {
  onBack: () => void;
}

const LinkAnalytics: React.FC<LinkAnalyticsProps> = ({ onBack }) => {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<TrackingLink | null>(null);
  const [analytics, setAnalytics] = useState<{
    clicks: ClickAnalytics[];
    countries: CountryStats[];
    utm: UTMStats[];
    timeline: TimelineStats[];
    abTesting: ABStats[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tracking/links');
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (linkId: string) => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(`/api/tracking/analytics/${linkId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleLinkSelect = (link: TrackingLink) => {
    setSelectedLink(link);
    setAnalytics(null);
    loadAnalytics(link.link_id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: добавить уведомление
  };

  const deleteLink = async (linkId: string) => {
    if (!confirm('Вы уверены, что хотите деактивировать эту ссылку?')) return;
    
    try {
      const response = await fetch(`/api/tracking/links/${linkId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadLinks();
        if (selectedLink?.link_id === linkId) {
          setSelectedLink(null);
          setAnalytics(null);
        }
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const getStatusColor = (link: TrackingLink) => {
    if (!link.is_active) return 'bg-gray-500/20 text-gray-400';
    if (link.expires_at && new Date() > new Date(link.expires_at)) return 'bg-orange-500/20 text-orange-400';
    if (link.auto_disable_after_clicks && link.click_count >= link.auto_disable_after_clicks) return 'bg-red-500/20 text-red-400';
    return 'bg-green-500/20 text-green-400';
  };

  const getStatusText = (link: TrackingLink) => {
    if (!link.is_active) return 'Деактивирована';
    if (link.expires_at && new Date() > new Date(link.expires_at)) return 'Истекла';
    if (link.auto_disable_after_clicks && link.click_count >= link.auto_disable_after_clicks) return 'Лимит достигнут';
    return 'Активная';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Загрузка аналитики...</h2>
          <p className="text-white/60">Получаем данные по вашим ссылкам</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex-1 min-w-0 mr-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">📊 Аналитика ссылок</h2>
              <p className="text-white/60 text-sm sm:text-base">Статистика переходов и конверсий</p>
            </div>
            <button
              onClick={onBack}
              className="w-10 h-10 bg-red-500/20 hover:bg-red-500/40 rounded-xl flex items-center justify-center text-red-300 hover:text-white transition-all flex-shrink-0 text-lg font-bold"
            >
              ✕
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full filter blur-xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full filter blur-xl opacity-15"></div>
      </div>

      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-300"
          >
            ← Назад
          </button>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Аналитика Ссылок
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Просматривайте статистику переходов, конверсий и геоданные
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {!selectedLink ? (
            /* Список ссылок */
            <div className="space-y-6">
              {links.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔗</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Пока нет ссылок</h3>
                  <p className="text-white/60 mb-6">Создайте первую трекинговую ссылку для начала аналитики</p>
                  <button
                    onClick={onBack}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Создать ссылку
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer transform hover:scale-105"
                      onClick={() => handleLinkSelect(link)}
                    >
                      {/* Статус */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(link)}`}>
                          {getStatusText(link)}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(`https://app.daniillepekhin.ru/track/${link.link_id}`);
                            }}
                            className="bg-blue-500/20 text-blue-300 p-2 rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            📋
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLink(link.link_id);
                            }}
                            className="bg-red-500/20 text-red-300 p-2 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Основная информация */}
                      <div className="mb-4">
                        <h3 className="text-white font-bold text-lg mb-1">{link.title}</h3>
                        {link.description && (
                          <p className="text-white/70 text-sm mb-2">{link.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-white/60 text-sm">
                          <span>{link.link_type === 'post' ? '📝' : '📢'}</span>
                          <span>{link.chat_title}</span>
                        </div>
                      </div>

                      {/* Статистика */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{link.total_clicks || 0}</div>
                          <div className="text-white/60 text-xs">Переходов</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{link.countries_count || 0}</div>
                          <div className="text-white/60 text-xs">Стран</div>
                        </div>
                      </div>

                      {/* QR код */}
                      {link.qr_code_url && (
                        <div className="text-center mb-4">
                          <img
                            src={link.qr_code_url}
                            alt="QR Code"
                            className="w-16 h-16 mx-auto rounded-lg border border-white/20"
                          />
                        </div>
                      )}

                      {/* A/B тест */}
                      {link.ab_test_name && (
                        <div className="bg-purple-500/20 rounded-lg p-3 mb-4">
                          <div className="text-purple-300 text-sm font-medium">🧪 A/B тест</div>
                          <div className="text-white text-xs">{link.ab_test_name}</div>
                        </div>
                      )}

                      {/* Даты */}
                      <div className="text-white/50 text-xs">
                        Создана: {formatDate(link.created_at)}
                        {link.expires_at && (
                          <div>Истекает: {formatDate(link.expires_at)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Детальная аналитика */
            <div className="space-y-6">
              {/* Заголовок с кнопкой назад */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <button
                  onClick={() => setSelectedLink(null)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg mb-4 transition-colors"
                >
                  ← К списку ссылок
                </button>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedLink.title}</h2>
                    <p className="text-white/70">{selectedLink.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-white/60">
                      <span>{selectedLink.link_type === 'post' ? '📝 Пост' : '📢 Подписка'}</span>
                      <span>📢 {selectedLink.chat_title}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedLink)}`}>
                        {getStatusText(selectedLink)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{selectedLink.total_clicks || 0}</div>
                    <div className="text-white/60">Переходов</div>
                  </div>
                </div>
              </div>

              {analyticsLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Загрузка аналитики...</h3>
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Статистика по устройствам */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">📱 Устройства</h3>
                    <div className="space-y-3">
                      {analytics.clicks.map((device, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {device.device_type === 'mobile' ? '📱' : 
                               device.device_type === 'desktop' ? '🖥️' : 
                               device.device_type === 'tablet' ? '📱' : '❓'}
                            </span>
                            <span className="text-white capitalize">{device.device_type}</span>
                          </div>
                          <span className="text-white font-bold">{device.device_count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* География */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">🌍 География</h3>
                    <div className="space-y-3">
                      {analytics.countries.slice(0, 5).map((country, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <span className="text-white">{country.country}</span>
                            {country.city && (
                              <span className="text-white/60 text-sm ml-2">({country.city})</span>
                            )}
                          </div>
                          <span className="text-white font-bold">{country.clicks}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* UTM аналитика */}
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">🏷️ UTM метки</h3>
                    <div className="space-y-3">
                      {analytics.utm.slice(0, 5).map((utm, index) => (
                        <div key={index} className="border-l-4 border-purple-400 pl-4">
                          <div className="text-white font-medium mb-1">Переходов: {utm.clicks}</div>
                          <div className="space-y-1">
                            {Object.entries(utm.utm_params).map(([key, value]) => (
                              <div key={key} className="text-white/70 text-sm">
                                <span className="text-purple-300">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* A/B тестирование */}
                  {analytics.abTesting.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <h3 className="text-xl font-bold text-white mb-4">🧪 A/B тест</h3>
                      <div className="space-y-3">
                        {analytics.abTesting.map((ab, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {ab.ab_test_group}
                              </div>
                              <span className="text-white">Группа {ab.ab_test_group}</span>
                            </div>
                            <span className="text-white font-bold">{ab.clicks}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Временная статистика */}
                  <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">📈 Активность по дням</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {analytics.timeline.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className="text-white/60 text-xs mb-1">
                            {new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                          </div>
                          <div className="bg-gradient-to-t from-purple-500 to-blue-500 rounded text-white text-sm py-2">
                            {day.clicks}
                          </div>
                          <div className="text-white/40 text-xs mt-1">{day.unique_visitors} уник.</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Нет данных</h3>
                  <p className="text-white/60">По этой ссылке пока нет переходов</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkAnalytics;