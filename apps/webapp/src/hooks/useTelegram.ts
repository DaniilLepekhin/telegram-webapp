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
  tg: TelegramWebApp | undefined;
  user: TelegramUser | null;
  initData: string;
  isReady: boolean;
  isExpanded: boolean;
  isFullscreen: boolean;
  isActive: boolean;
  colorScheme: 'dark' | 'light';
  safeAreaInset: { top: number; bottom: number; left: number; right: number };
  contentSafeAreaInset: { top: number; bottom: number; left: number; right: number };
  version: string;
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
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }> }) => void;
  showAlert: (message: string, callback?: () => void) => void;
  shareToStory: (mediaUrl: string, params?: { text?: string }) => void;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
  addToHomeScreen: () => void;
  hideKeyboard: () => void;
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

const ZERO_INSET = { top: 0, bottom: 0, left: 0, right: 0 };

export function useTelegram(): UseTelegramReturn {
  const [isReady, setIsReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [safeAreaInset, setSafeAreaInset] = useState(ZERO_INSET);
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState(ZERO_INSET);
  const hapticLastCall = useRef<number>(0);

  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  const user = (tg?.initDataUnsafe?.user as TelegramUser | undefined) ??
    (process.env.NODE_ENV === 'development' ? DEV_USER : null);
  const initData = tg?.initData ?? (process.env.NODE_ENV === 'development' ? 'dev_init_data' : '');
  const version = tg?.version ?? '0';

  useEffect(() => {
    if (!tg) {
      setIsReady(true);
      return;
    }

    setIsReady(true);
    setIsExpanded(tg.isExpanded);
    setIsFullscreen(tg.isFullscreen ?? false);
    setIsActive(tg.isActive ?? true);
    setSafeAreaInset(tg.safeAreaInset ?? ZERO_INSET);
    setContentSafeAreaInset(tg.contentSafeAreaInset ?? ZERO_INSET);

    const onViewportChange = () => setIsExpanded(tg.isExpanded);
    const onFullscreenChange = () => setIsFullscreen(tg.isFullscreen ?? false);
    const onActivated = () => setIsActive(true);
    const onDeactivated = () => setIsActive(false);
    const onSafeAreaChange = () => setSafeAreaInset({ ...tg.safeAreaInset });
    const onContentSafeAreaChange = () => setContentSafeAreaInset({ ...tg.contentSafeAreaInset });

    tg.onEvent('viewportChanged', onViewportChange);
    tg.onEvent('fullscreenChanged', onFullscreenChange);
    tg.onEvent('activated', onActivated);
    tg.onEvent('deactivated', onDeactivated);
    tg.onEvent('safeAreaChanged', onSafeAreaChange);
    tg.onEvent('contentSafeAreaChanged', onContentSafeAreaChange);

    return () => {
      tg.offEvent('viewportChanged', onViewportChange);
      tg.offEvent('fullscreenChanged', onFullscreenChange);
      tg.offEvent('activated', onActivated);
      tg.offEvent('deactivated', onDeactivated);
      tg.offEvent('safeAreaChanged', onSafeAreaChange);
      tg.offEvent('contentSafeAreaChanged', onContentSafeAreaChange);
    };
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
    tg.MainButton.setText(text);
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

  const shareToStory = useCallback((mediaUrl: string, params?: { text?: string }) => {
    tg?.shareToStory(mediaUrl, params);
  }, [tg]);

  const requestFullscreen = useCallback(() => {
    if (tg?.isVersionAtLeast('8.0')) tg.requestFullscreen();
  }, [tg]);

  const exitFullscreen = useCallback(() => {
    if (tg?.isVersionAtLeast('8.0')) tg.exitFullscreen();
  }, [tg]);

  const addToHomeScreen = useCallback(() => {
    if (tg?.isVersionAtLeast('8.0')) tg.addToHomeScreen();
  }, [tg]);

  const hideKeyboard = useCallback(() => {
    if (tg?.isVersionAtLeast('9.1')) tg.hideKeyboard();
  }, [tg]);

  return {
    tg,
    user,
    initData,
    isReady,
    isExpanded,
    isFullscreen,
    isActive,
    colorScheme: (tg?.colorScheme as 'dark' | 'light') ?? 'dark',
    safeAreaInset,
    contentSafeAreaInset,
    version,
    haptic: { impact: hapticImpact, notification: hapticNotification, selection: hapticSelection },
    mainButton: { show: mainButtonShow, hide: mainButtonHide, setLoading: mainButtonSetLoading },
    backButton: { show: backButtonShow, hide: backButtonHide },
    close: () => tg?.close(),
    openLink: (url, options) => tg?.openLink(url, options) ?? void window.open(url, '_blank'),
    openTelegramLink: (url) => tg?.openTelegramLink(url),
    showPopup: (params) => tg?.showPopup(params),
    showAlert: (msg, cb) => tg?.showAlert(msg, cb),
    shareToStory,
    requestFullscreen,
    exitFullscreen,
    addToHomeScreen,
    hideKeyboard,
  };
}
