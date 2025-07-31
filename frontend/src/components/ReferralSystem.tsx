import React, { useState } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

const ReferralSystem: React.FC = () => {
  const [referralCode, setReferralCode] = useState('REF123456');
  const [referrals, setReferrals] = useState([
    { id: 1, name: 'Алексей Петров', date: '2024-01-15', status: 'active', reward: 500 },
    { id: 2, name: 'Мария Сидорова', date: '2024-01-10', status: 'pending', reward: 300 },
    { id: 3, name: 'Дмитрий Козлов', date: '2024-01-05', status: 'active', reward: 750 },
  ]);

  const totalRewards = referrals.reduce((sum, ref) => sum + ref.reward, 0);
  const activeReferrals = referrals.filter(ref => ref.status === 'active').length;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    // Можно добавить уведомление об успешном копировании
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full opacity-10 "></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full opacity-10 "></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full opacity-10 "></div>
      </div>

      {/* Navigation buttons */}
      <BackButton onClick={() => (window as any).handleGoBack?.()} />
      <FullscreenButton />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-3xl mb-6 shadow-2xl ">
            <span className="text-4xl">🎯</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-4 sm:mb-8 drop-shadow-2xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Реферальная система
          </h1>
          <p className="text-2xl sm:text-3xl text-white/80 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
            Приглашайте друзей и получайте награды
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">{referrals.length}</div>
            <div className="text-white/70">Всего рефералов</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">{activeReferrals}</div>
            <div className="text-white/70">Активных рефералов</div>
          </div>
          <div className="glass-card p-6 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">{totalRewards}₽</div>
            <div className="text-white/70">Общий заработок</div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Ваш реферальный код</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
              <span className="text-2xl font-mono text-white">{referralCode}</span>
            </div>
            <button
              onClick={copyReferralCode}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              Копировать
            </button>
          </div>
        </div>

        {/* Referrals List */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Ваши рефералы</h2>
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div key={referral.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{referral.name}</h3>
                    <p className="text-white/70">Присоединился: {referral.date}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      referral.status === 'active' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {referral.status === 'active' ? 'Активен' : 'Ожидает'}
                    </div>
                    <div className="text-white font-bold mt-1">{referral.reward}₽</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Как это работает</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📤</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Поделитесь кодом</h3>
                <p className="text-white/70">Отправьте свой реферальный код друзьям</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Друзья регистрируются</h3>
                <p className="text-white/70">Они используют ваш код при регистрации</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Получайте награды</h3>
                <p className="text-white/70">Зарабатывайте за каждого активного реферала</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem; 