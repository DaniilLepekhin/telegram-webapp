import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton'; // Added import for FullscreenButton

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  joinDate: string;
  level: number;
  experience: number;
  nextLevelExp: number;
  achievements: Achievement[];
  stats: UserStats;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface UserStats {
  totalSessions: number;
  totalMessages: number;
  favoriteBots: number;
  referralEarnings: number;
  daysActive: number;
}

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '123456789',
    name: 'Демо Пользователь',
    username: '@demo_user',
    avatar: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=DU',
    joinDate: '2024-01-15',
    level: 7,
    experience: 1250,
    nextLevelExp: 2000,
    achievements: [
      {
        id: '1',
        title: 'Первые шаги',
        description: 'Завершите первую сессию с ботом',
        icon: '🎯',
        unlocked: true,
        unlockedDate: '2024-01-15'
      },
      {
        id: '2',
        title: 'Общительный',
        description: 'Отправьте 100 сообщений',
        icon: '💬',
        unlocked: true,
        unlockedDate: '2024-01-20'
      },
      {
        id: '3',
        title: 'Исследователь',
        description: 'Попробуйте 5 разных ботов',
        icon: '🔍',
        unlocked: true,
        unlockedDate: '2024-02-01'
      },
      {
        id: '4',
        title: 'Реферал',
        description: 'Пригласите первого друга',
        icon: '👥',
        unlocked: true,
        unlockedDate: '2024-02-10'
      },
      {
        id: '5',
        title: 'Эксперт',
        description: 'Достигните 10 уровня',
        icon: '🏆',
        unlocked: false
      },
      {
        id: '6',
        title: 'Мастер',
        description: 'Отправьте 1000 сообщений',
        icon: '👑',
        unlocked: false
      }
    ],
    stats: {
      totalSessions: 45,
      totalMessages: 342,
      favoriteBots: 3,
      referralEarnings: 2400,
      daysActive: 28
    }
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'stats'>('profile');

  // Получаем данные пользователя из Telegram
  useEffect(() => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      setProfile(prev => ({
        ...prev,
        id: user.id.toString(),
        name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
        username: user.username ? `@${user.username}` : 'Без username',
        avatar: user.photo_url || prev.avatar,
        joinDate: new Date().toISOString().split('T')[0] // Сегодняшняя дата как пример
      }));
    }
  }, []);

  const progressPercentage = (profile.experience / profile.nextLevelExp) * 100;

  const getLevelTitle = (level: number) => {
    if (level < 5) return 'Новичок';
    if (level < 10) return 'Опытный';
    if (level < 15) return 'Эксперт';
    return 'Мастер';
  };

  const handleBack = () => {
    if ((window as any).handleGoBack) {
      (window as any).handleGoBack();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative">
      {/* Красивая кнопка "Назад" */}
      <BackButton onClick={handleBack} />
      
      {/* Кнопка полноэкранного режима */}
      <FullscreenButton />
      
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">👤</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">Личный кабинет</h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">Ваш профиль, достижения и статистика</p>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-purple-200 flex-shrink-0 shadow-2xl"
            />
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md truncate">{profile.name}</h2>
              <p className="text-white/90 drop-shadow-sm truncate text-lg">{profile.username}</p>
              <p className="text-sm text-white/70 drop-shadow-sm">Участник с {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
            <div className="text-center sm:text-right flex-shrink-0">
              <div className="text-3xl sm:text-4xl font-bold text-purple-300 drop-shadow-md">Уровень {profile.level}</div>
              <div className="text-sm text-white/80 drop-shadow-sm">{getLevelTitle(profile.level)}</div>
            </div>
          </div>

          {/* Experience Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-white/80 mb-3 drop-shadow-sm">
              <span>Опыт: {profile.experience} / {profile.nextLevelExp}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold text-blue-300 drop-shadow-md">{profile.stats.totalSessions}</div>
              <div className="text-sm text-white/80 drop-shadow-sm">Сессий</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold text-green-300 drop-shadow-md">{profile.stats.totalMessages}</div>
              <div className="text-sm text-white/80 drop-shadow-sm">Сообщений</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold text-purple-300 drop-shadow-md">{profile.stats.favoriteBots}</div>
              <div className="text-sm text-white/80 drop-shadow-sm">Любимых ботов</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-2xl sm:text-3xl font-bold text-orange-300 drop-shadow-md">₽{profile.stats.referralEarnings}</div>
              <div className="text-sm text-white/80 drop-shadow-sm">Заработано</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-card mb-8">
          <div className="border-b border-white/20">
            <nav className="flex overflow-x-auto scrollbar-hide px-6">
              {[
                { id: 'profile', label: 'Профиль', icon: '👤' },
                { id: 'achievements', label: 'Достижения', icon: '🏆' },
                { id: 'stats', label: 'Статистика', icon: '📊' },
                { id: 'settings', label: 'Настройки', icon: '⚙️' },
                { id: 'security', label: 'Безопасность', icon: '🔒' },
                { id: 'notifications', label: 'Уведомления', icon: '🔔' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-purple-400 text-purple-300'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-3">Личная информация</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white/60 text-sm">Имя</label>
                        <p className="text-white font-medium">{profile.name}</p>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm">Username</label>
                        <p className="text-white font-medium">{profile.username}</p>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm">Дата регистрации</label>
                        <p className="text-white font-medium">{new Date(profile.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-3">Прогресс</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-white/60 text-sm">Текущий уровень</label>
                        <p className="text-white font-medium">{profile.level} - {getLevelTitle(profile.level)}</p>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm">Опыт</label>
                        <p className="text-white font-medium">{profile.experience} / {profile.nextLevelExp}</p>
                      </div>
                      <div>
                        <label className="text-white/60 text-sm">Дней активности</label>
                        <p className="text-white font-medium">{profile.stats.daysActive}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Достижения</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        achievement.unlocked
                          ? 'bg-white/10 border-green-400/50'
                          : 'bg-white/5 border-white/20 opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{achievement.title}</h4>
                          <p className="text-sm text-white/60">{achievement.description}</p>
                        </div>
                      </div>
                      {achievement.unlocked && achievement.unlockedDate && (
                        <div className="text-xs text-green-400">
                          Получено {new Date(achievement.unlockedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Подробная статистика</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-4">Активность</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Всего сессий</span>
                        <span className="text-white font-bold">{profile.stats.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Всего сообщений</span>
                        <span className="text-white font-bold">{profile.stats.totalMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Дней активности</span>
                        <span className="text-white font-bold">{profile.stats.daysActive}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-4">Экономика</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Реферальные доходы</span>
                        <span className="text-white font-bold">₽{profile.stats.referralEarnings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Любимых ботов</span>
                        <span className="text-white font-bold">{profile.stats.favoriteBots}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Настройки</h3>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Уведомления</h4>
                        <p className="text-sm text-white/60">Получать уведомления о новых функциях</p>
                      </div>
                      <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Темная тема</h4>
                        <p className="text-sm text-white/60">Использовать темную тему</p>
                      </div>
                      <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Безопасность</h3>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                  <div className="space-y-4">
                    <button className="w-full text-left p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <h4 className="font-semibold text-white">Изменить пароль</h4>
                      <p className="text-sm text-white/60">Обновите пароль для безопасности</p>
                    </button>
                    
                    <button className="w-full text-left p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <h4 className="font-semibold text-white">Двухфакторная аутентификация</h4>
                      <p className="text-sm text-white/60">Дополнительная защита аккаунта</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Уведомления</h3>
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Push-уведомления</h4>
                        <p className="text-sm text-white/60">Получать уведомления в браузере</p>
                      </div>
                      <button className="w-12 h-6 bg-gray-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Email-уведомления</h4>
                        <p className="text-sm text-white/60">Получать уведомления на email</p>
                      </div>
                      <button className="w-12 h-6 bg-purple-500 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 