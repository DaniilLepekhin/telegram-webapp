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
  onClose: () => void;
}

const LinkAnalytics: React.FC<LinkAnalyticsProps> = ({ onClose }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Загружаем аналитику
    const loadAnalytics = async () => {
      try {
        const response = await fetch('/api/tracking/links');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="w-full h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-xl font-bold text-white">📊 Аналитика ссылок</h2>
            <p className="text-white/60 text-sm mt-1">Статистика переходов</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/60">Загрузка аналитики...</p>
            </div>
          ) : analytics && analytics.length > 0 ? (
            <div className="space-y-4">
              {analytics.slice(0, 5).map((link: any, index: number) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium text-sm truncate">{link.title}</h3>
                    <span className="text-white/60 text-xs">{link.clicks || 0} переходов</span>
                  </div>
                  <p className="text-white/60 text-xs truncate">{link.target_url}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/40 text-xs">
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      link.status === 'active' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {link.status === 'active' ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                </div>
              ))}
              
              {analytics.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-white/60 text-sm">
                    Показано 5 из {analytics.length} ссылок
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Нет данных</h3>
              <p className="text-white/60 text-sm">Создайте первую ссылку для просмотра аналитики</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default LinkAnalytics;