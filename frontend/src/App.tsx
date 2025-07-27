import React, { useEffect, useState } from 'react';
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
import FullscreenButton from './components/FullscreenButton';
import BackButton from './components/BackButton';
import { LogsProvider, useLogs } from './contexts/LogsContext';

// Компонент для отображения логов
const LogsDisplay: React.FC = () => {
  const { logs } = useLogs();
  
  const copyLogs = () => {
    const logsText = logs.join('\n');
    navigator.clipboard.writeText(logsText).then(() => {
      console.log('📋 Логи скопированы в буфер обмена');
    });
  };

  if (logs.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-4 z-[10000] max-h-48 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white text-sm font-bold">Логи навигации:</h3>
        <button
          onClick={copyLogs}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          📋 Копировать
        </button>
      </div>
      <div className="text-green-400 text-xs font-mono whitespace-pre-wrap">
        {logs.join('\n')}
      </div>
    </div>
  );
};

// Глобальная переменная для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        isExpanded: boolean;
        viewportHeight: number;
        colorScheme: 'light' | 'dark';
        initData: string;
        platform: string;
        version: string;
        isVersionAtLeast: (version: string) => boolean;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        showAlert: (message: string) => void;
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}

type Page = 'main' | 'analytics' | 'showcase' | 'demo-chat' | 'referral' | 'user-profile' | 'feedback' | 'post-analytics' | 'telegram-integration' | 'post-tracking' | 'post-builder' | 'test-back-button';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [navigationHistory, setNavigationHistory] = useState<Page[]>(['main']);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { logs, addLog } = useLogs();

  // Эффект для прокрутки к верху при смене страницы
  useEffect(() => {
    // Прокрутка к верху с небольшой задержкой для надежности
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      console.log('📄 Страница изменена на:', currentPage, 'Прокрутка к верху выполнена');
    };

    // Мгновенная прокрутка
    scrollToTop();
    
    // Дополнительная прокрутка с задержкой для надежности
    const timeoutId = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timeoutId);
  }, [currentPage]);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initializeTelegramWebApp = () => {
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        console.log('🚀 Инициализация Telegram WebApp...');
        
        // Готовим WebApp
        webApp.ready();
        
        // НЕ расширяем автоматически - только по кнопке
        // webApp.expand();
        
        // Устанавливаем состояние
        setIsTelegramWebApp(true);
        setIsExpanded(webApp.isExpanded);
        
        // Скрываем MainButton
        webApp.MainButton.hide();
        
        // Слушаем изменения viewport
        const handleViewportChange = () => {
          setIsExpanded(webApp.isExpanded);
          console.log('📱 Viewport изменен, isExpanded:', webApp.isExpanded);
        };
        
        webApp.onEvent('viewportChanged', handleViewportChange);
        
        // Глобальная функция для кнопки "Назад"
        (window as any).handleGoBack = () => {
          goBack();
        };
        
        console.log('✅ Telegram WebApp инициализирован');
        
        return () => {
          webApp.offEvent('viewportChanged', handleViewportChange);
        };
      } else {
        console.log('⚠️ Telegram WebApp не найден, запуск в режиме браузера');
        setIsTelegramWebApp(false);
      }
    };

    // Пытаемся инициализировать WebApp
    if (window.Telegram?.WebApp) {
      initializeTelegramWebApp();
    } else {
      // Ждем загрузки скрипта Telegram
      const checkTelegram = () => {
        if (window.Telegram?.WebApp) {
          initializeTelegramWebApp();
        } else {
          setTimeout(checkTelegram, 100);
        }
      };
      checkTelegram();
    }
  }, []);

  // Функция навигации
  const navigateTo = (page: Page) => {
    if (currentPage === page) {
      const message = `🚫 Попытка перехода на текущую страницу: ${page}`;
      console.log(message);
      addLog(message);
      return;
    }

    const message = `🔄 Переход к странице: ${page} с ${currentPage}`;
    console.log(message);
    addLog(message);
    
    console.log('📚 Текущая история:', navigationHistory);
    addLog(`📚 Текущая история: [${navigationHistory.join(', ')}]`);
    
    // Обновляем историю навигации
    const newHistory = [...navigationHistory, page];
    console.log('📝 Новая история:', newHistory);
    addLog(`📝 Новая история: [${newHistory.join(', ')}]`);
    
    setNavigationHistory(newHistory);
    
    // Устанавливаем новую страницу
    setCurrentPage(page);
    
    // Дополнительная прокрутка к верху для надежности
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }, 50);
  };

  // Функция возврата назад
  const goBack = () => {
    const message = `🔄 Возврат назад с страницы: ${currentPage}`;
    console.log(message);
    addLog(message);
    
    console.log('📚 История навигации:', navigationHistory);
    addLog(`📚 История навигации: [${navigationHistory.join(', ')}]`);
    
    console.log('🔍 Текущее состояние:', { currentPage, navigationHistoryLength: navigationHistory.length });
    addLog(`🔍 Текущее состояние: страница=${currentPage}, история=${navigationHistory.length} элементов`);

    // Если мы на главной странице, не показываем кнопку "Назад" вообще
    if (currentPage === 'main') {
      const message = '🏠 Уже на главной странице - кнопка "Назад" не должна показываться';
      console.log(message);
      addLog(message);
      return;
    }

    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      
      const message = `⬅️ Возвращаемся к: ${previousPage}`;
      console.log(message);
      addLog(message);
      
      console.log('📝 Новая история:', newHistory);
      addLog(`📝 Новая история: [${newHistory.join(', ')}]`);
      
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage);
      
      // Дополнительная прокрутка к верху для надежности
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }, 50);
    } else {
      const message = '🏠 Возвращаемся на главную (история пуста)';
      console.log(message);
      addLog(message);
      
      setCurrentPage('main');
      setNavigationHistory(['main']);
      
      // Дополнительная прокрутка к верху для надежности
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }, 50);
    }
  };

  const renderPage = () => {
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
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <ChannelAnalytics />
          </div>
        );

      case 'showcase':
        return (
          <div>
            <BackButton onClick={goBack} />
            <FullscreenButton />
            <Showcase />
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
    <div className="app">
      {renderPage()}
      <LogsDisplay />
    </div>
  );
}

function App() {
  return (
    <LogsProvider>
      <AppContent />
    </LogsProvider>
  );
}

export default App; 