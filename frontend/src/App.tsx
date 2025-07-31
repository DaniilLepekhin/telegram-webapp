import React, { useState, useEffect, useCallback } from 'react';

// Расширение Window для загрузочного экрана
declare global {
  interface Window {
    hideLoadingScreen?: () => void;
    reactLoaded?: boolean;
  }
}
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
  // ЭЛЕГАНТНОЕ РЕШЕНИЕ: Telegram WebApp History API + плавные переходы
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [previousPage, setPreviousPage] = useState<Page | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // ПЛАВНЫЙ И НЕЗАМЕТНЫЙ СБРОС СКРОЛЛА
  const silentScrollReset = useCallback(() => {
    // 1. Тихий сброс всех элементов (без console.log)
    const resetTargets = [
      window,
      document.documentElement,
      document.body,
      document.getElementById('root'),
      document.querySelector('.App')
    ];
    
    resetTargets.forEach(target => {
      if (target && 'scrollTo' in target) {
        try {
          target.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } catch(e) {}
      }
      if (target && 'scrollTop' in target) {
        try {
          target.scrollTop = 0;
          target.scrollLeft = 0;
        } catch(e) {}
      }
    });
    
    // 2. Telegram WebApp тихо
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.expand();
    }
    
    // 3. Мягкое CSS позиционирование
    requestAnimationFrame(() => {
      document.documentElement.style.transform = 'translateY(0px)';
      document.body.style.transform = 'translateY(0px)';
      const root = document.getElementById('root');
      if (root) {
        root.style.transform = 'translateY(0px)';
      }
    });
  }, []);

  // Тихий скролл вверх при первой загрузке
  useEffect(() => {
    silentScrollReset();
    
    // Скрываем загрузочный экран после загрузки React
    setTimeout(() => {
      if (window.hideLoadingScreen) {
        window.hideLoadingScreen();
      }
    }, 500); // Небольшая задержка для плавности
  }, []); // Только при первой загрузке

  // ПЛАВНАЯ НАВИГАЦИЯ: Незаметный сброс + элегантный переход
  const navigateTo = (page: Page) => {
    if (currentPage !== page) {
      // 1. Тихий сброс скролла БЕЗ логов
      silentScrollReset();
      
      setIsTransitioning(true);
      
      // 2. Плавная смена страницы
      setTimeout(() => {
        setPreviousPage(currentPage);
        setCurrentPage(page);
        
        // 3. Финальный тихий сброс для гарантии
        setTimeout(() => {
          silentScrollReset();
          setIsTransitioning(false);
        }, 200); // Совпадает с анимацией
      }, 200); // Половина анимации для плавности
    }
  };

  // РАДИКАЛЬНЫЙ ВОЗВРАТ
  const goBack = () => {
    navigateTo('main');
  };

  // Глобальная функция для кнопки назад
  useEffect(() => {
    (window as any).handleGoBack = goBack;
  }, [goBack]);

  // Рендер страниц
  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* КРАСИВЫЙ СТАТИЧНЫЙ ФОН С ГРАДИЕНТАМИ */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full filter blur-xl opacity-20"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full filter blur-xl opacity-20"></div>
              <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-pink-500 to-red-500 rounded-full filter blur-xl opacity-15"></div>
              <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full filter blur-xl opacity-15"></div>
            </div>

            {/* Кнопка полноэкранного режима */}
            <FullscreenButton />

            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
              {/* Enhanced Header */}
              <div className="text-center mb-8 sm:mb-12 fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-3xl mb-4 sm:mb-6 shadow-2xl">
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

  return (
    <div 
      className="App"
      style={{ 
        transform: isTransitioning ? 'translateY(-5px) scale(0.98)' : 'translateY(0px) scale(1)',
        opacity: isTransitioning ? 0.85 : 1,
        filter: isTransitioning ? 'blur(1px)' : 'blur(0px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        scrollBehavior: 'auto'
      }}
    >
      {renderPage()}
    </div>
  );
}

export default App; 