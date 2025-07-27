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

  const handleBack = () => {
    if (selectedCase) {
      setSelectedCase(null);
    } else {
      // Возвращаемся на главную страницу
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.onClick(() => {
          // Эмулируем возврат на главную страницу
          window.location.reload();
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header с кнопкой назад */}
        <div className="mb-8">
          {/* Кнопка назад - максимально заметная */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="w-full bg-red-600 text-white py-8 px-10 rounded-xl shadow-2xl hover:bg-red-700 transition-all transform hover:scale-105 font-bold text-3xl border-4 border-white"
            >
              🔙 НАЖМИ НАЗАД К ГЛАВНОЙ СТРАНИЦЕ 🔙
            </button>
          </div>
          
          {/* Заголовок */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Витрина чат-ботов</h1>
            <p className="text-lg text-gray-600">Выберите интересующий вас кейс и попробуйте демо</p>
          </div>
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
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {caseItem.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{caseItem.title}</h3>
                <p className="text-gray-600 mb-4">{caseItem.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Возможности:</h4>
                  <ul className="space-y-1">
                    {caseItem.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => handleTryDemo(caseItem)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  🚀 Попробовать демо
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Кейсы не найдены</h3>
            <p className="text-gray-500">Попробуйте выбрать другую категорию</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Showcase; 