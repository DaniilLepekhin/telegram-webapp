import { useCallback } from 'react';

export const usePaste = (onPaste?: (text: string) => void) => {
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    if (text && onPaste) {
      onPaste(text);
    } else if (text) {
      // Если нет кастомного обработчика, просто вставляем текст
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;
      const currentValue = target.value;
      const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);
      
      // Обновляем значение через событие
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(target, newValue);
        const event = new Event('input', { bubbles: true });
        target.dispatchEvent(event);
      }
      
      // Устанавливаем курсор после вставленного текста
      setTimeout(() => {
        target.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  }, [onPaste]);

  return { handlePaste };
};
