'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface UseTelegramReturn {
  user: TelegramUser | null;
  initData: string;
  isReady: boolean;
  isExpanded: boolean;
  colorScheme: 'dark' | 'light';
  haptic: {
    impact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  mainButton: {
    show: (text: string, onClick: () => void) => void;
    hide: () => void;
    setLoading: (loading: boolean) => void;
  };
  backButton: {
    show: (onClick: () => void) => void;
    hide: () => void;
  };
  close: () => void;
  openLink: (url: string) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ type: string; text?: string }> }) => void;
}

// Dev fallback user
const DEV_USER: TelegramUser = {
  id: 999999999,
  first_name: 'Demo',
  last_name: 'User',
  username: 'demo_user',
  language_code: 'ru',
  is_premium: true,
};

export function useTelegram(): UseTelegramReturn {
  const [isReady, setIsReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hapticLastCall = useRef<number>(0);

  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  const user = (tg?.initDataUnsafe?.user as TelegramUser) ?? (process.env.NODE_ENV === 'development' ? DEV_USER : null);
  const initData = tg?.initData ?? (process.env.NODE_ENV === 'development' ? 'dev_init_data' : '');

  useEffect(() => {
    if (!tg) { setIsReady(true); return; }
    setIsReady(true);
    setIsExpanded(tg.isExpanded);

    const onViewportChange = () => setIsExpanded(tg.isExpanded);
    tg.onEvent('viewportChanged', onViewportChange);
    return () => tg.offEvent('viewportChanged', onViewportChange);
  }, [tg]);

  // Throttled haptic (50ms)
  const hapticImpact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    const now = Date.now();
    if (now - hapticLastCall.current < 50) return;
    hapticLastCall.current = now;
    requestAnimationFrame(() => tg?.HapticFeedback?.impactOccurred(style));
  }, [tg]);

  const hapticNotification = useCallback((type: 'error' | 'success' | 'warning') => {
    const now = Date.now();
    if (now - hapticLastCall.current < 50) return;
    hapticLastCall.current = now;
    requestAnimationFrame(() => tg?.HapticFeedback?.notificationOccurred(type));
  }, [tg]);

  const hapticSelection = useCallback(() => {
    const now = Date.now();
    if (now - hapticLastCall.current < 50) return;
    hapticLastCall.current = now;
    requestAnimationFrame(() => tg?.HapticFeedback?.selectionChanged());
  }, [tg]);

  const mainButtonShow = useCallback((text: string, onClick: () => void) => {
    if (!tg) return;
    tg.MainButton.text = text;
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
  }, [tg]);

  const mainButtonHide = useCallback(() => {
    tg?.MainButton.hide();
  }, [tg]);

  const mainButtonSetLoading = useCallback((loading: boolean) => {
    if (!tg) return;
    if (loading) tg.MainButton.showProgress();
    else tg.MainButton.hideProgress();
  }, [tg]);

  const backButtonShow = useCallback((onClick: () => void) => {
    if (!tg) return;
    tg.BackButton.show();
    tg.BackButton.onClick(onClick);
  }, [tg]);

  const backButtonHide = useCallback(() => {
    tg?.BackButton.hide();
  }, [tg]);

  return {
    user,
    initData,
    isReady,
    isExpanded,
    colorScheme: (tg?.colorScheme as 'dark' | 'light') ?? 'dark',
    haptic: { impact: hapticImpact, notification: hapticNotification, selection: hapticSelection },
    mainButton: { show: mainButtonShow, hide: mainButtonHide, setLoading: mainButtonSetLoading },
    backButton: { show: backButtonShow, hide: backButtonHide },
    close: () => tg?.close(),
    openLink: (url) => tg?.openLink(url) ?? window.open(url, '_blank'),
    showPopup: (params) => tg?.showPopup(params),
  };
}
