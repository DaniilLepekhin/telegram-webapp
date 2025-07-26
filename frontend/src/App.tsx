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

const tg = window.Telegram?.WebApp;

type Page = 'main' | 'showcase' | 'chat' | 'referral' | 'profile' | 'analytics' | 'channel-analytics' | 'post-analytics' | 'telegram-integration' | 'post-tracking';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [theme, setTheme] = useState(tg?.colorScheme || 'default');
  const [initData, setInitData] = useState(tg?.initData || '');
  const [mainButtonClicked, setMainButtonClicked] = useState(false);
  const [backButtonClicked, setBackButtonClicked] = useState(false);

  useEffect(() => {
    if (tg) {
      tg.expand();
      tg.ready();
      tg.MainButton.setText('Отправить данные');
      tg.MainButton.show();
      tg.MainButton.onClick(() => {
        setMainButtonClicked(true);
        tg.sendData(JSON.stringify({ action: 'demo', value: 'Привет из WebApp!' }));
      });
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        setBackButtonClicked(true);
        if (currentPage === 'main') {
          tg.close();
        } else {
          setCurrentPage('main');
        }
      });
      setTheme(tg.colorScheme);
      setInitData(tg.initData);
    }
    return () => {
      if (tg) {
        tg.MainButton.onClick(() => {});
        tg.BackButton.onClick(() => {});
      }
    };
  }, [currentPage]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    if (tg) {
      tg.BackButton.show();
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
      default:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
            <div className="p-8 rounded-xl shadow-xl bg-white bg-opacity-10 backdrop-blur-md w-full max-w-md">
              <h1 className="text-3xl font-bold mb-4 text-center">Telegram WebApp Demo</h1>
              <p className="text-lg mb-6 text-center">
                Инновационная витрина для демонстрации возможностей чат-ботов с полным функционалом
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigateTo('showcase')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
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
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105"
                >
                  🔗 Отслеживание постов
                </button>
                
                <button
                  onClick={() => navigateTo('telegram-integration')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-green-700 transition-all transform hover:scale-105"
                >
                  🤖 Интеграция с Telegram
                </button>
                
                <button
                  onClick={() => navigateTo('referral')}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 transition-all transform hover:scale-105"
                >
                  👥 Реферальная система
                </button>
                
                <button
                  onClick={() => navigateTo('profile')}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-700 hover:to-cyan-700 transition-all transform hover:scale-105"
                >
                  👤 Личный кабинет
                </button>
                
                <button
                  onClick={() => navigateTo('analytics')}
                  className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 transition-all transform hover:scale-105"
                >
                  📈 Аналитика и отзывы
                </button>
              </div>

              <div className="mt-6 text-xs opacity-60 space-y-1">
                <div>window.Telegram.WebApp.version: {tg?.version || 'n/a'}</div>
                <div>Тема: {theme}</div>
                <div className="break-all">initData: {initData}</div>
                {mainButtonClicked && <div className="text-green-300">MainButton был нажат и данные отправлены!</div>}
                {backButtonClicked && <div className="text-red-300">BackButton был нажат, WebApp закрывается...</div>}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-black' : ''}`}>
      {renderPage()}
    </div>
  );
}

export default App; 