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
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-3xl mb-6 shadow-2xl animate-pulse">
              <span className="text-4xl">💎</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-4 sm:mb-8 drop-shadow-2xl bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Витрина кейсов ✨
            </h1>
            <p className="text-2xl sm:text-3xl text-white/80 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
              Лучшие проекты и инновационные решения для вдохновения
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredCases.map((caseItem, index) => (
              <div
                key={caseItem.id}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 hover:border-white/30 transition-all duration-700 transform hover:scale-105 hover:shadow-2xl shadow-xl"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <span className="text-3xl">{caseItem.icon}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <span className="text-white font-bold text-lg">{caseItem.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 group-hover:bg-clip-text transition-all duration-500">
                    {caseItem.title}
                  </h3>
                  <p className="text-white/70 text-base mb-6 leading-relaxed group-hover:text-white/90 transition-colors duration-500">
                    {caseItem.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {caseItem.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 text-sm border border-white/20 group-hover:bg-white/20 group-hover:text-white transition-all duration-500"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all duration-500">
                      <div className="text-3xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-500">+{caseItem.results.growth}%</div>
                      <div className="text-sm text-white/60 font-medium">Рост</div>
                    </div>
                    <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all duration-500">
                      <div className="text-3xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-500">{caseItem.results.engagement}%</div>
                      <div className="text-sm text-white/60 font-medium">Вовлеченность</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleTryDemo(caseItem)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl group-hover:shadow-purple-500/30"
                  >
                    🚀 Попробовать демо
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Красивый футер */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-6 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="text-5xl">🎯</div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Готовы создать свой проект?</h3>
                <p className="text-white/70 text-lg">Выберите кейс и начните разработку прямо сейчас</p>
              </div>
            </div>
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