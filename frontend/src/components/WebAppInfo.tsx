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
  if (!isTelegramWebApp) {
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
              <p>Этот WebApp должен быть запущен внутри Telegram для полной функциональности.</p>
              <p className="mt-1"><strong>Viewport высота:</strong> {viewportHeight}px</p>
              <p><strong>Тема:</strong> {theme}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">✅ Telegram WebApp активен</h3>
          <div className="mt-2 text-sm space-y-1">
            <p><strong>Платформа:</strong> {webAppInfo?.platform || 'Неизвестно'}</p>
            <p><strong>Тема:</strong> {webAppInfo?.colorScheme || theme}</p>
            <p><strong>Высота:</strong> {webAppInfo?.viewportHeight || viewportHeight}px</p>
            <p><strong>Полный экран:</strong> {isExpanded ? 'Да' : 'Нет'}</p>
            <p><strong>Версия API:</strong> {webAppInfo?.version || 'Неизвестно'}</p>
            {webAppInfo?.initDataUnsafe?.user && (
              <p><strong>Пользователь:</strong> {webAppInfo.initDataUnsafe.user.first_name}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebAppInfo; 