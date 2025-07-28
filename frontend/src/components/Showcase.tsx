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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12 fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-3xl mb-6 shadow-2xl animate-pulse">
              <span className="text-3xl sm:text-4xl">💎</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Витрина кейсов
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
              Лучшие примеры успешных проектов и кейсы с инновационными решениями
            </p>
          </div>

          {/* Enhanced Categories */}
          <div className="mb-10">
            <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-6">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-500 whitespace-nowrap flex-shrink-0 transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-2xl shadow-purple-500/40 scale-105'
                      : 'bg-white/10 backdrop-blur-xl text-white/80 hover:bg-white/20 hover:text-white border border-white/20 hover:border-white/40 hover:shadow-xl'
                  }`}
                >
                  {category === 'all' ? 'Все проекты' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredCases.map((caseItem, index) => (
              <div
                key={caseItem.id}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  animationDuration: '0.8s'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{caseItem.icon}</div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <span className="text-white font-bold text-lg">{caseItem.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300">{caseItem.title}</h3>
                  <p className="text-white/80 text-base mb-6 leading-relaxed">{caseItem.description}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {caseItem.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm border border-white/30 hover:bg-white/25 transition-colors duration-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
                      <div className="text-3xl font-bold text-green-400">+{caseItem.results.growth}%</div>
                      <div className="text-sm text-white/70 font-medium">Рост</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30">
                      <div className="text-3xl font-bold text-blue-400">{caseItem.results.engagement}%</div>
                      <div className="text-sm text-white/70 font-medium">Вовлеченность</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleTryDemo(caseItem)}
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-purple-500/30"
                  >
                    🚀 Попробовать демо
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-white/30 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedCase.icon}</div>
                <h3 className="text-3xl font-bold text-white">{selectedCase.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors hover:scale-110"
              >
                ✕
              </button>
            </div>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">{selectedCase.description}</p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30">
                <div className="text-4xl font-bold text-green-400">+{selectedCase.results.growth}%</div>
                <div className="text-white/80 font-medium">Рост продаж</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30">
                <div className="text-4xl font-bold text-blue-400">{selectedCase.results.engagement}%</div>
                <div className="text-white/80 font-medium">Вовлеченность</div>
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
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              🚀 Начать демо
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase; 