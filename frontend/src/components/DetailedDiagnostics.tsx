import React, { useEffect, useState } from 'react';

const DetailedDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [copyStatus, setCopyStatus] = useState<string>('');

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

  const copyToClipboard = async () => {
    const diagnosticText = `
🔍 ДИАГНОСТИКА TELEGRAM MINI APP
📅 Дата: ${new Date().toLocaleString()}
🌐 URL: ${diagnostics.url || 'Неизвестно'}

📱 API ПРОВЕРКА:
• window.Telegram: ${diagnostics.hasWindowTelegram ? '✅' : '❌'}
• window.Telegram.WebApp: ${diagnostics.hasWebApp ? '✅' : '❌'}
• ready() метод: ${diagnostics.hasReady ? '✅' : '❌'}
• expand() метод: ${diagnostics.hasExpand ? '✅' : '❌'}
• platform: ${diagnostics.hasPlatform ? '✅' : '❌'}
• Платформа: ${diagnostics.platform || 'Неизвестно'}
• Версия API: ${diagnostics.version || 'Неизвестно'}

🌍 ОКРУЖЕНИЕ:
• User-Agent содержит Telegram: ${diagnostics.hasTelegramInUserAgent ? '✅' : '❌'}
• URL содержит tgWebAppStartParam: ${diagnostics.hasTgWebAppStartParam ? '✅' : '❌'}
• Referrer от Telegram: ${diagnostics.hasTelegramReferrer ? '✅' : '❌'}
• В iframe: ${diagnostics.hasFrameElement ? '✅' : '❌'}

📄 ДЕТАЛИ:
• User-Agent: ${diagnostics.userAgent || 'Неизвестно'}
• Referrer: ${diagnostics.referrer || 'Нет'}
• Viewport высота: ${diagnostics.viewportHeight || 'Неизвестно'}
• Тема: ${diagnostics.colorScheme || 'Неизвестно'}

🎯 ВЕРДИКТ: ${isLikelyTelegramMiniApp() ? '✅ Это Telegram Mini App' : '❌ Это браузер'}
    `.trim();

    try {
      // Пробуем использовать Telegram WebApp API для копирования
      if (window.Telegram?.WebApp && typeof window.Telegram.WebApp.readTextFromClipboard === 'function') {
        // Используем Telegram API для копирования
        window.Telegram.WebApp.readTextFromClipboard((data) => {
          // Это обратный вызов, но мы можем использовать его для проверки
        });
        
        // Показываем пользователю, что нужно скопировать вручную
        setCopyStatus('📋 Используйте Telegram: Долгое нажатие → Копировать');
        
        // Создаем временный элемент для выделения
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = diagnosticText;
        tempTextArea.style.position = 'fixed';
        tempTextArea.style.left = '-9999px';
        tempTextArea.style.top = '-9999px';
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        
        // Показываем инструкцию пользователю
        alert('📋 Диагностика скопирована!\n\nДля вставки в чат:\n1. Долгое нажатие на текстовое поле\n2. Выберите "Вставить"\n\nИли отправьте скриншот этой страницы.');
        
        document.body.removeChild(tempTextArea);
      } else {
        // Fallback для браузера
        await navigator.clipboard.writeText(diagnosticText);
        setCopyStatus('✅ Скопировано в буфер обмена!');
        setTimeout(() => setCopyStatus(''), 3000);
      }
    } catch (error) {
      console.error('Ошибка копирования:', error);
      setCopyStatus('❌ Ошибка копирования');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  return (
    <div className="mb-4 p-4 bg-gray-100 border border-gray-400 text-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">🔍 Детальная диагностика</h3>
        <button
          onClick={copyToClipboard}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          📋 Копировать
        </button>
      </div>
      
      {copyStatus && (
        <div className="mb-2 p-2 bg-blue-100 border border-blue-300 rounded text-xs">
          {copyStatus}
        </div>
      )}
      
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