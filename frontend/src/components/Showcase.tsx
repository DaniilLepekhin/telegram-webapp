import React, { useState } from 'react';
import FullscreenButton from './FullscreenButton';

interface Case {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  features: string[];
  demoUrl: string;
  icon: string;
  rating: number;
  results: { growth: number; engagement: number; };
}

const cases: Case[] = [
  {
    id: 1,
    title: "AI Business Mentor",
    description: "Персональный бизнес-наставник с анализом данных, планированием и развитием стратегии",
    image: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=AI+Business+Mentor",
    category: "Business",
    features: ["Анализ бизнеса", "Стратегическое планирование", "Финансовое моделирование"],
    demoUrl: "/demo/business",
    icon: "💼",
    rating: 4.8,
    results: { growth: 45, engagement: 92 }
  },
  {
    id: 2,
    title: "Smart Health Assistant",
    description: "Умный помощник для здоровья с трекингом симптомов, напоминаниями и рекомендациями",
    image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Health+Assistant",
    category: "Healthcare",
    features: ["Трекинг здоровья", "Напоминания", "Персональные рекомендации"],
    demoUrl: "/demo/health",
    icon: "🏥",
    rating: 4.7,
    results: { growth: 62, engagement: 85 }
  },
  {
    id: 3,
    title: "Education Hub",
    description: "Образовательная платформа с курсами, тестами и персональным прогрессом",
    image: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Education+Hub",
    category: "Education",
    features: ["Онлайн курсы", "Интерактивные тесты", "Сертификаты"],
    demoUrl: "/demo/education",
    icon: "🎓",
    rating: 4.9,
    results: { growth: 73, engagement: 94 }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-8 fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl mb-4 shadow-2xl">
              <span className="text-2xl sm:text-3xl">💎</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
              Витрина кейсов ✨
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCases.map((caseItem, index) => (
              <div
                key={caseItem.id}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{caseItem.icon}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white font-medium">{caseItem.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{caseItem.title}</h3>
                  <p className="text-white/70 text-sm mb-4 leading-relaxed">{caseItem.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caseItem.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs border border-white/20"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">+{caseItem.results.growth}%</div>
                      <div className="text-xs text-white/60">Рост</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{caseItem.results.engagement}%</div>
                      <div className="text-xs text-white/60">Вовлеченность</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleTryDemo(caseItem)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Попробовать демо
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedCase.title}</h3>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-white/80 mb-6">{selectedCase.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-green-400">+{selectedCase.results.growth}%</div>
                <div className="text-white/60">Рост продаж</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-blue-400">{selectedCase.results.engagement}%</div>
                <div className="text-white/60">Вовлеченность</div>
              </div>
            </div>
            <button
              onClick={() => {
                // Здесь открывается демо
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.sendData(JSON.stringify({
                    action: 'start_demo',
                    caseId: selectedCase.id
                  }));
                }
                setSelectedCase(null);
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium transition-all duration-300"
            >
              Начать демо
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase; 