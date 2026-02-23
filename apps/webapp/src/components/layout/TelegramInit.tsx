'use client';

import { useEffect } from 'react';

export function TelegramInit() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Inform Telegram the app is ready
    tg.ready();

    // Expand to full height
    tg.expand();

    // Apply Telegram theme colors to CSS variables
    const applyTheme = () => {
      const theme = tg.themeParams;
      const root = document.documentElement;
      if (theme.bg_color) root.style.setProperty('--tg-bg', theme.bg_color);
      if (theme.secondary_bg_color) root.style.setProperty('--tg-secondary-bg', theme.secondary_bg_color);
      if (theme.text_color) root.style.setProperty('--tg-text', theme.text_color);
      if (theme.hint_color) root.style.setProperty('--tg-hint', theme.hint_color);
      if (theme.link_color) root.style.setProperty('--tg-link', theme.link_color);
      if (theme.button_color) root.style.setProperty('--tg-button', theme.button_color);
      if (theme.button_text_color) root.style.setProperty('--tg-button-text', theme.button_text_color);
      if (theme.header_bg_color) root.style.setProperty('--tg-header-bg', theme.header_bg_color);
      if (theme.bottom_bar_bg_color) root.style.setProperty('--tg-bottom-bar-bg', theme.bottom_bar_bg_color);
      if (theme.accent_text_color) root.style.setProperty('--tg-accent', theme.accent_text_color);
      if (theme.destructive_text_color) root.style.setProperty('--tg-destructive', theme.destructive_text_color);
    };

    // Apply safe area insets to CSS variables (Bot API 8.0+)
    const applySafeArea = () => {
      const root = document.documentElement;
      const sa = tg.safeAreaInset;
      const csa = tg.contentSafeAreaInset;
      if (sa) {
        root.style.setProperty('--tg-safe-area-top', `${sa.top}px`);
        root.style.setProperty('--tg-safe-area-bottom', `${sa.bottom}px`);
        root.style.setProperty('--tg-safe-area-left', `${sa.left}px`);
        root.style.setProperty('--tg-safe-area-right', `${sa.right}px`);
      }
      if (csa) {
        root.style.setProperty('--tg-content-safe-area-top', `${csa.top}px`);
        root.style.setProperty('--tg-content-safe-area-bottom', `${csa.bottom}px`);
        root.style.setProperty('--tg-content-safe-area-left', `${csa.left}px`);
        root.style.setProperty('--tg-content-safe-area-right', `${csa.right}px`);
      }
    };

    applyTheme();
    applySafeArea();

    tg.onEvent('themeChanged', applyTheme);
    tg.onEvent('safeAreaChanged', applySafeArea);
    tg.onEvent('contentSafeAreaChanged', applySafeArea);

    // Lock orientation (Bot API 8.0+)
    if (tg.isVersionAtLeast('8.0') && tg.lockOrientation) {
      tg.lockOrientation();
    }

    // Request fullscreen (Bot API 8.0+)
    if (tg.isVersionAtLeast('8.0') && tg.requestFullscreen) {
      tg.requestFullscreen();
    }

    // Disable vertical swipes to prevent accidental closes during interaction
    if (tg.isVersionAtLeast('7.7')) {
      tg.disableVerticalSwipes();
    }

    return () => {
      tg.offEvent('themeChanged', applyTheme);
      tg.offEvent('safeAreaChanged', applySafeArea);
      tg.offEvent('contentSafeAreaChanged', applySafeArea);
    };
  }, []);

  return null;
}
