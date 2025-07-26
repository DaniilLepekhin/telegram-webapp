import React, { useState } from 'react';

interface Case {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  features: string[];
  demoUrl?: string;
}

const cases: Case[] = [
  {
    id: 1,
    title: "E-commerce Bot",
    description: "Умный бот для интернет-магазина с каталогом товаров, корзиной и оплатой",
    image: "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=E-commerce+Bot",
    category: "E-commerce",
    features: ["Каталог товаров", "Корзина покупок", "Онлайн оплата", "Отслеживание заказов"],
    demoUrl: "/demo/ecommerce"
  },
  {
    id: 2,
    title: "Support Assistant",
    description: "AI-ассистент для поддержки клиентов с автоматическими ответами и эскалацией",
    image: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Support+Assistant",
    category: "Support",
    features: ["Автоответы", "Эскалация", "Тикеты", "Аналитика"],
    demoUrl: "/demo/support"
  },
  {
    id: 3,
    title: "Fitness Coach",
    description: "Персональный тренер с планами тренировок, питанием и мотивацией",
    image: "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Fitness+Coach",
    category: "Health",
    features: ["Планы тренировок", "Питание", "Прогресс", "Мотивация"],
    demoUrl: "/demo/fitness"
  },
  {
    id: 4,
    title: "Language Tutor",
    description: "Репетитор по иностранным языкам с уроками, тестами и разговорной практикой",
    image: "https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Language+Tutor",
    category: "Education",
    features: ["Уроки", "Тесты", "Разговорная практика", "Прогресс"],
    demoUrl: "/demo/language"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Витрина чат-ботов</h1>
          <p className="text-lg text-gray-600">Выберите интересующий вас кейс и попробуйте демо</p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? 'Все' : category}
            </button>
          ))}
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map(caseItem => (
            <div key={caseItem.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={caseItem.image} 
                alt={caseItem.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {caseItem.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{caseItem.title}</h3>
                <p className="text-gray-600 mb-4">{caseItem.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Возможности:</h4>
                  <div className="flex flex-wrap gap-1">
                    {caseItem.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleTryDemo(caseItem)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Попробовать демо
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Демо: {selectedCase.title}</h3>
              <p className="text-gray-600 mb-4">Открываем интерактивный демо-чат...</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setSelectedCase(null);
                    // Здесь можно открыть полноценный демо-чат
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg"
                >
                  Открыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Showcase; 