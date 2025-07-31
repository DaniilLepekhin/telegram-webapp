import React, { useState, useEffect, useCallback } from 'react';
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
import TestPage from './components/TestPage';
import BackButton from './components/BackButton';
import FullscreenButton from './components/FullscreenButton';

type Page = 'main' | 'analytics' | 'showcase' | 'demo-chat' | 'referral' | 'user-profile' | 'feedback' | 'post-analytics' | 'telegram-integration' | 'post-tracking' | 'post-builder' | 'test';

function App() {
  // РАДИКАЛЬНОЕ РЕШЕНИЕ: Принудительная перезагрузка
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [previousPage, setPreviousPage] = useState<Page | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pageRenderKey, setPageRenderKey] = useState(0); // Принудительный перерендер ВСЕГО
  const [isNavigating, setIsNavigating] = useState(false);

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

  // РАДИКАЛЬНЫЙ СБРОС СКРОЛЛА - максимально агрессивный
  const forceScrollReset = useCallback(() => {
    // Множественный сброс скролла
    const resetActions = [
      () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }),
      () => window.scrollTo(0, 0),
      () => { document.documentElement.scrollTop = 0; },
      () => { document.body.scrollTop = 0; },
      () => { 
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.expand();
        }
      },
      () => {
        // Принудительный сброс через DOM
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          if (el.scrollTop) el.scrollTop = 0;
          if (el.scrollLeft) el.scrollLeft = 0;
        });
      }
    ];

    // Выполняем сброс немедленно
    resetActions.forEach(action => action());
    
    // Повторяем через RAF
    requestAnimationFrame(() => {
      resetActions.forEach(action => action());
      
      // И еще раз через timeout
      setTimeout(() => {
        resetActions.forEach(action => action());
      }, 0);
    });
  }, []);

  // Улучшенная прокрутка к верху при смене страницы
  useEffect(() => {
    // Функция для сброса скролла
    const resetScroll = () => {
      // Добавляем класс для принудительного сброса
      document.body.classList.add('scroll-reset');
      
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Для Telegram WebApp
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.expand();
      }
      
      // Убираем класс через короткое время
      setTimeout(() => {
        document.body.classList.remove('scroll-reset');
      }, 100);
    };

    // Немедленный сброс
    resetScroll();
    
    // Сброс после рендера
    requestAnimationFrame(() => {
      resetScroll();
      
      // Еще один сброс после следующего фрейма
      requestAnimationFrame(() => {
        resetScroll();
      });
    });
    
    // Дополнительные сбросы с разными задержками
    const timeouts = [50, 100, 200, 500].map(delay => 
      setTimeout(resetScroll, delay)
    );
    
    // Очистка таймаутов при размонтировании
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [currentPage]);

  // РАДИКАЛЬНАЯ НАВИГАЦИЯ: Полная перезагрузка страницы
  const navigateTo = (page: Page) => {
    if (currentPage !== page) {
      setIsNavigating(true);
      
      // 1. Принудительный сброс скролла
      forceScrollReset();
      
      // 2. Полное обнуление состояния
      setTimeout(() => {
        setPreviousPage(currentPage);
        setCurrentPage(page);
        setPageRenderKey(prev => prev + 1000); // Большое изменение ключа
        
        // 3. Еще один сброс после смены состояния
        setTimeout(() => {
          forceScrollReset();
          setIsNavigating(false);
        }, 10);
      }, 10);
    }
  };

  // РАДИКАЛЬНЫЙ ВОЗВРАТ
  const goBack = () => {
    navigateTo('main');
  };

  // Глобальная функция для кнопки назад
  useEffect(() => {
    (window as any).handleGoBack = goBack;
  }, []);

  // ПРИНУДИТЕЛЬНЫЙ СБРОС ПРИ КАЖДОМ РЕНДЕРЕ
  useEffect(() => {
    forceScrollReset();
  }, [currentPage, pageRenderKey, forceScrollReset]);

  // БЛОКИРОВКА СКРОЛЛА ВО ВРЕМЯ НАВИГАЦИИ
  useEffect(() => {
    if (isNavigating) {
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        forceScrollReset();
      };

      // Блокируем все события скролла
      window.addEventListener('scroll', preventScroll, { passive: false });
      document.addEventListener('scroll', preventScroll, { passive: false });
      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        window.removeEventListener('scroll', preventScroll);
        document.removeEventListener('scroll', preventScroll);
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isNavigating, forceScrollReset]);

  // Рендер страниц
  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Enhanced Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
              <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-3000"></div>
            </div>

            {/* Кнопка полноэкранного режима */}
            <FullscreenButton />

            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
              {/* Enhanced Header */}
              <div className="text-center mb-8 sm:mb-12 fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-3xl mb-4 sm:mb-6 shadow-2xl animate-pulse-glow">
                  <span className="text-2xl sm:text-3xl lg:text-4xl">🚀</span>
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Telegram Mini App
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-white/80 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
                  Современная платформа для аналитики каналов и управления контентом
                </p>
              </div>

              {/* Enhanced Main Menu Grid */}
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {/* Analytics Card */}
                  <div 
                    onClick={() => navigateTo('analytics')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">📊</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">Аналитика каналов</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Подробная статистика и аналитика ваших каналов
                      </p>
                    </div>
                  </div>

                  {/* Showcase Card */}
                  <div 
                    onClick={() => navigateTo('showcase')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">🎯</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-green-200 transition-colors duration-300">Витрина кейсов</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Примеры успешных кейсов и результатов работы
                      </p>
                    </div>
                  </div>

                  {/* Demo Chat Card */}
                  <div 
                    onClick={() => navigateTo('demo-chat')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">💬</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-orange-200 transition-colors duration-300">Демо чат</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Интерактивный чат с ИИ-помощником
                      </p>
                    </div>
                  </div>

                  {/* User Profile Card */}
                  <div 
                    onClick={() => navigateTo('user-profile')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">👤</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">Профиль</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Ваш профиль и персональные настройки
                      </p>
                    </div>
                  </div>

                  {/* Analytics Feedback Card */}
                  <div 
                    onClick={() => navigateTo('feedback')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">📈</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors duration-300">Аналитика отзывов</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Анализ обратной связи и отзывов
                      </p>
                    </div>
                  </div>

                  {/* Post Analytics Card */}
                  <div 
                    onClick={() => navigateTo('post-analytics')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">📝</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors duration-300">Аналитика постов</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Подробная статистика и анализ ваших постов
                      </p>
                    </div>
                  </div>

                  {/* Telegram Integration Card */}
                  <div 
                    onClick={() => navigateTo('telegram-integration')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">⚙️</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-teal-200 transition-colors duration-300">Интеграция с Telegram</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Управление сообщениями и уведомлениями из Telegram
                      </p>
                    </div>
                  </div>

                  {/* Post Tracking Card */}
                  <div 
                    onClick={() => navigateTo('post-tracking')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">🔗</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-red-200 transition-colors duration-300">Отслеживание постов</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Мониторинг и анализ просмотров ваших постов
                      </p>
                    </div>
                  </div>

                  {/* Post Builder Card */}
                  <div 
                    onClick={() => navigateTo('post-builder')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">📝</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">Пост + кнопка</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Создание и публикация постов с интерактивными кнопками
                      </p>
                    </div>
                  </div>

                  {/* Test Page Card */}
                  <div 
                    onClick={() => navigateTo('test')}
                    className="group relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <span className="text-xl sm:text-2xl">🧪</span>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-yellow-200 transition-colors duration-300">Тестовая страница</h3>
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                        Диагностика и тестирование функциональности
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Stats */}
              <div className="max-w-4xl mx-auto mt-8 sm:mt-12">
                <div className="glass-card p-6 sm:p-8 rounded-3xl">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Быстрая статистика</h2>
                  <div className="grid grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center group">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">2.4K</div>
                      <div className="text-sm sm:text-base text-white/70">Подписчиков</div>
                    </div>
                    <div className="text-center group">
                      <div className="text-2xl sm:text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">98%</div>
                      <div className="text-sm sm:text-base text-white/70">Вовлеченность</div>
                    </div>
                    <div className="text-center group">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">1.2M</div>
                      <div className="text-sm sm:text-base text-white/70">Просмотров</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <ChannelAnalytics onBack={goBack} />
          </div>
        );

      case 'showcase':
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
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <DemoChat />
          </div>
        );

      case 'referral':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <ReferralSystem />
          </div>
        );

      case 'user-profile':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <UserProfile />
          </div>
        );

      case 'feedback':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <AnalyticsFeedback />
          </div>
        );

      case 'post-analytics':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <PostAnalytics />
          </div>
        );

      case 'telegram-integration':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <TelegramIntegration />
          </div>
        );

      case 'post-tracking':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <PostTracking />
          </div>
        );

      case 'post-builder':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <PostBuilder />
          </div>
        );

      case 'test':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <TestPage />
          </div>
        );

      default:
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

  // ПОЛНАЯ ПЕРЕЗАГРУЗКА ВСЕГО ПРИЛОЖЕНИЯ
  if (isNavigating) {
    return (
      <div className="App" key={`loading-${pageRenderKey}`}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#007AFF'
        }}>
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="App" 
      key={`page-${currentPage}-${pageRenderKey}`}
      style={{ transform: 'translateY(0)', scrollBehavior: 'auto' }}
    >
      {renderPage()}
    </div>
  );
}

export default App; 