import React, { useEffect, useState } from 'react';

const DetailedDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const runDiagnostics = () => {
      const results: any = {};

      // 1. Проверка window.Telegram
      results.hasWindowTelegram = !!window.Telegram;
      results.windowTelegramType = typeof window.Telegram;

      // 2. Проверка window.Telegram.WebApp
      results.hasWebApp = !!window.Telegram?.WebApp;
      results.webAppType = typeof window.Telegram?.WebApp;

      // 3. Проверка ключевых методов
      const webApp = window.Telegram?.WebApp;
      if (webApp) {
        results.hasReady = typeof webApp.ready === 'function';
        results.hasExpand = typeof webApp.expand === 'function';
        results.hasPlatform = !!webApp.platform;
        results.platform = webApp.platform;
        results.version = webApp.version;
        results.colorScheme = webApp.colorScheme;
        results.initData = webApp.initData;
        results.viewportHeight = webApp.viewportHeight;
        results.isExpanded = webApp.isExpanded;
      }

      // 4. Проверка User-Agent
      results.userAgent = navigator.userAgent;
      results.hasTelegramInUserAgent = navigator.userAgent.includes('Telegram');
      results.hasTgWebAppInUserAgent = navigator.userAgent.includes('tgWebApp');
      results.hasTelegramWebAppInUserAgent = navigator.userAgent.includes('TelegramWebApp');

      // 5. Проверка URL параметров
      results.url = window.location.href;
      results.hasTgWebAppStartParam = !!new URLSearchParams(window.location.search).get('tgWebAppStartParam');
      results.hasTgWebAppData = !!new URLSearchParams(window.location.search).get('tgWebAppData');

      // 6. Проверка referrer
      results.referrer = document.referrer;
      results.hasTelegramReferrer = document.referrer.includes('telegram.org') || 
                                   document.referrer.includes('t.me') ||
                                   document.referrer.includes('web.telegram.org');

      // 7. Проверка window.parent
      results.hasParent = !!window.parent;
      results.parentSameOrigin = window.parent === window;
      results.parentLocation = window.parent.location.href;

      // 8. Проверка window.frameElement
      results.hasFrameElement = !!window.frameElement;
      results.frameElementTagName = window.frameElement?.tagName;

      // 9. Проверка window.name
      results.windowName = window.name;
      results.hasTgWebAppInWindowName = window.name.includes('tgWebApp');

      // 10. Попытка инициализации
      if (webApp && typeof webApp.ready === 'function') {
        try {
          webApp.ready();
          results.readyCalled = true;
        } catch (error) {
          results.readyError = error.message;
        }
      }

      setDiagnostics(results);
      
      console.log('🔍 Детальная диагностика Telegram Mini App:', results);
    };

    runDiagnostics();
  }, []);

  const isLikelyTelegramMiniApp = () => {
    return diagnostics.hasWindowTelegram && 
           diagnostics.hasWebApp && 
           diagnostics.hasReady && 
           diagnostics.hasExpand && 
           diagnostics.hasPlatform &&
           diagnostics.platform;
  };

  return (
    <div className="mb-4 p-4 bg-gray-100 border border-gray-400 text-gray-700 rounded-lg">
      <h3 className="text-sm font-medium mb-2">🔍 Детальная диагностика</h3>
      
      <div className="text-xs space-y-1">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>window.Telegram:</strong> {diagnostics.hasWindowTelegram ? '✅' : '❌'}
          </div>
          <div>
            <strong>window.Telegram.WebApp:</strong> {diagnostics.hasWebApp ? '✅' : '❌'}
          </div>
          <div>
            <strong>ready() метод:</strong> {diagnostics.hasReady ? '✅' : '❌'}
          </div>
          <div>
            <strong>expand() метод:</strong> {diagnostics.hasExpand ? '✅' : '❌'}
          </div>
          <div>
            <strong>platform:</strong> {diagnostics.hasPlatform ? '✅' : '❌'}
          </div>
          <div>
            <strong>Платформа:</strong> {diagnostics.platform || 'Неизвестно'}
          </div>
        </div>
        
        <div className="mt-2">
          <strong>User-Agent содержит Telegram:</strong> {diagnostics.hasTelegramInUserAgent ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>URL содержит tgWebAppStartParam:</strong> {diagnostics.hasTgWebAppStartParam ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>Referrer от Telegram:</strong> {diagnostics.hasTelegramReferrer ? '✅' : '❌'}
        </div>
        
        <div>
          <strong>В iframe:</strong> {diagnostics.hasFrameElement ? '✅' : '❌'}
        </div>
        
        <div className="mt-2 p-2 bg-white rounded text-xs">
          <strong>User-Agent:</strong> {diagnostics.userAgent?.substring(0, 100)}...
        </div>
        
        <div className="mt-2 p-2 bg-white rounded text-xs">
          <strong>URL:</strong> {diagnostics.url}
        </div>
        
        <div className="mt-2 p-2 bg-white rounded text-xs">
          <strong>Referrer:</strong> {diagnostics.referrer || 'Нет'}
        </div>
        
        <div className="mt-2 p-2 bg-yellow-100 rounded">
          <strong>Вердикт:</strong> {isLikelyTelegramMiniApp() ? '✅ Это Telegram Mini App' : '❌ Это браузер'}
        </div>
      </div>
    </div>
  );
};

export default DetailedDiagnostics; 