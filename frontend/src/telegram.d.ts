declare global {
  interface Window {
    Telegram: {
      WebApp: {
        // Основные свойства
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: string;
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        
        // Основные методы
        ready(): void;
        expand(): void;
        close(): void;
        sendData(data: string): void;
        
        // Методы для кнопок
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText(text: string): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
          setParams(params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_visible?: boolean;
            is_active?: boolean;
            is_progress_visible?: boolean;
          }): void;
        };
        
        BackButton: {
          isVisible: boolean;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
        };
        
        SettingsButton: {
          isVisible: boolean;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
          show(): void;
          hide(): void;
        };
        
        // Методы для цветов и темы
        setHeaderColor(color: string): void;
        setBackgroundColor(color: string): void;
        enableClosingConfirmation(): void;
        disableClosingConfirmation(): void;
        
        // Методы для событий
        onEvent(eventType: string, callback: (eventData?: any) => void): void;
        offEvent(eventType: string, callback: (eventData?: any) => void): void;
        
        // Методы для всплывающих окон
        showPopup(params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (buttonId: string) => void): void;
        
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        
        // Методы для QR кода
        showScanQrPopup(params: {
          text?: string;
        }, callback?: (data: string) => void): void;
        
        // Методы для буфера обмена
        readTextFromClipboard(callback?: (data: string) => void): void;
        
        // Методы для контактов
        requestContact(callback?: (contact: any) => void): void;
        
        // Методы для инвойсов
        showInvoice(url: string, callback?: (status: string) => void): void;
        
        // Методы для кастомных методов
        invokeCustomMethod(method: string, params?: any, callback?: (result: any) => void): void;
        
        // Методы для уведомлений
        showNotification(message: string, callback?: () => void): void;
        
        // Методы для haptic feedback
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        
        // Методы для CloudStorage
        CloudStorage: {
          getItem(key: string, callback?: (value: string | null) => void): void;
          setItem(key: string, value: string, callback?: (error?: string) => void): void;
          removeItem(key: string, callback?: (error?: string) => void): void;
          getKeys(callback?: (keys: string[]) => void): void;
        };
        
        // Методы для BiometricManager
        BiometricManager: {
          isInited: boolean;
          isSupported: boolean;
          isAvailable: boolean;
          isAccessRequested: boolean;
          isAccessGranted: boolean;
          init(callback?: (error?: string) => void): void;
          authenticate(callback?: (error?: string) => void): void;
          requestAccess(callback?: (error?: string) => void): void;
        };
      };
    };
  }
}

export {}; 