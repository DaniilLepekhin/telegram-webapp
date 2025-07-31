import React, { useState, useEffect } from 'react';

interface UserStats {
  totalUsers: number;
  activeToday: number;
  activeWeek: number;
  avgSessionsPerUser: number;
  totalTimeSpent: number;
}

const UserStats: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/telegram/stats/users');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 ">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Загружаем статистику...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">❌</div>
          <h3 className="text-xl font-semibold text-white mb-2">Ошибка загрузки</h3>
          <p className="text-white/60">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass-card p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">Статистика недоступна</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Статистика пользователей</h3>
        <button
          onClick={fetchStats}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
        >
          🔄 Обновить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Общее количество пользователей */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Всего пользователей</p>
              <p className="text-white text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>

        {/* Активные сегодня */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Активные сегодня</p>
              <p className="text-white text-2xl font-bold">{stats.activeToday.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
              <span className="text-xl">🔥</span>
            </div>
          </div>
        </div>

        {/* Активные за неделю */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Активные за неделю</p>
              <p className="text-white text-2xl font-bold">{stats.activeWeek.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
          </div>
        </div>

        {/* Среднее количество сессий */}
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Среднее сессий</p>
              <p className="text-white text-2xl font-bold">{stats.avgSessionsPerUser.toFixed(1)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/30 rounded-xl flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
          </div>
        </div>
      </div>

      {/* Общее время в приложении */}
      <div className="mt-6 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl p-4 border border-indigo-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-300 text-sm font-medium">Общее время в приложении</p>
            <p className="text-white text-xl font-bold">{formatTime(stats.totalTimeSpent)}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center">
            <span className="text-xl">⏱️</span>
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">Конверсия</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70">Активность сегодня</span>
              <span className="text-white font-medium">
                {stats.totalUsers > 0 ? ((stats.activeToday / stats.totalUsers) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Активность за неделю</span>
              <span className="text-white font-medium">
                {stats.totalUsers > 0 ? ((stats.activeWeek / stats.totalUsers) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">Эффективность</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70">Среднее время сессии</span>
              <span className="text-white font-medium">
                {stats.totalUsers > 0 ? formatTime(Math.floor(stats.totalTimeSpent / stats.totalUsers)) : '0м'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Вовлеченность</span>
              <span className="text-white font-medium">
                {stats.avgSessionsPerUser > 1 ? 'Высокая' : 'Средняя'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats; 