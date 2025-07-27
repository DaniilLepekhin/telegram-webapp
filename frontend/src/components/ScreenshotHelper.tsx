import React, { useState } from 'react';

const ScreenshotHelper: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  const instructions = [
    {
      platform: 'iOS (iPhone/iPad)',
      steps: [
        '1. Нажмите кнопку "Домой" + "Блокировка экрана" одновременно',
        '2. Или проведите пальцем от левого верхнего угла вниз и нажмите "Скриншот"',
        '3. Скриншот сохранится в галерее'
      ]
    },
    {
      platform: 'Android',
      steps: [
        '1. Нажмите кнопки "Громкость вниз" + "Питание" одновременно',
        '2. Или проведите тремя пальцами по экрану сверху вниз',
        '3. Скриншот сохранится в галерее'
      ]
    },
    {
      platform: 'macOS',
      steps: [
        '1. Нажмите Cmd + Shift + 3 для скриншота всего экрана',
        '2. Или Cmd + Shift + 4 для выбора области',
        '3. Скриншот сохранится на рабочий стол'
      ]
    },
    {
      platform: 'Windows',
      steps: [
        '1. Нажмите PrtScn для скриншота всего экрана',
        '2. Или Win + Shift + S для выбора области',
        '3. Скриншот сохранится в буфер обмена'
      ]
    }
  ];

  return (
    <div className="mb-4 p-4 bg-purple-100 border border-purple-400 text-purple-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">📸 Помощь со скриншотом</h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
        >
          {showInstructions ? 'Скрыть' : 'Показать'}
        </button>
      </div>
      
      <p className="text-xs mb-2">
        Если копирование не работает, сделайте скриншот этой страницы и отправьте его в чат.
      </p>
      
      {showInstructions && (
        <div className="mt-2 space-y-2">
          {instructions.map((instruction, index) => (
            <div key={index} className="p-2 bg-white rounded text-xs">
              <strong>{instruction.platform}:</strong>
              <ul className="mt-1 ml-4 space-y-1">
                {instruction.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
        💡 <strong>Совет:</strong> После скриншота отправьте его в чат с ботом для анализа диагностики.
      </div>
    </div>
  );
};

export default ScreenshotHelper; 