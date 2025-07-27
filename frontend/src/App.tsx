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

const tg = window.Telegram?.WebApp;

type Page = 'main' | 'showcase' | 'chat' | 'referral' | 'profile' | 'analytics' | 'channel-analytics' | 'post-analytics' | 'telegram-integration' | 'post-tracking' | 'test-back';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [theme, setTheme] = useState(tg?.colorScheme || 'default');
  const [initData, setInitData] = useState(tg?.initData || '');
  const [mainButtonClicked, setMainButtonClicked] = useState(false);
  const [backButtonClicked, setBackButtonClicked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (tg) {
      // Инициализация Telegram WebApp с полным функционалом
      console.log('🚀 Инициализация революционного Telegram WebApp...');
      
      // Расширяем на полный экран
      tg.expand();
      setIsExpanded(true);
      
      // Устанавливаем высоту viewport
      setViewportHeight(tg.viewportHeight);
      
      // Готовим WebApp
      tg.ready();
      
      // Настраиваем MainButton
      tg.MainButton.setText('🚀 Отправить данные');
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        setMainButtonClicked(true);
        const data = {
          action: 'demo',
          value: 'Привет из революционного WebApp!',
          timestamp: new Date().toISOString(),
          page: currentPage,
          theme: tg.colorScheme
        };
        tg.sendData(JSON.stringify(data));
      });
      
      // Настраиваем BackButton
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        setBackButtonClicked(true);
        if (currentPage === 'main') {
          tg.close();
        } else {
          setCurrentPage('main');
        }
      });
      
      // Устанавливаем тему
      setTheme(tg.colorScheme);
      setInitData(tg.initData);
      
      // Логируем информацию о WebApp
      console.log('📱 WebApp информация:', {
        platform: tg.platform,
        colorScheme: tg.colorScheme,
        themeParams: tg.themeParams,
        initData: tg.initData,
        initDataUnsafe: tg.initDataUnsafe,
        version: tg.version,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
        headerColor: tg.headerColor,
        backgroundColor: tg.backgroundColor,
        isClosingConfirmationEnabled: tg.isClosingConfirmationEnabled
      });
      
      // Включаем подтверждение закрытия
      tg.enableClosingConfirmation();
      
      // Устанавливаем цвет заголовка
      tg.setHeaderColor('#2B2D42');
      
      // Устанавливаем цвет фона
      tg.setBackgroundColor('#1A1B26');
      
      // Обработчик изменения viewport
      tg.onEvent('viewportChanged', () => {
        console.log('📱 Viewport изменился:', {
          height: tg.viewportHeight,
          stableHeight: tg.viewportStableHeight,
          isExpanded: tg.isExpanded
        });
        setViewportHeight(tg.viewportHeight);
        setIsExpanded(tg.isExpanded);
      });
      
      // Обработчик изменения темы
      tg.onEvent('themeChanged', () => {
        console.log('🎨 Тема изменилась:', tg.colorScheme);
        setTheme(tg.colorScheme);
      });
      
      // Обработчик изменения размера viewport
      tg.onEvent('mainButtonClicked', () => {
        console.log('🔘 MainButton нажат');
      });
      
      tg.onEvent('backButtonClicked', () => {
        console.log('⬅️ BackButton нажат');
      });
      
      tg.onEvent('settingsButtonClicked', () => {
        console.log('⚙️ SettingsButton нажат');
      });
      
      tg.onEvent('invoiceClosed', (eventData) => {
        console.log('💳 Invoice закрыт:', eventData);
      });
      
      tg.onEvent('popupClosed', (eventData) => {
        console.log('📋 Popup закрыт:', eventData);
      });
      
      tg.onEvent('qrTextReceived', (eventData) => {
        console.log('📱 QR код получен:', eventData);
      });
      
      tg.onEvent('clipboardTextReceived', (eventData) => {
        console.log('📋 Текст из буфера обмена:', eventData);
      });
      
      tg.onEvent('writeAccessRequested', (eventData) => {
        console.log('✏️ Запрос на запись:', eventData);
      });
      
      tg.onEvent('contactRequested', (eventData) => {
        console.log('👤 Запрос контакта:', eventData);
      });
      
      tg.onEvent('customMethodInvoked', (eventData) => {
        console.log('🔧 Кастомный метод вызван:', eventData);
      });
      
      console.log('✅ Революционный WebApp инициализирован!');
    }
    
    return () => {
      if (tg) {
        // Очищаем обработчики событий
        tg.offEvent('viewportChanged');
        tg.offEvent('themeChanged');
        tg.offEvent('mainButtonClicked');
        tg.offEvent('backButtonClicked');
        tg.offEvent('settingsButtonClicked');
        tg.offEvent('invoiceClosed');
        tg.offEvent('popupClosed');
        tg.offEvent('qrTextReceived');
        tg.offEvent('clipboardTextReceived');
        tg.offEvent('writeAccessRequested');
        tg.offEvent('contactRequested');
        tg.offEvent('customMethodInvoked');
        
        // Очищаем обработчики кнопок
        tg.MainButton.onClick(() => {});
        tg.BackButton.onClick(() => {});
      }
    };
  }, [currentPage]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    if (tg) {
      // Показываем BackButton только если не на главной странице
      if (page === 'main') {
        tg.BackButton.hide();
      } else {
        tg.BackButton.show();
      }
      
      // Обновляем MainButton в зависимости от страницы
      switch (page) {
        case 'showcase':
          tg.MainButton.setText('🎯 Выбрать кейс');
          break;
        case 'chat':
          tg.MainButton.setText('💬 Отправить сообщение');
          break;
        case 'analytics':
          tg.MainButton.setText('📊 Экспорт данных');
          break;
        case 'post-tracking':
          tg.MainButton.setText('🔗 Создать ссылку');
          break;
        default:
          tg.MainButton.setText('🚀 Отправить данные');
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
            <div className="p-8 rounded-xl shadow-xl bg-white bg-opacity-10 backdrop-blur-md w-full max-w-md">
              <h1 className="text-3xl font-bold mb-4 text-center">
                🚀 Революционный WebApp
              </h1>
              <p className="text-lg mb-6 text-center">
                Полноэкранная витрина с современными возможностями Telegram Web Apps API
              </p>
              
              {/* Информация о WebApp */}
              <div className="mb-6 p-4 bg-black bg-opacity-20 rounded-lg text-sm">
                <p>📱 Платформа: {tg?.platform || 'Unknown'}</p>
                <p>🎨 Тема: {theme}</p>
                <p>📏 Высота: {viewportHeight}px</p>
                <p>🖼️ Полный экран: {isExpanded ? '✅' : '❌'}</p>
                <p>🔧 Версия API: {tg?.version || 'Unknown'}</p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigateTo('showcase')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 text-lg"
                >
                  🎯 Витрина кейсов
                </button>
                
                <button
                  onClick={() => navigateTo('chat')}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
                >
                  💬 Демо-чат
                </button>
                
                <button
                  onClick={() => navigateTo('channel-analytics')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  📊 Аналитика каналов
                </button>
                
                <button
                  onClick={() => navigateTo('post-analytics')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  📝 Аналитика постов
                </button>
                
                <button
                  onClick={() => navigateTo('post-tracking')}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105"
                >
                  🔗 Отслеживание постов
                </button>
                
                <button
                  onClick={() => navigateTo('referral')}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 transition-all transform hover:scale-105"
                >
                  👥 Реферальная система
                </button>
                
                <button
                  onClick={() => navigateTo('profile')}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105"
                >
                  👤 Профиль пользователя
                </button>
                
                <button
                  onClick={() => navigateTo('analytics')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105"
                >
                  📈 Аналитика & Обратная связь
                </button>
                
                <button
                  onClick={() => navigateTo('telegram-integration')}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  ⚙️ Интеграция с Telegram
                </button>
                
                <button
                  onClick={() => navigateTo('test-back')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-4 px-6 rounded-lg font-bold hover:from-yellow-400 hover:to-orange-400 transition-all transform hover:scale-105 text-lg border-2 border-black"
                >
                  🧪 ТЕСТ КНОПКИ "НАЗАД"
                </button>
              </div>
              
              {/* Статус кнопок */}
              <div className="mt-6 p-4 bg-black bg-opacity-20 rounded-lg text-sm">
                <p>🔘 MainButton: {mainButtonClicked ? 'Нажат ✅' : 'Ожидает'}</p>
                <p>⬅️ BackButton: {backButtonClicked ? 'Нажат ✅' : 'Ожидает'}</p>
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