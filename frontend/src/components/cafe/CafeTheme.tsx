import React, { useEffect } from 'react';

type TelegramThemeParams = {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
};

function applyTheme(params?: TelegramThemeParams) {
  const root = document.documentElement;
  const bg = params?.bg_color || '#0f172a';
  const card = params?.secondary_bg_color || 'rgba(255,255,255,0.06)';
  const text = params?.text_color || 'rgba(255,255,255,0.92)';
  const hint = params?.hint_color || 'rgba(255,255,255,0.6)';
  const accent = params?.button_color || '#10b981';
  const accentText = params?.button_text_color || '#ffffff';

  root.style.setProperty('--app-bg', bg);
  root.style.setProperty('--card-bg', card);
  root.style.setProperty('--text', text);
  root.style.setProperty('--text-dim', hint);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-text', accentText);
}

export const useTelegramTheme = () => {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    try {
      applyTheme(tg?.themeParams);
    } catch {}

    if (tg?.onEvent) {
      const handler = () => applyTheme(tg?.themeParams);
      tg.onEvent('themeChanged', handler);
      return () => tg.offEvent && tg.offEvent('themeChanged', handler);
    }
  }, []);
};

export const CafeTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useTelegramTheme();
  // Базовые CSS переменные на случай отсутствия Telegram контекста
  useEffect(() => {
    applyTheme();
  }, []);

  return (
    <div style={{
      background: 'var(--app-bg)',
      color: 'var(--text)'
    }}>
      {children}
    </div>
  );
};

export default CafeTheme;



