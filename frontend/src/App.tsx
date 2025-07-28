import React, { useState, useEffect } from 'react';
import Showcase from './components/Showcase';
import DemoChat from './components/DemoChat';
import ReferralSystem from './components/ReferralSystem';
import UserProfile from './components/UserProfile';
import AnalyticsFeedback from './components/AnalyticsFeedback';
import ChannelAnalytics from './components/ChannelAnalytics';
import PostAnalytics from './components/PostAnalytics';
import TelegramIntegration from './components/TelegramIntegration';
import PostTracking from './components/PostTracking';
import PostBuilder from './components/PostBuilder';
import BackButton from './components/BackButton';
import FullscreenButton from './components/FullscreenButton';

type Page = 'main' | 'showcase' | 'demo-chat' | 'referral' | 'profile' | 'analytics-feedback' | 'channel-analytics' | 'post-analytics' | 'telegram-integration' | 'post-tracking' | 'post-builder';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [previousPage, setPreviousPage] = useState<Page | null>(null);

  // Глобальная функция для навигации назад
  useEffect(() => {
    (window as any).handleGoBack = goBack;
  }, []);

  const navigateTo = (page: Page) => {
    if (currentPage !== page) {
      setPreviousPage(currentPage);
      setCurrentPage(page);
      // Немедленный сброс скролла при навигации
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const goBack = () => {
    if (currentPage === 'main') {
      return;
    }

    setPreviousPage(null); // Clear previous page when going back
    setCurrentPage('main'); // Always go back to main for simplicity
    
    // Сброс позиции скролла при возврате
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Агрессивный сброс скролла при смене страницы
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'showcase':
        return <Showcase />;
      case 'demo-chat':
        return <DemoChat />;
      case 'referral':
        return <ReferralSystem />;
      case 'profile':
        return <UserProfile />;
      case 'analytics-feedback':
        return <AnalyticsFeedback />;
      case 'channel-analytics':
        return <ChannelAnalytics />;
      case 'post-analytics':
        return <PostAnalytics />;
      case 'telegram-integration':
        return <TelegramIntegration />;
      case 'post-tracking':
        return <PostTracking />;
      case 'post-builder':
        return <PostBuilder />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 container mx-auto px-4 py-8">
              <div className="text-center mb-12 fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-3xl mb-6 shadow-2xl animate-pulse">
                  <span className="text-4xl">🚀</span>
                </div>
                <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-4 sm:mb-8 drop-shadow-2xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Telegram WebApp
                </h1>
                <p className="text-2xl sm:text-3xl text-white/80 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
                  Современная платформа для управления контентом и аналитики
                </p>
              </div>

              {/* Navigation cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Showcase */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('showcase')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">💎</div>
                    <h3 className="text-xl font-bold text-white mb-2">Витрина кейсов</h3>
                    <p className="text-white/70">Лучшие проекты и инновационные решения</p>
                  </div>
                </div>

                {/* Demo Chat */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('demo-chat')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-xl font-bold text-white mb-2">Демо чат</h3>
                    <p className="text-white/70">Интерактивный AI чат для демонстрации</p>
                  </div>
                </div>

                {/* Referral System */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('referral')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold text-white mb-2">Реферальная система</h3>
                    <p className="text-white/70">Статистика и управление рефералами</p>
                  </div>
                </div>

                {/* User Profile */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('profile')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">👤</div>
                    <h3 className="text-xl font-bold text-white mb-2">Профиль пользователя</h3>
                    <p className="text-white/70">Управление настройками и данными</p>
                  </div>
                </div>

                {/* Analytics & Feedback */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('analytics-feedback')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-white mb-2">Аналитика и отзывы</h3>
                    <p className="text-white/70">Детальная аналитика и обратная связь</p>
                  </div>
                </div>

                {/* Channel Analytics */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('channel-analytics')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">📈</div>
                    <h3 className="text-xl font-bold text-white mb-2">Аналитика каналов</h3>
                    <p className="text-white/70">Статистика и метрики каналов</p>
                  </div>
                </div>

                {/* Post Analytics */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('post-analytics')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-white mb-2">Аналитика постов</h3>
                    <p className="text-white/70">Детальная статистика публикаций</p>
                  </div>
                </div>

                {/* Telegram Integration */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('telegram-integration')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">🔗</div>
                    <h3 className="text-xl font-bold text-white mb-2">Интеграция Telegram</h3>
                    <p className="text-white/70">Настройка ботов и веб-приложений</p>
                  </div>
                </div>

                {/* Post Tracking */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('post-tracking')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold text-white mb-2">Отслеживание постов</h3>
                    <p className="text-white/70">Мониторинг производительности контента</p>
                  </div>
                </div>

                {/* Post Builder */}
                <div className="glass-card group cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => navigateTo('post-builder')}>
                  <div className="p-6">
                    <div className="text-4xl mb-4">✏️</div>
                    <h3 className="text-xl font-bold text-white mb-2">Пост + кнопка</h3>
                    <p className="text-white/70">Конструктор постов с интерактивными кнопками</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {/* Back button - показываем только если не на главной странице */}
      {currentPage !== 'main' && <BackButton onClick={goBack} />}
      
      {/* Fullscreen button */}
      <FullscreenButton />
      
      {/* Main content */}
      {renderPage()}
    </div>
  );
};

export default App; 