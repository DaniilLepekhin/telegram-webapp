import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';

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
    <div className="min-h-screen p-4 relative">
      {/* Красивая кнопка "Назад" */}
      <BackButton onClick={handleBack} />
      
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 fade-in">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">Личный кабинет</h1>
          <p className="text-sm sm:text-lg text-white/90 drop-shadow-md">Ваш профиль, достижения и статистика</p>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 sm:border-4 border-purple-200 flex-shrink-0"
            />
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md truncate">{profile.name}</h2>
              <p className="text-white/90 drop-shadow-sm truncate">{profile.username}</p>
              <p className="text-xs sm:text-sm text-white/70 drop-shadow-sm">Участник с {new Date(profile.joinDate).toLocaleDateString()}</p>
            </div>
            <div className="text-center sm:text-right flex-shrink-0">
              <div className="text-2xl sm:text-3xl font-bold text-purple-300 drop-shadow-md">Уровень {profile.level}</div>
              <div className="text-xs sm:text-sm text-white/80 drop-shadow-sm">{getLevelTitle(profile.level)}</div>
            </div>
          </div>

          {/* Experience Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-white/80 mb-2 drop-shadow-sm">
              <span>Опыт: {profile.experience} / {profile.nextLevelExp}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="text-lg sm:text-2xl font-bold text-blue-300 drop-shadow-md">{profile.stats.totalSessions}</div>
              <div className="text-xs sm:text-sm text-white/80 drop-shadow-sm">Сессий</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="text-lg sm:text-2xl font-bold text-green-300 drop-shadow-md">{profile.stats.totalMessages}</div>
              <div className="text-xs sm:text-sm text-white/80 drop-shadow-sm">Сообщений</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="text-lg sm:text-2xl font-bold text-purple-300 drop-shadow-md">{profile.stats.favoriteBots}</div>
              <div className="text-xs sm:text-sm text-white/80 drop-shadow-sm">Любимых ботов</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="text-lg sm:text-2xl font-bold text-orange-300 drop-shadow-md">₽{profile.stats.referralEarnings}</div>
              <div className="text-xs sm:text-sm text-white/80 drop-shadow-sm">Заработано</div>
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
                      : 'border-transparent text-white/70 hover:text-white/90'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 drop-shadow-md">Настройки профиля</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">Имя</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/50 backdrop-blur-sm"
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/50 backdrop-blur-sm"
                      placeholder="Введите username"
                    />
                  </div>
                  <button className="btn-primary">
                    Сохранить изменения
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Достижения</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 ${
                        achievement.unlocked
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          {achievement.unlocked && achievement.unlockedDate && (
                            <p className="text-xs text-green-600 mt-1">
                              Получено {new Date(achievement.unlockedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {achievement.unlocked && (
                          <div className="text-green-500">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Подробная статистика</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Активность</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-600">Дней активен:</span>
                          <span className="font-semibold">{profile.stats.daysActive}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Среднее сообщений/день:</span>
                          <span className="font-semibold">{Math.round(profile.stats.totalMessages / profile.stats.daysActive)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Реферальная программа</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-green-600">Заработано:</span>
                          <span className="font-semibold">₽{profile.stats.referralEarnings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Средний доход/день:</span>
                          <span className="font-semibold">₽{Math.round(profile.stats.referralEarnings / profile.stats.daysActive)}</span>
                        </div>
                      </div>
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