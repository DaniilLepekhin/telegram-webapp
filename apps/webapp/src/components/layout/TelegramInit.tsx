'use client';

import { useEffect } from 'react';

export function TelegramInit() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Expand to full height
    tg.expand();
    tg.ready();

    // Enable closing confirmation for forms
    // tg.enableClosingConfirmation();

    // Apply Telegram theme colors to CSS
    const theme = tg.themeParams;
    if (theme.bg_color) {
      document.documentElement.style.setProperty('--tg-bg', theme.bg_color);
    }

    // Lock orientation on mobile
    if (tg.lockOrientation) tg.lockOrientation();

    // Request fullscreen if available (Telegram 8.0+)
    if (tg.requestFullscreen) {
      tg.requestFullscreen();
    }
  }, []);

  return null;
}
