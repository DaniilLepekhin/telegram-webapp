import React, { useState } from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

interface AnalyticsData {
  dailyUsers: number[];
  weeklyGrowth: number;
  totalUsers: number;
  activeUsers: number;
  averageSessionTime: number;
  popularBots: { name: string; usage: number }[];
}

interface Feedback {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
  category: string;
}

const AnalyticsFeedback: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'feedback'>('analytics');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: '',
    category: 'general'
  });

  const analytics: AnalyticsData = {
    dailyUsers: [120, 145, 132, 167, 189, 201, 234],
    weeklyGrowth: 15.2,
    totalUsers: 15420,
    activeUsers: 3240,
    averageSessionTime: 8.5,
    popularBots: [
      { name: 'E-commerce Bot', usage: 45 },
      { name: 'Support Assistant', usage: 38 },
      { name: 'Fitness Coach', usage: 32 },
      { name: 'Language Tutor', usage: 28 }
    ]
  };

  const feedbacks: Feedback[] = [
    {
      id: '1',
      user: 'Алексей К.',
      rating: 5,
      comment: 'Отличный сервис! Боты работают быстро и качественно. Особенно понравился E-commerce Bot.',
      date: '2024-02-15',
      category: 'general'
    },
    {
      id: '2',
      user: 'Мария С.',
      rating: 4,
      comment: 'Хорошая платформа, но хотелось бы больше бесплатных функций.',
      date: '2024-02-14',
      category: 'suggestion'
    },
    {
      id: '3',
      user: 'Дмитрий В.',
      rating: 5,
      comment: 'Реферальная программа работает отлично! Уже заработал 2000₽.',
      date: '2024-02-13',
      category: 'referral'
    },
    {
      id: '4',
      user: 'Елена П.',
      rating: 5,
      comment: 'Интерфейс очень удобный, все интуитивно понятно. Рекомендую!',
      date: '2024-02-12',
      category: 'general'
    }
  ];

  const handleSubmitFeedback = () => {
    // Здесь будет отправка отзыва на backend
    console.log('Отправка отзыва:', feedbackForm);
    setShowFeedbackForm(false);
    setFeedbackForm({ rating: 5, comment: '', category: 'general' });
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800';
      case 'suggestion': return 'bg-yellow-100 text-yellow-800';
      case 'referral': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Красивая кнопка "Назад" */}
      <BackButton onClick={() => {
        if ((window as any).handleGoBack) {
          (window as any).handleGoBack();
        } else {
          window.location.reload();
        }
      }} />
      
      {/* Кнопка полноэкранного режима */}
      <FullscreenButton />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-400 to-cyan-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">📊</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
            Аналитика & Обратная связь
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
            Подробная статистика и отзывы пользователей
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-4">
            {[
              { id: 'analytics', label: 'Аналитика', icon: '📈' },
              { id: 'feedback', label: 'Отзывы', icon: '💬' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">👥</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{analytics.totalUsers.toLocaleString()}</h3>
                <p className="text-white/60">Всего пользователей</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📈</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-1">+{analytics.weeklyGrowth}%</h3>
                <p className="text-white/60">Рост за неделю</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">⏱️</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-purple-400 mb-1">{analytics.averageSessionTime}м</h3>
                <p className="text-white/60">Среднее время сессии</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🔥</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-orange-400 mb-1">{analytics.activeUsers.toLocaleString()}</h3>
                <p className="text-white/60">Активных пользователей</p>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Отзывы пользователей</h2>
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                >
                  ✍️ Оставить отзыв
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{feedback.user}</h3>
                        <p className="text-white/60 text-sm">{feedback.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                        {feedback.category}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="text-yellow-400 text-lg">{getRatingStars(feedback.rating)}</span>
                    </div>
                    <p className="text-white/80 leading-relaxed">{feedback.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFeedback; 