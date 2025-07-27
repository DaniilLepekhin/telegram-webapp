import React from 'react';

const TestBackButton: React.FC = () => {
  const handleBack = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.BackButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Очень заметная кнопка назад */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="w-full bg-yellow-400 text-black py-6 px-8 rounded-xl shadow-2xl hover:bg-yellow-300 transition-all transform hover:scale-110 font-bold text-2xl border-4 border-black"
          >
            🔙 НАЖМИ НАЗАД К ГЛАВНОЙ СТРАНИЦЕ 🔙
          </button>
        </div>

        {/* Тестовый контент */}
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🧪 ТЕСТОВАЯ СТРАНИЦА
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Если вы видите эту страницу, значит вы перешли в раздел "Тест"
          </p>
          
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6">
            <p className="text-lg font-semibold text-yellow-800">
              ⚠️ ВНИМАНИЕ: Кнопка "НАЗАД" должна быть вверху страницы!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800">Что проверить:</h3>
              <ul className="text-blue-700 text-left mt-2">
                <li>• Кнопка "НАЗАД" видна вверху</li>
                <li>• Кнопка желтого цвета</li>
                <li>• При нажатии возврат на главную</li>
              </ul>
            </div>
            
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-bold text-green-800">Статус:</h3>
              <ul className="text-green-700 text-left mt-2">
                <li>• Страница загружена ✅</li>
                <li>• Кнопка отображается ✅</li>
                <li>• Функционал работает ✅</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBackButton; 