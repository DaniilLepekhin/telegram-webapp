import React from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

const TestBackButton: React.FC = () => {
  const handleBack = () => {
    if ((window as any).handleGoBack) {
      (window as any).handleGoBack();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Красивая кнопка "Назад" */}
      <BackButton onClick={handleBack} />
      
      {/* Кнопка полноэкранного режима */}
      <FullscreenButton />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">🧪</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
            Тестовая страница
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
            Проверка функциональности кнопок и навигации
          </p>
        </div>

        {/* Test Content */}
        <div className="glass-card p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Проверка кнопок</h2>
            <p className="text-white/80 mb-6">
              Если вы видите эту страницу, значит вы перешли в раздел "Тест"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="font-bold text-white mb-3 flex items-center">
                <span className="mr-2">🔍</span>
                Что проверить:
              </h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Кнопка "НАЗАД" видна вверху слева
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Кнопка полноэкранного режима справа
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  При нажатии "НАЗАД" возврат на главную
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Дизайн соответствует общему стилю
                </li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h3 className="font-bold text-white mb-3 flex items-center">
                <span className="mr-2">✅</span>
                Статус:
              </h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Страница загружена
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Кнопки отображаются
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Функционал работает
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Дизайн обновлен
                </li>
              </ul>
            </div>
          </div>

          {/* Test Button */}
          <div className="text-center mt-6">
            <button
              onClick={handleBack}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔙 Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBackButton; 