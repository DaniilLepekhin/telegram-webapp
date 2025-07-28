import React, { useState, useEffect } from 'react';
import ChannelAnalytics from './components/ChannelAnalytics';
import Showcase from './components/Showcase';
import DemoChat from './components/DemoChat';
import ReferralSystem from './components/ReferralSystem';
import UserProfile from './components/UserProfile';
import AnalyticsFeedback from './components/AnalyticsFeedback';
import PostAnalytics from './components/PostAnalytics';
import TelegramIntegration from './components/TelegramIntegration';
import PostTracking from './components/PostTracking';
import PostBuilder from './components/PostBuilder';
import BackButton from './components/BackButton';
import FullscreenButton from './components/FullscreenButton';

type Page = 'main' | 'analytics' | 'showcase' | 'demo-chat' | 'referral' | 'user-profile' | 'feedback' | 'post-analytics' | 'telegram-integration' | 'post-tracking' | 'post-builder';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [previousPage, setPreviousPage] = useState<Page | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      
      // Синхронизация состояния полноэкранного режима
      setIsExpanded(webApp.isExpanded);
      
      const handleViewportChanged = () => {
        setIsExpanded(webApp.isExpanded);
      };
      
      webApp.onEvent('viewportChanged', handleViewportChanged);
      
      return () => {
        webApp.offEvent('viewportChanged', handleViewportChanged);
      };
    }
  }, []);

  // Прокрутка к верху при смене страницы
  useEffect(() => {
    // Максимально агрессивный сброс позиции
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Дополнительный сброс через небольшую задержку
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 10);
    
    // Еще один сброс для надежности
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }, [currentPage]);

  // Простая функция навигации
  const navigateTo = (page: Page) => {
    if (currentPage !== page) {
      setPreviousPage(currentPage);
      setCurrentPage(page);
    }
  };

  // Простая функция возврата назад
  const goBack = () => {
    if (previousPage && previousPage !== 'main') {
      setCurrentPage(previousPage);
      setPreviousPage('main');
    } else {
      setCurrentPage('main');
      setPreviousPage(null);
    }
  };

  // Глобальная функция для кнопки назад
  useEffect(() => {
    (window as any).handleGoBack = goBack;
  }, [previousPage]);

  const renderPage = () => {
    console.log('🎨 Рендерим страницу:', currentPage);
    
    switch (currentPage) {
      case 'main':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Кнопка полноэкранного режима */}
            <FullscreenButton />

            <div className="relative z-10 p-4 sm:p-6">
              {/* Header */}
              <div className="text-center mb-8 fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl mb-4 shadow-2xl">
                  <span className="text-2xl sm:text-3xl">🚀</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
                  Telegram Mini App
                </h1>
                <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
                  Современная платформа для аналитики каналов и управления контентом
                </p>
              </div>

              {/* Main Menu Grid */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Analytics Card */}
                  <div 
                    onClick={() => navigateTo('analytics')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">📊</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Аналитика каналов</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Подробная статистика и аналитика ваших каналов
                      </p>
                    </div>
                  </div>

                  {/* Showcase Card */}
                  <div 
                    onClick={() => navigateTo('showcase')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">🎯</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Витрина кейсов</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Примеры успешных кейсов и результатов работы
                      </p>
                    </div>
                  </div>

                  {/* Demo Chat Card */}
                  <div 
                    onClick={() => navigateTo('demo-chat')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">💬</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Демо чат</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Интерактивный чат с ИИ-помощником
                      </p>
                    </div>
                  </div>

                  {/* User Profile Card */}
                  <div 
                    onClick={() => navigateTo('user-profile')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">👤</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Профиль</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Ваш профиль и персональные настройки
                      </p>
                    </div>
                  </div>

                  {/* Analytics Feedback Card */}
                  <div 
                    onClick={() => navigateTo('feedback')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">📈</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Аналитика отзывов</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Анализ обратной связи и отзывов
                      </p>
                    </div>
                  </div>

                  {/* Post Builder Card */}
                  <div 
                    onClick={() => navigateTo('post-builder')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">🛠️</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Пост + кнопка</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Конструктор постов с кнопками для каналов
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="max-w-4xl mx-auto mt-8">
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold text-white mb-4 text-center">Быстрая статистика</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">2.4K</div>
                      <div className="text-sm text-white/70">Подписчиков</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">98%</div>
                      <div className="text-sm text-white/70">Вовлеченность</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">1.2M</div>
                      <div className="text-sm text-white/70">Просмотров</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        console.log('📊 Загружаем ChannelAnalytics');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <ChannelAnalytics />
          </div>
        );

      case 'showcase':
        console.log('🎯 Загружаем Showcase');
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <div className="relative z-10 p-4 sm:p-6">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6 text-center">🎯 Витрина кейсов</h1>
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Тестовая страница</h2>
                  <p className="text-white/70 mb-4">Если вы видите этот текст, значит навигация работает!</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-white mb-2">Кейс 1</h3>
                      <p className="text-white/70 text-sm">Описание первого кейса</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-white mb-2">Кейс 2</h3>
                      <p className="text-white/70 text-sm">Описание второго кейса</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'demo-chat':
        console.log('💬 Загружаем DemoChat');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <DemoChat />
          </div>
        );

      case 'referral':
        console.log('👥 Загружаем ReferralSystem');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <ReferralSystem />
          </div>
        );

      case 'user-profile':
        console.log('👤 Загружаем UserProfile');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <UserProfile />
          </div>
        );

      case 'feedback':
        console.log('📈 Загружаем AnalyticsFeedback');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <AnalyticsFeedback />
          </div>
        );

      case 'post-analytics':
        console.log('📝 Загружаем PostAnalytics');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <PostAnalytics />
          </div>
        );

      case 'telegram-integration':
        console.log('⚙️ Загружаем TelegramIntegration');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <TelegramIntegration />
          </div>
        );

      case 'post-tracking':
        console.log('🔗 Загружаем PostTracking');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <PostTracking />
          </div>
        );

      case 'post-builder':
        console.log('🛠️ Загружаем PostBuilder');
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <PostBuilder />
          </div>
        );

      default:
        console.log('❓ Неизвестная страница:', currentPage);
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-2xl font-bold mb-4">Страница не найдена</h1>
                <button 
                  onClick={() => navigateTo('main')}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                >
                  На главную
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App; 