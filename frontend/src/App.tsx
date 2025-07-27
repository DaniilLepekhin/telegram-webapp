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
import TestBackButton from './components/TestBackButton';
import PostBuilder from './components/PostBuilder';
import WebAppInfo from './components/WebAppInfo';
import FullscreenManager from './components/FullscreenManager';
import DetailedDiagnostics from './components/DetailedDiagnostics';
import ScreenshotHelper from './components/ScreenshotHelper';
import FullscreenControls from './components/FullscreenControls';
import FullscreenButton from './components/FullscreenButton';
import FullscreenTest from './components/FullscreenTest';
import LogsCopy from './components/LogsCopy';
import { LogsProvider, useLogs } from './contexts/LogsContext';

// Глобальная переменная для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
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
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        CloudStorage: {
          getItem: (key: string) => Promise<string | null>;
          setItem: (key: string, value: string) => Promise<void>;
          getItems: (keys: string[]) => Promise<{ [key: string]: string | null }>;
          removeItem: (key: string) => Promise<void>;
          removeItems: (keys: string[]) => Promise<void>;
        };
        BiometricManager: {
          isInited: boolean;
          isSupported: boolean;
          isAvailable: boolean;
          isAccessRequested: boolean;
          isAccessGranted: boolean;
          init: () => Promise<void>;
          authenticate: () => Promise<boolean>;
          requestAccess: () => Promise<boolean>;
        };
        QRScanner: {
          isSupported: boolean;
          isAvailable: boolean;
          isInited: boolean;
          isOpened: boolean;
          init: () => Promise<void>;
          open: () => Promise<void>;
          close: () => void;
          onResult: (callback: (result: string) => void) => void;
          offResult: (callback: (result: string) => void) => void;
        };
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            is_bot?: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
            allows_write_to_pm?: boolean;
            photo_url?: string;
          };
          receiver?: {
            id: number;
            is_bot?: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
            allows_write_to_pm?: boolean;
            photo_url?: string;
          };
          chat?: {
            id: number;
            type: 'group' | 'supergroup' | 'channel';
            title: string;
            username?: string;
            photo_url?: string;
          };
          chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
          chat_instance?: string;
          start_param?: string;
          can_send_after?: number;
          auth_date: number;
          hash: string;
        };
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        platform: string;
        version: string;
        sendData: (data: string) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }> }, callback?: (buttonId: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (data: string) => void) => void;
        requestWriteAccess: (callback?: (access: boolean) => void) => void;
        requestContact: (callback?: (contact: { phone_number: string; first_name: string; last_name?: string; user_id?: number }) => void) => void;
        invokeCustomMethod: (method: string, params?: any) => Promise<any>;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        isVersionAtLeast: (version: string) => boolean;
        getHeaderColor: () => string;
        getBackgroundColor: () => string;
        isFullscreen: boolean;
      };
    };
  }
}

const tg = window.Telegram?.WebApp;

type Page = 'main' | 'showcase' | 'chat' | 'referral' | 'profile' | 'analytics' | 'channel-analytics' | 'post-analytics' | 'telegram-integration' | 'post-tracking' | 'post-builder' | 'test-back' | 'fullscreen-test';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [webAppInfo, setWebAppInfo] = useState<any>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mainButtonClicked, setMainButtonClicked] = useState(false);
  const [backButtonClicked, setBackButtonClicked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [initData, setInitData] = useState('');
  const [navigationHistory, setNavigationHistory] = useState<Page[]>(['main']);
  
  const { logs, addLog } = useLogs();

  useEffect(() => {
    // Проверяем, запущен ли Mini App в Telegram
    const checkTelegramMiniApp = () => {
      // Улучшенная проверка для Telegram Mini App
      const hasTelegram = !!window.Telegram;
      const hasWebApp = !!window.Telegram?.WebApp;
      const webApp = window.Telegram?.WebApp;
      const hasReady = typeof webApp?.ready === 'function';
      const hasExpand = typeof webApp?.expand === 'function';
      const hasPlatform = !!webApp?.platform;
      
      // Проверяем User-Agent для дополнительной диагностики
      const userAgent = navigator.userAgent;
      const isTelegramUserAgent = userAgent.includes('Telegram') || 
                                 userAgent.includes('tgWebApp') ||
                                 userAgent.includes('TelegramWebApp');
      
      // Проверяем URL параметры Telegram
      const urlParams = new URLSearchParams(window.location.search);
      const hasTgWebAppData = urlParams.has('tgWebAppData');
      const hasTgWebAppVersion = urlParams.has('tgWebAppVersion');
      const hasTgWebAppPlatform = urlParams.has('tgWebAppPlatform');
      
      console.log('🔍 Диагностика Telegram Mini App:', {
        hasTelegram,
        hasWebApp,
        hasReady,
        hasExpand,
        hasPlatform,
        platform: webApp?.platform,
        isTelegramUserAgent,
        hasTgWebAppData,
        hasTgWebAppVersion,
        hasTgWebAppPlatform,
        userAgent: userAgent.substring(0, 100) + '...'
      });
      
      // Если есть параметры Telegram в URL, но API не загружен, ждем загрузки
      if (hasTgWebAppData && hasTgWebAppVersion && !hasTelegram) {
        console.log('🔄 Обнаружены параметры Telegram, но API еще не загружен. Ждем...');
        return; // Выходим и ждем следующей попытки
      }
      
      const isMiniApp = hasTelegram && hasWebApp && hasReady && hasExpand && hasPlatform;
      
      if (isMiniApp) {
        console.log('🚀 Telegram Mini App обнаружен!');
        console.log('📱 Платформа:', webApp.platform);
        console.log('🔧 Версия:', webApp.version);
        console.log('🎨 Тема:', webApp.colorScheme);
        
        setIsTelegramWebApp(true);
        
        // Инициализация с задержкой для полной загрузки
        setTimeout(() => {
          initializeWebApp();
        }, 100);
      } else {
        console.log('⚠️ Telegram Mini App не обнаружен, запуск в режиме браузера');
        setIsTelegramWebApp(false);
        // Fallback для браузера
        setViewportHeight(window.innerHeight);
        setTheme('light');
      }
    };

    const initializeWebApp = () => {
      console.log('🔧 initializeWebApp вызвана');
      console.log('🔧 window.Telegram:', !!window.Telegram);
      console.log('🔧 window.Telegram.WebApp:', !!window.Telegram?.WebApp);
      
      if (!window.Telegram?.WebApp) {
        console.log('❌ WebApp не найден, выходим');
        return;
      }
      
      const webApp = window.Telegram.WebApp;
      console.log('🔧 WebApp найден, начинаем инициализацию');
      
      try {
        console.log('🔧 Инициализация Telegram WebApp...');
        
        // Готовим WebApp (обязательно!)
        webApp.ready();
        
        // НЕ расширяем автоматически - пусть пользователь сам выберет
        // webApp.expand();
        setIsExpanded(webApp.isExpanded);
        
        // Пробуем включить полноэкранный режим (Bot API 8.0+)
        if (webApp.isVersionAtLeast && webApp.isVersionAtLeast('8.0')) {
          try {
            // Запрашиваем полноэкранный режим
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().then(() => {
                console.log('🖼️ Полноэкранный режим включен!');
              }).catch((error) => {
                console.log('⚠️ Не удалось включить полноэкранный режим:', error);
              });
            }
          } catch (error) {
            console.log('⚠️ Ошибка при включении полноэкранного режима:', error);
          }
        }
        
        // Устанавливаем высоту viewport
        setViewportHeight(webApp.viewportHeight);
        
        // Устанавливаем тему
        setTheme(webApp.colorScheme);
        setInitData(webApp.initData);
        
        // Скрываем MainButton - он не нужен
        webApp.MainButton.hide();
        
        // НЕ используем Telegram BackButton API - он закрывает приложение
        // Вместо этого используем нашу собственную кнопку
        
        // Включаем подтверждение закрытия
        webApp.enableClosingConfirmation();
        
        // Устанавливаем цвета
        webApp.setHeaderColor('#2B2D42');
        webApp.setBackgroundColor('#1A1B26');
        
        // Собираем информацию о WebApp
        const info = {
          platform: webApp.platform,
          colorScheme: webApp.colorScheme,
          themeParams: webApp.themeParams,
          initData: webApp.initData,
          initDataUnsafe: webApp.initDataUnsafe,
          version: webApp.version,
          isExpanded: webApp.isExpanded,
          viewportHeight: webApp.viewportHeight,
          viewportStableHeight: webApp.viewportStableHeight,
          headerColor: webApp.headerColor,
          backgroundColor: webApp.backgroundColor,
          isClosingConfirmationEnabled: webApp.isClosingConfirmationEnabled
        };
        
        setWebAppInfo(info);
        
        console.log('📱 WebApp информация:', info);
        
        // Обработчики событий
        webApp.onEvent('viewportChanged', () => {
          addLog('📱 Viewport изменился: ' + webApp.viewportHeight + ', isExpanded: ' + webApp.isExpanded);
          setViewportHeight(webApp.viewportHeight);
          setIsExpanded(webApp.isExpanded);
        });
        
        webApp.onEvent('themeChanged', () => {
          addLog('🎨 Тема изменилась: ' + webApp.colorScheme);
          setTheme(webApp.colorScheme);
        });
        
        // Новые события для полноэкранного режима (Bot API 8.0+)
        webApp.onEvent('fullscreenChanged', () => {
          addLog('🖼️ Полноэкранный режим изменился: ' + webApp.isFullscreen);
        });
        
        webApp.onEvent('activated', () => {
          addLog('✅ WebApp активирован');
        });
        
        webApp.onEvent('deactivated', () => {
          addLog('⏸️ WebApp деактивирован');
        });
        
        // Глобальная функция для обработки навигации назад
        (window as any).handleGoBack = () => {
          goBack();
        };
        
        console.log('✅ Telegram WebApp успешно инициализирован!');
        
      } catch (error) {
        console.error('❌ Ошибка инициализации Telegram WebApp:', error);
        setIsTelegramWebApp(false);
      }
    };

    // Запускаем диагностику с задержкой и повторными попытками
    const runDiagnosticsWithRetry = () => {
      let attempts = 0;
      const maxAttempts = 10; // Увеличиваем количество попыток
      
      const attemptCheck = () => {
        attempts++;
        console.log(`🔄 Попытка диагностики #${attempts}/${maxAttempts}...`);
        
        const result = checkTelegramMiniApp();
        
        // Если API еще не загружен и есть параметры Telegram, продолжаем попытки
        const urlParams = new URLSearchParams(window.location.search);
        const hasTgWebAppData = urlParams.has('tgWebAppData');
        const hasTgWebAppVersion = urlParams.has('tgWebAppVersion');
        
        if (hasTgWebAppData && hasTgWebAppVersion && !window.Telegram && attempts < maxAttempts) {
          setTimeout(attemptCheck, 1000); // Повторяем каждую секунду
        } else if (attempts < maxAttempts) {
          // Если нет параметров Telegram или API загружен, делаем финальные попытки
          setTimeout(() => {
            console.log('🔄 Финальная проверка...');
            checkTelegramMiniApp();
          }, 2000);
        }
      };
      
      attemptCheck();
    };
    
    runDiagnosticsWithRetry();
  }, [currentPage]);

    // Функция для обработки очереди навигации
    const navigateTo = (page: Page) => {
      // Если пытаемся перейти на ту же страницу, игнорируем
      if (currentPage === page) {
        console.log('🚫 Попытка перехода на текущую страницу:', page);
        return;
      }

      console.log('🔄 Переход к странице:', page);
      console.log('📍 Текущая страница:', currentPage);
      
      // Добавляем новую страницу в историю
      setNavigationHistory(prev => {
        const newHistory = [...prev, page];
        console.log('📚 Обновлена история навигации:', newHistory);
        return newHistory;
      });
      
      // Устанавливаем новую страницу
      setCurrentPage(page);

      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        // Всегда скрываем MainButton - он не нужен
        webApp.MainButton.hide();
      }
      
      // Прокручиваем к верху страницы с задержкой, чтобы страница успела отрендериться
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    };

  // Функция для возврата назад
  const goBack = () => {
    console.log('🔄 Попытка возврата назад с текущей страницы:', currentPage);
    console.log('📚 Текущая история навигации:', navigationHistory);

    // Проверяем, находимся ли мы на главной странице
    if (currentPage === 'main') {
      console.log('🏠 Уже на главной странице, показываем уведомление');
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert('Вы уже на главной странице');
      }
      return;
    }

    // Если история содержит больше одной страницы, возвращаемся назад
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      
      console.log('⬅️ Возвращаемся к странице:', previousPage);
      console.log('📚 Обновленная история:', newHistory);
      
      setCurrentPage(previousPage);
      setNavigationHistory(newHistory);
      
      // Прокручиваем к верху страницы с задержкой
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      // Если история пуста, возвращаемся на главную
      console.log('🏠 История пуста, возвращаемся на главную');
      setCurrentPage('main');
      setNavigationHistory(['main']);
      
      // Прокручиваем к верху страницы с задержкой
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
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
                      <h3 className="text-xl font-bold text-white mb-2">Аналитика</h3>
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
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">💎</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Витрина кейсов</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Лучшие примеры и кейсы успешных проектов
                      </p>
                    </div>
                  </div>

                  {/* Chat Card */}
                  <div 
                    onClick={() => navigateTo('chat')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">💬</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Демо-чат</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Попробуйте наш интеллектуальный чат-бот
                      </p>
                    </div>
                  </div>

                  {/* Profile Card */}
                  <div 
                    onClick={() => navigateTo('profile')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
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
                        Ваш личный кабинет и настройки
                      </p>
                    </div>
                  </div>

                  {/* Post Builder Card */}
                  <div 
                    onClick={() => navigateTo('post-builder')}
                    className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">📝</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Пост + кнопка</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Конструктор постов с кнопками для Telegram каналов
                      </p>
                    </div>
                  </div>

                                      {/* Channel Analytics Card */}
                    <div
                      onClick={() => navigateTo('channel-analytics')}
                      className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl">📈</span>
                          </div>
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Аналитика каналов</h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Продвинутая аналитика и отслеживание эффективности ваших Telegram каналов
                        </p>
                      </div>
                    </div>

                    {/* Fullscreen Test Card */}
                    <div
                      onClick={() => navigateTo('fullscreen-test')}
                      className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl">🖼️</span>
                          </div>
                          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Тест полноэкранного режима</h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                          Проверьте работу полноэкранного режима и WebApp API
                        </p>
                      </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-white">2.5K</div>
                    <div className="text-white/60 text-sm">Активных пользователей</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-white">156</div>
                    <div className="text-white/60 text-sm">Проанализированных каналов</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-white/60 text-sm">Точность данных</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-white/60 text-sm">Поддержка</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'showcase':
        return <Showcase />;
      case 'chat':
        return <DemoChat />;
      case 'referral':
        return <ReferralSystem />;
      case 'profile':
        return <UserProfile />;
      case 'analytics':
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
      case 'test-back':
        return <TestBackButton />;
      case 'fullscreen-test':
        return <FullscreenTest />;
      default:
        return (
          <div 
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4"
            style={{ 
              minHeight: viewportHeight ? `${viewportHeight}px` : '100vh',
              background: theme === 'dark' ? 'linear-gradient(135deg, #1a1b26 0%, #2b2d42 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
            }}
          >
            <div className="p-4 sm:p-6 md:p-8 rounded-xl shadow-xl bg-white bg-opacity-10 backdrop-blur-md w-full max-w-md">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4 text-center">
                🚀 Telegram Mini App
              </h1>
              <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-center">
                Полноэкранная витрина с современными возможностями Telegram Mini Apps API
              </p>
              
              {/* Информация о WebApp */}
              <WebAppInfo
                isTelegramWebApp={isTelegramWebApp}
                webAppInfo={webAppInfo}
                theme={theme}
                viewportHeight={viewportHeight}
                isExpanded={isExpanded}
              />
              
              {/* Управление полноэкранным режимом */}
              <FullscreenManager isTelegramWebApp={isTelegramWebApp} />
              
              {/* Детальная диагностика */}
              <DetailedDiagnostics />
              
              {/* Помощь со скриншотом */}
              <ScreenshotHelper />
              
              {/* Управление полноэкранным режимом */}
              <FullscreenControls />
              
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => navigateTo('showcase')}
                  className="w-full btn-primary py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg"
                >
                  🎯 Витрина кейсов
                </button>
                
                <button
                  onClick={() => navigateTo('chat')}
                  className="w-full btn-primary py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                >
                  💬 Демо-чат
                </button>
                
                <button
                  onClick={() => navigateTo('channel-analytics')}
                  className="w-full btn-primary py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                >
                  📊 Аналитика каналов
                </button>
                
                <button
                  onClick={() => navigateTo('post-analytics')}
                  className="w-full btn-primary py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                >
                  📝 Аналитика постов
                </button>
                
                <button
                  onClick={() => navigateTo('post-tracking')}
                  className="w-full btn-primary py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                >
                  🔗 Отслеживание постов
                </button>
                
                <button
                  onClick={() => navigateTo('referral')}
                  className="w-full btn-primary py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                >
                  👥 Реферальная система
                </button>
                
                <button
                  onClick={() => navigateTo('profile')}
                  className="w-full btn-primary py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                >
                  👤 Профиль пользователя
                </button>
                
                <button
                  onClick={() => navigateTo('analytics')}
                  className="w-full btn-primary py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                >
                  📈 Аналитика & Обратная связь
                </button>
                
                <button
                  onClick={() => navigateTo('telegram-integration')}
                  className="w-full btn-primary py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base"
                >
                  ⚙️ Интеграция с Telegram
                </button>
                

              </div>
              

              

            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {renderPage()}
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