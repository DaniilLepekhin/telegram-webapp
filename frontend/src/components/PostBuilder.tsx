import React from 'react';
import BackButton from './BackButton';
import FullscreenButton from './FullscreenButton';

const PostBuilder: React.FC = () => {
  console.log('🛠️ PostBuilder компонент инициализируется');
  
  console.log('🛠️ PostBuilder рендерится');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Кнопка "Назад" */}
      <BackButton onClick={() => console.log('Назад из PostBuilder')} />

      {/* Кнопка полноэкранного режима */}
      <FullscreenButton />

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl mb-4 shadow-2xl">
            <span className="text-2xl sm:text-3xl">📝</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl">
            Конструктор постов
          </h1>
          <p className="text-lg sm:text-xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
            Создавайте красивые посты с кнопками для Telegram каналов
          </p>
        </div>

        {/* Простой контент для тестирования */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Тестовая страница</h2>
          <p className="text-white/70 mb-4">
            Если вы видите этот текст, значит PostBuilder работает!
          </p>
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-sm">
              ✅ PostBuilder успешно загружен и отображается
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostBuilder; 