import React, { useState, useEffect } from 'react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Реферальная программа</h1>
          <p className="text-lg text-gray-600">Приглашайте друзей и получайте бонусы за каждого активного реферала</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalReferrals}</div>
            <div className="text-gray-600">Всего рефералов</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeReferrals}</div>
            <div className="text-gray-600">Активных рефералов</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">₽{stats.totalEarnings}</div>
            <div className="text-gray-600">Общий заработок</div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ваша реферальная ссылка</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Код приглашения</label>
              <div className="flex">
                <input
                  type="text"
                  value={stats.referralCode}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(stats.referralCode)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                >
                  {copied ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Полная ссылка</label>
              <div className="flex">
                <input
                  type="text"
                  value={stats.referralLink}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(stats.referralLink)}
                  className="bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600 transition-colors"
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