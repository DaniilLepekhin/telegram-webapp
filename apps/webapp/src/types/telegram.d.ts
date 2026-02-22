interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    start_param?: string;
    auth_date: number;
    hash: string;
  };
  colorScheme: 'dark' | 'light';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    setText(text: string): void;
    setParams(params: Record<string, string>): void;
  };
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  CloudStorage: {
    setItem(key: string, value: string, callback?: (err: Error | null, stored: boolean) => void): void;
    getItem(key: string, callback: (err: Error | null, value: string) => void): void;
    removeItem(key: string, callback?: (err: Error | null, removed: boolean) => void): void;
    getKeys(callback: (err: Error | null, keys: string[]) => void): void;
  };
  onEvent(eventType: string, callback: () => void): void;
  offEvent(eventType: string, callback: () => void): void;
  sendData(data: string): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  showPopup(params: { title?: string; message: string; buttons?: Array<{ id?: string; type: string; text?: string }> }, callback?: (id: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(params: { text?: string }, callback?: (text: string) => boolean): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestWriteAccess(callback?: (access: boolean) => void): void;
  requestContact(callback?: (sent: boolean) => void): void;
  lockOrientation?(): void;
  unlockOrientation?(): void;
  requestFullscreen?(): void;
  exitFullscreen?(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  isVersionAtLeast(version: string): boolean;
  version: string;
  platform: string;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
