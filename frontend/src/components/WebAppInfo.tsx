import React from 'react';

interface WebAppInfoProps {
  isTelegramWebApp: boolean;
  webAppInfo: any;
  theme: 'light' | 'dark';
  viewportHeight: number;
  isExpanded: boolean;
}

const WebAppInfo: React.FC<WebAppInfoProps> = ({
  isTelegramWebApp,
  webAppInfo,
  theme,
  viewportHeight,
  isExpanded
}) => {
  // Улучшенная проверка для Telegram Mini App
  const isTelegramMiniApp = () => {
    if (typeof window === 'undefined') return false;
    
    // Проверяем наличие Telegram WebApp API
    const hasTelegram = !!window.Telegram;
    const hasWebApp = !!window.Telegram?.WebApp;
    
    // Проверяем наличие ключевых методов
    const webApp = window.Telegram?.WebApp;
    const hasReady = typeof webApp?.ready === 'function';
    const hasExpand = typeof webApp?.expand === 'function';
    const hasPlatform = !!webApp?.platform;
    
    // Проверяем User-Agent для дополнительной диагностики
    const userAgent = navigator.userAgent;
    const isTelegramUserAgent = userAgent.includes('Telegram') || 
                               userAgent.includes('tgWebApp') ||
                               userAgent.includes('TelegramWebApp');
    
    console.log('🔍 Диагностика Telegram Mini App:', {
      hasTelegram,
      hasWebApp,
      hasReady,
      hasExpand,
      hasPlatform,
      platform: webApp?.platform,
      isTelegramUserAgent,
      userAgent: userAgent.substring(0, 100) + '...'
    });
    
    return hasTelegram && hasWebApp && hasReady && hasExpand && hasPlatform;
  };

  const isMiniApp = isTelegramMiniApp();

  if (!isMiniApp) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">⚠️ Запущено в браузере</h3>
            <div className="mt-2 text-sm">
              <p>Этот <strong>Telegram Mini App</strong> должен быть запущен внутри Telegram для полной функциональности.</p>
              <p className="mt-1"><strong>Viewport высота:</strong> {viewportHeight}px</p>
              <p><strong>Тема:</strong> {theme}</p>
              <p className="mt-2 text-xs text-yellow-600">
                💡 <strong>Совет:</strong> Откройте через бота в Telegram для доступа к полноэкранному режиму и всем функциям Mini App.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">✅ Telegram Mini App активен</h3>
          <div className="mt-2 text-sm space-y-1">
            <p><strong>Платформа:</strong> {webAppInfo?.platform || 'Неизвестно'}</p>
            <p><strong>Тема:</strong> {webAppInfo?.colorScheme || theme}</p>
            <p><strong>Высота:</strong> {webAppInfo?.viewportHeight || viewportHeight}px</p>
            <p><strong>Полный экран:</strong> {isExpanded ? 'Да' : 'Нет'}</p>
            <p><strong>Версия API:</strong> {webAppInfo?.version || 'Неизвестно'}</p>
            {webAppInfo?.initDataUnsafe?.user && (
              <p><strong>Пользователь:</strong> {webAppInfo.initDataUnsafe.user.first_name}</p>
            )}
            <p className="mt-2 text-xs text-green-600">
              🎉 <strong>Отлично!</strong> Все функции Telegram Mini App доступны.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebAppInfo; 