// Telegram Mini Apps — Bot API 9.4 (February 9, 2026)
// WebApp API last changed: Bot API 9.1 (hideKeyboard) / 9.0 (DeviceStorage, SecureStorage)

interface SafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface ContentSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  // Bot API 7.0+
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
  // Bot API 7.6+
  section_separator_color?: string;
  // Bot API 7.10+
  bottom_bar_bg_color?: string;
}

interface WebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  // Bot API 8.0+
  photo_url?: string;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
}

interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
  receiver?: WebAppUser;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
  auth_date: number;
  hash: string;
}

interface BottomButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  setText(text: string): void;
  setParams(params: {
    text?: string;
    color?: string;
    text_color?: string;
    is_active?: boolean;
    is_visible?: boolean;
  }): void;
}

interface BackButton {
  isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

interface SettingsButton {
  isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
}

interface HapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): HapticFeedback;
  notificationOccurred(type: 'error' | 'success' | 'warning'): HapticFeedback;
  selectionChanged(): HapticFeedback;
}

// Bot API 6.9+
interface CloudStorage {
  setItem(key: string, value: string, callback?: (err: Error | null, stored: boolean) => void): CloudStorage;
  getItem(key: string, callback: (err: Error | null, value: string | null) => void): CloudStorage;
  getItems(keys: string[], callback: (err: Error | null, values: Record<string, string>) => void): CloudStorage;
  removeItem(key: string, callback?: (err: Error | null, removed: boolean) => void): CloudStorage;
  removeItems(keys: string[], callback?: (err: Error | null, removed: boolean) => void): CloudStorage;
  getKeys(callback: (err: Error | null, keys: string[]) => void): CloudStorage;
}

// Bot API 9.0+
interface DeviceStorage {
  setItem(key: string, value: string, callback?: (err: Error | null, stored: boolean) => void): DeviceStorage;
  getItem(key: string, callback: (err: Error | null, value: string | null) => void): DeviceStorage;
  getItems(keys: string[], callback: (err: Error | null, values: Record<string, string>) => void): DeviceStorage;
  removeItem(key: string, callback?: (err: Error | null, removed: boolean) => void): DeviceStorage;
  removeItems(keys: string[], callback?: (err: Error | null, removed: boolean) => void): DeviceStorage;
  getKeys(callback: (err: Error | null, keys: string[]) => void): DeviceStorage;
  clear(callback?: (err: Error | null, cleared: boolean) => void): DeviceStorage;
}

// Bot API 9.0+
interface SecureStorage {
  setItem(key: string, value: string, callback?: (err: Error | null, stored: boolean) => void): SecureStorage;
  getItem(key: string, callback: (err: Error | null, value: string | null) => void): SecureStorage;
  getItems(keys: string[], callback: (err: Error | null, values: Record<string, string>) => void): SecureStorage;
  restoreItem(key: string, callback: (err: Error | null, value: string | null) => void): SecureStorage;
  restoreItems(keys: string[], callback: (err: Error | null, values: Record<string, string>) => void): SecureStorage;
  removeItem(key: string, callback?: (err: Error | null, removed: boolean) => void): SecureStorage;
  removeItems(keys: string[], callback?: (err: Error | null, removed: boolean) => void): SecureStorage;
  getKeys(callback: (err: Error | null, keys: string[]) => void): SecureStorage;
  clear(callback?: (err: Error | null, cleared: boolean) => void): SecureStorage;
}

// Bot API 7.2+
interface BiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'finger' | 'face' | 'unknown';
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;
  init(callback?: () => void): BiometricManager;
  requestAccess(params: { reason?: string }, callback?: (granted: boolean) => void): BiometricManager;
  authenticate(params: { reason?: string }, callback?: (success: boolean, token?: string) => void): BiometricManager;
  updateBiometricToken(token: string, callback?: (updated: boolean) => void): BiometricManager;
  openSettings(): BiometricManager;
}

// Bot API 8.0+
interface Accelerometer {
  isStarted: boolean;
  x: number;
  y: number;
  z: number;
  start(params: { refresh_rate?: number }, callback?: (started: boolean) => void): Accelerometer;
  stop(callback?: (stopped: boolean) => void): Accelerometer;
}

interface DeviceOrientation {
  isStarted: boolean;
  absolute: boolean;
  alpha: number;
  beta: number;
  gamma: number;
  start(params: { refresh_rate?: number; need_absolute?: boolean }, callback?: (started: boolean) => void): DeviceOrientation;
  stop(callback?: (stopped: boolean) => void): DeviceOrientation;
}

interface Gyroscope {
  isStarted: boolean;
  x: number;
  y: number;
  z: number;
  start(params: { refresh_rate?: number }, callback?: (started: boolean) => void): Gyroscope;
  stop(callback?: (stopped: boolean) => void): Gyroscope;
}

interface LocationManager {
  isInited: boolean;
  isLocationAvailable: boolean;
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  init(callback?: () => void): LocationManager;
  getLocation(callback: (location: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    course: number | null;
    speed: number | null;
    horizontal_accuracy: number | null;
    vertical_accuracy: number | null;
    course_accuracy: number | null;
    speed_accuracy: number | null;
  } | null) => void): LocationManager;
  openSettings(): LocationManager;
}

interface TelegramWebApp {
  // Core
  initData: string;
  initDataUnsafe: WebAppInitData;
  version: string;
  platform: string;
  colorScheme: 'dark' | 'light';
  themeParams: ThemeParams;

  // State — Bot API 8.0+
  isActive: boolean;
  isExpanded: boolean;
  isFullscreen: boolean;
  isOrientationLocked: boolean;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;

  // Viewport
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  bottomBarColor: string;

  // Safe areas — Bot API 8.0+
  safeAreaInset: SafeAreaInset;
  contentSafeAreaInset: ContentSafeAreaInset;

  // UI elements
  BackButton: BackButton;
  /** @deprecated Use MainButton */
  MainButton: BottomButton;
  SecondaryButton: BottomButton;
  SettingsButton: SettingsButton;
  HapticFeedback: HapticFeedback;

  // Storage
  CloudStorage: CloudStorage;
  DeviceStorage: DeviceStorage;   // Bot API 9.0+
  SecureStorage: SecureStorage;   // Bot API 9.0+

  // Sensors — Bot API 8.0+
  Accelerometer: Accelerometer;
  DeviceOrientation: DeviceOrientation;
  Gyroscope: Gyroscope;
  LocationManager: LocationManager;
  BiometricManager: BiometricManager;

  // Methods — core
  ready(): void;
  expand(): void;
  close(): void;
  isVersionAtLeast(version: string): boolean;

  // Methods — appearance
  setHeaderColor(color: 'bg_color' | 'secondary_bg_color' | `#${string}`): void;
  setBackgroundColor(color: 'bg_color' | 'secondary_bg_color' | `#${string}`): void;
  setBottomBarColor(color: 'bg_color' | 'secondary_bg_color' | 'bottom_bar_bg_color' | `#${string}`): void;

  // Methods — fullscreen & orientation — Bot API 8.0+
  requestFullscreen(): void;
  exitFullscreen(): void;
  lockOrientation(): void;
  unlockOrientation(): void;

  // Methods — closing & swipes
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  enableVerticalSwipes(): void;
  disableVerticalSwipes(): void;

  // Methods — home screen — Bot API 8.0+
  addToHomeScreen(): void;
  checkHomeScreenStatus(callback?: (status: 'unsupported' | 'unknown' | 'added' | 'missed') => void): void;

  // Methods — keyboard — Bot API 9.1+
  hideKeyboard(): void;

  // Methods — popups
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }>;
  }, callback?: (id: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(params: { text?: string }, callback?: (text: string) => boolean): void;
  closeScanQrPopup(): void;

  // Methods — navigation
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void): void;

  // Methods — sharing — Bot API 7.8+
  shareToStory(media_url: string, params?: {
    text?: string;
    widget_link?: { url: string; name?: string };
  }): void;

  // Methods — sharing messages — Bot API 8.0+
  shareMessage(msg_id: string, callback?: (sent: boolean) => void): void;

  // Methods — emoji status — Bot API 8.0+
  setEmojiStatus(custom_emoji_id: string, params?: { duration?: number }, callback?: (set: boolean) => void): void;
  requestEmojiStatusAccess(callback?: (granted: boolean) => void): void;

  // Methods — file download — Bot API 8.0+
  downloadFile(params: { url: string; file_name: string }, callback?: (accepted: boolean) => void): void;

  // Methods — misc
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: Array<'users' | 'bots' | 'groups' | 'channels'>): void;
  readTextFromClipboard(callback?: (text: string | null) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (sent: boolean) => void): void;

  // Events
  onEvent(eventType: TelegramWebAppEvent, eventHandler: (...args: unknown[]) => void): void;
  offEvent(eventType: TelegramWebAppEvent, eventHandler: (...args: unknown[]) => void): void;
}

type TelegramWebAppEvent =
  | 'activated'
  | 'deactivated'
  | 'themeChanged'
  | 'viewportChanged'
  | 'safeAreaChanged'
  | 'contentSafeAreaChanged'
  | 'fullscreenChanged'
  | 'fullscreenFailed'
  | 'mainButtonClicked'
  | 'secondaryButtonClicked'
  | 'backButtonClicked'
  | 'settingsButtonClicked'
  | 'invoiceClosed'
  | 'popupClosed'
  | 'qrTextReceived'
  | 'scanQrPopupClosed'
  | 'clipboardTextReceived'
  | 'writeAccessRequested'
  | 'contactRequested'
  | 'homeScreenAdded'
  | 'homeScreenChecked'
  | 'emojiStatusSet'
  | 'emojiStatusFailed'
  | 'emojiStatusAccessRequested'
  | 'shareMessageSent'
  | 'shareMessageFailed'
  | 'fileDownloadRequested'
  | 'locationManagerUpdated'
  | 'locationRequested'
  | 'accelerometerStarted'
  | 'accelerometerStopped'
  | 'accelerometerChanged'
  | 'accelerometerFailed'
  | 'deviceOrientationStarted'
  | 'deviceOrientationStopped'
  | 'deviceOrientationChanged'
  | 'deviceOrientationFailed'
  | 'gyroscopeStarted'
  | 'gyroscopeStopped'
  | 'gyroscopeChanged'
  | 'gyroscopeFailed';

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
