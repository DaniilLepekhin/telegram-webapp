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
import WebAppInfo from './components/WebAppInfo';
import FullscreenManager from './components/FullscreenManager';
import DetailedDiagnostics from './components/DetailedDiagnostics';
import ScreenshotHelper from './components/ScreenshotHelper';
import FullscreenControls from './components/FullscreenControls';
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

type Page = 'main' | 'showcase' | 'chat' | 'referral' | 'profile' | 'analytics' | 'channel-analytics' | 'post-analytics' | 'telegram-integration' | 'post-tracking' | 'test-back';

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
        
        // Расширяем на полный экран (согласно документации)
        webApp.expand();
        setIsExpanded(true);
        
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
          addLog('📱 Viewport изменился: ' + webApp.viewportHeight);
          setViewportHeight(webApp.viewportHeight);
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

    const navigateTo = (page: Page) => {
    // Добавляем текущую страницу в историю
    setNavigationHistory(prev => {
      const newHistory = [...prev, page];
      return newHistory;
    });
    setCurrentPage(page);

    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;

      // Всегда скрываем MainButton - он не нужен
      webApp.MainButton.hide();
    }
  };

  // Функция для возврата назад
  const goBack = () => {
    if (navigationHistory.length > 1) {
      // Удаляем текущую страницу из истории
      const newHistory = navigationHistory.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      // Если мы на главной странице, закрываем приложение
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close();
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
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
      case 'test-back':
        return <TestBackButton />;
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