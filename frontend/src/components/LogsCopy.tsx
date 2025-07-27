import React, { useState } from 'react';

interface LogsCopyProps {
  logs: string[];
}

const LogsCopy: React.FC<LogsCopyProps> = ({ logs }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      const logsText = logs.join('\n');
      await navigator.clipboard.writeText(logsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Ошибка копирования:', error);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = logs.join('\n');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white drop-shadow-md">
          📋 Логи консоли
        </h3>
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {copied ? '✅ Скопировано!' : '📋 Копировать'}
        </button>
      </div>
      
      <div className="bg-black/20 rounded-lg p-3 max-h-60 overflow-y-auto">
        {logs.length > 0 ? (
          <pre className="text-xs text-white/90 whitespace-pre-wrap">
            {logs.join('\n')}
          </pre>
        ) : (
          <p className="text-white/70 text-sm">
            Логи пока пусты. Откройте консоль браузера (F12) и попробуйте нажать кнопку "Назад".
          </p>
        )}
      </div>
      
      <div className="mt-3 text-xs text-white/60">
        💡 Нажмите "📋 Копировать" чтобы скопировать все логи и отправить мне для диагностики
      </div>
    </div>
  );
};

export default LogsCopy; 