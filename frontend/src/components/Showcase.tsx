import React, { useState } from 'react';
import BackButton from './BackButton';

interface Case {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  features: string[];
  demoUrl?: string;
  icon: string;
  rating: number;
  results: {
    growth: number;
    engagement: number;
  };
}

const cases: Case[] = [
  {
    id: 1,
    title: "E-commerce Bot",
    description: "Умный бот для интернет-магазина с каталогом товаров, корзиной и оплатой",
    image: "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=E-commerce+Bot",
    category: "E-commerce",
    features: ["Каталог товаров", "Корзина покупок", "Онлайн оплата", "Отслеживание заказов"],
    demoUrl: "/demo/ecommerce",
    icon: "🛒",
    rating: 4.8,
    results: { growth: 45, engagement: 78 }
  },
  {
    id: 2,
    title: "Support Assistant",
    description: "AI-ассистент для поддержки клиентов с автоматическими ответами и эскалацией",
    image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Support+Assistant",
    category: "Support",
    features: ["Автоответы", "Эскалация", "Тикеты", "Аналитика"],
    demoUrl: "/demo/support",
    icon: "🤖",
    rating: 4.9,
    results: { growth: 32, engagement: 85 }
  },
  {
    id: 3,
    title: "Fitness Coach",
    description: "Персональный тренер с планами тренировок, питанием и мотивацией",
    image: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Fitness+Coach",
    category: "Health",
    features: ["Планы тренировок", "Питание", "Прогресс", "Мотивация"],
    demoUrl: "/demo/fitness",
    icon: "💪",
    rating: 4.7,
    results: { growth: 28, engagement: 92 }
  },
  {
    id: 4,
    title: "Language Tutor",
    description: "Репетитор по иностранным языкам с уроками, тестами и разговорной практикой",
    image: "https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Language+Tutor",
    category: "Education",
    features: ["Уроки", "Тесты", "Разговорная практика", "Прогресс"],
    demoUrl: "/demo/language",
    icon: "📚",
    rating: 4.6,
    results: { growth: 38, engagement: 88 }
  }
];

const Showcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const categories = ['all', ...Array.from(new Set(cases.map(c => c.category)))];
  const filteredCases = selectedCategory === 'all' 
    ? cases 
    : cases.filter(c => c.category === selectedCategory);

  const handleTryDemo = (caseItem: Case) => {
    setSelectedCase(caseItem);
    // Здесь можно открыть демо-чат или перейти к интерактивному боту
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        action: 'open_demo',
        caseId: caseItem.id,
        caseTitle: caseItem.title
      }));
    }
  };

  const handleBack = () => {
    if (selectedCase) {
      setSelectedCase(null);
    } else {
      // Используем глобальную функцию для навигации назад
      if ((window as any).handleGoBack) {
        (window as any).handleGoBack();
      } else {
        // Fallback: просто переходим на главную
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative">
      {/* Красивая кнопка "Назад" */}
      <BackButton onClick={handleBack} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">💎</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
            Витрина кейсов
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
            Лучшие примеры успешных проектов и кейсы
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-4">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
                }`}
              >
                {category === 'all' ? 'Все' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem, index) => (
            <div
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer card-hover"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">{caseItem.icon}</span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{caseItem.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">{caseItem.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                    {caseItem.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white/80 text-sm">{caseItem.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Кейсы не найдены</h3>
            <p className="text-white/60">Попробуйте выбрать другую категорию</p>
          </div>
        )}
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">{selectedCase.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCase.title}</h2>
                    <p className="text-white/60">{selectedCase.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Описание</h3>
                  <p className="text-white/80 leading-relaxed">{selectedCase.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Результаты</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-400">{selectedCase.results.growth}%</div>
                      <div className="text-white/60 text-sm">Рост аудитории</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-400">{selectedCase.results.engagement}%</div>
                      <div className="text-white/60 text-sm">Вовлеченность</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleTryDemo(selectedCase)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                  >
                    Попробовать демо
                  </button>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="flex-1 bg-white/10 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase; 