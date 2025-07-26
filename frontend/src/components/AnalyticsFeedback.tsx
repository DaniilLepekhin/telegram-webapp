import React, { useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Аналитика и отзывы</h1>
          <p className="text-lg text-gray-600">Статистика использования и отзывы пользователей</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'analytics', label: 'Аналитика', icon: '📊' },
                { id: 'feedback', label: 'Отзывы', icon: '💬' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Статистика платформы</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                    <div className="text-3xl font-bold mb-2">{analytics.totalUsers.toLocaleString()}</div>
                    <div className="text-blue-100">Всего пользователей</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                    <div className="text-3xl font-bold mb-2">{analytics.activeUsers.toLocaleString()}</div>
                    <div className="text-green-100">Активных пользователей</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                    <div className="text-3xl font-bold mb-2">+{analytics.weeklyGrowth}%</div>
                    <div className="text-purple-100">Рост за неделю</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                    <div className="text-3xl font-bold mb-2">{analytics.averageSessionTime}м</div>
                    <div className="text-orange-100">Среднее время сессии</div>
                  </div>
                </div>

                {/* Daily Users Chart */}
                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Активность за неделю</h4>
                  <div className="flex items-end justify-between h-32">
                    {analytics.dailyUsers.map((users, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-indigo-500 rounded-t w-8 transition-all duration-300 hover:bg-indigo-600"
                          style={{ height: `${(users / Math.max(...analytics.dailyUsers)) * 100}%` }}
                        ></div>
                        <div className="text-xs text-gray-600 mt-2">{users}</div>
                        <div className="text-xs text-gray-500">День {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Bots */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Популярные боты</h4>
                  <div className="space-y-4">
                    {analytics.popularBots.map((bot, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{bot.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{ width: `${(bot.usage / Math.max(...analytics.popularBots.map(b => b.usage))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{bot.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Отзывы пользователей</h3>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Оставить отзыв
                  </button>
                </div>

                {/* Feedback List */}
                <div className="space-y-6">
                  {feedbacks.map(feedback => (
                    <div key={feedback.id} className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{feedback.user}</h4>
                          <div className="text-yellow-500 text-lg">{getRatingStars(feedback.rating)}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}>
                            {feedback.category === 'general' ? 'Общий' : 
                             feedback.category === 'suggestion' ? 'Предложение' : 'Реферал'}
                          </span>
                          <span className="text-sm text-gray-500">{new Date(feedback.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Feedback Form Modal */}
                {showFeedbackForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Оставить отзыв</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                                className={`text-2xl ${feedbackForm.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                          <select
                            value={feedbackForm.category}
                            onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="general">Общий отзыв</option>
                            <option value="suggestion">Предложение</option>
                            <option value="referral">Реферальная программа</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
                          <textarea
                            value={feedbackForm.comment}
                            onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                            rows={4}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Поделитесь своим мнением..."
                          ></textarea>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowFeedbackForm(false)}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={handleSubmitFeedback}
                            className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600"
                          >
                            Отправить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFeedback; 