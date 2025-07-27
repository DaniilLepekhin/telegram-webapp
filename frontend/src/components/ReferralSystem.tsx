import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  referralCode: string;
  referralLink: string;
}

const ReferralSystem: React.FC = () => {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 2400,
    referralCode: 'DEMO123',
    referralLink: 'https://t.me/your_bot?start=DEMO123'
  });

  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const generateQRCode = (text: string) => {
    // В реальном проекте здесь будет генерация QR-кода
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const handleBack = () => {
    if ((window as any).handleGoBack) {
      (window as any).handleGoBack();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Кнопка "Назад" */}
      <BackButton onClick={handleBack} />

      {/* Кнопка полноэкранного режима */}
      <FullscreenButton />

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">🎁</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
            Реферальная программа
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
            Приглашайте друзей и получайте бонусы за каждого активного реферала
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2 drop-shadow-sm">{stats.totalReferrals}</div>
              <div className="text-white/70 drop-shadow-sm">Всего рефералов</div>
            </div>
          </div>
          <div className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2 drop-shadow-sm">{stats.activeReferrals}</div>
              <div className="text-white/70 drop-shadow-sm">Активных рефералов</div>
            </div>
          </div>
          <div className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2 drop-shadow-sm">₽{stats.totalEarnings}</div>
              <div className="text-white/70 drop-shadow-sm">Общий заработок</div>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-2xl">Ваша реферальная ссылка</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 drop-shadow-sm">Код приглашения</label>
              <div className="flex">
                <input
                  type="text"
                  value={stats.referralCode}
                  readOnly
                  className="flex-1 border border-white/20 rounded-l-lg px-3 py-2 bg-white/10 text-white backdrop-blur-sm"
                />
                <button
                  onClick={() => copyToClipboard(stats.referralCode)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-r-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {copied ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2 drop-shadow-sm">Полная ссылка</label>
              <div className="flex">
                <input
                  type="text"
                  value={stats.referralLink}
                  readOnly
                  className="flex-1 border border-white/20 rounded-l-lg px-3 py-2 bg-white/10 text-white backdrop-blur-sm text-sm"
                />
                <button
                  onClick={() => copyToClipboard(stats.referralLink)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-r-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {copied ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowQR(!showQR)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                {showQR ? 'Скрыть QR' : 'Показать QR'}
              </button>
              
              <button
                onClick={() => {
                  if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.sendData(JSON.stringify({
                      action: 'share_referral',
                      referralLink: stats.referralLink
                    }));
                  }
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Поделиться в Telegram
              </button>
            </div>

            {showQR && (
              <div className="text-center mt-4">
                <img
                  src={generateQRCode(stats.referralLink)}
                  alt="QR Code"
                  className="mx-auto border rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">Отсканируйте QR-код для перехода по ссылке</p>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">1</div>
              <h3 className="font-semibold text-gray-800 mb-2">Поделитесь ссылкой</h3>
              <p className="text-gray-600 text-sm">Отправьте вашу реферальную ссылку друзьям</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">2</div>
              <h3 className="font-semibold text-gray-800 mb-2">Друг регистрируется</h3>
              <p className="text-gray-600 text-sm">Ваш друг переходит по ссылке и регистрируется</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">3</div>
              <h3 className="font-semibold text-gray-800 mb-2">Получите бонус</h3>
              <p className="text-gray-600 text-sm">За каждого активного реферала вы получаете ₽200</p>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Система вознаграждений</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">За регистрацию</h3>
              <p className="text-2xl font-bold text-green-600 mb-2">₽200</p>
              <p className="text-gray-600 text-sm">За каждого нового реферала</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">За активность</h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">₽50</p>
              <p className="text-gray-600 text-sm">За каждую неделю активности реферала</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem; 