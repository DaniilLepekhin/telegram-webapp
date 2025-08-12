import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  triggerElement?: HTMLElement | null;
  clickPosition?: { x: number; y: number } | null;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  triggerElement, 
  clickPosition 
}) => {
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
  const [isMeasuring, setIsMeasuring] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const computeAndSetPosition = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 16; // безопасный отступ от краев

    // СТРОГО МАТЕМАТИЧЕСКИЙ ЦЕНТР - никаких смещений!
    const targetX = viewportWidth / 2;
    const targetY = viewportHeight / 2;

    // Реальные размеры модалки
    const node = modalRef.current;
    let modalWidth = 480;
    let modalHeight = 400;
    if (node) {
      const rect = node.getBoundingClientRect();
      // Если модалка в offscreen-режиме — размеры уже валидны
      if (rect.width > 0) modalWidth = Math.ceil(rect.width);
      if (rect.height > 0) modalHeight = Math.ceil(rect.height);
    }

    // Вычисляем координаты так, чтобы модалка была по центру таргета и не выходила за края
    let leftValue = Math.round(targetX - modalWidth / 2);
    let topValue = Math.round(targetY - modalHeight / 2);

    leftValue = clamp(leftValue, margin, viewportWidth - modalWidth - margin);
    topValue = clamp(topValue, margin, viewportHeight - modalHeight - margin);

    const finalPosition = {
      top: `${topValue}px`,
      left: `${leftValue}px`,
      transform: 'none'
    };

    setModalPosition(finalPosition);

    // Диагностика
    try {
      console.log('[Modal] viewport', { viewportWidth, viewportHeight });
      console.log('[Modal] size', { modalWidth, modalHeight });
      console.log('[Modal] target (PURE CENTER)', { targetX, targetY });
      console.log('[Modal] final', finalPosition);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      
      // Плавно блокируем скролл без резких изменений
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      // Telegram WebApp: разворачиваем и активируем системные элементы
      const tg = (window as any).Telegram?.WebApp;
      try {
        tg?.expand?.();
        tg?.BackButton?.show?.();
        tg?.HapticFeedback?.impactOccurred?.('medium');
      } catch (_) {}

      // Инициализируем измерение после монтирования DOM-узла
      setIsMeasuring(true);
      requestAnimationFrame(() => {
        computeAndSetPosition();
        setIsMeasuring(false);
      });

      // Отслеживаем изменение размеров модалки (динамический контент)
      if (modalRef.current && 'ResizeObserver' in window) {
        resizeObserverRef.current = new ResizeObserver(() => computeAndSetPosition());
        resizeObserverRef.current.observe(modalRef.current);
      }

      // Реагируем на изменение вьюпорта
      const handleReposition = () => computeAndSetPosition();
      window.addEventListener('resize', handleReposition);
      window.addEventListener('orientationchange', handleReposition);
      tg?.onEvent?.('viewportChanged', handleReposition);
      
      return () => {
        // Плавно восстанавливаем скролл
        document.body.style.overflow = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        
        // Удаляем добавленные стили
        const addedStyles = document.querySelectorAll('style[data-modal-animation]');
        addedStyles.forEach(style => style.remove());

        // Telegram WebApp: скрываем BackButton и снимаем обработчики
        try {
          tg?.BackButton?.hide?.();
          tg?.offEvent?.('backButtonClicked', onClose);
          tg?.offEvent?.('viewportChanged', handleReposition);
        } catch (_) {}

        window.removeEventListener('resize', handleReposition);
        window.removeEventListener('orientationchange', handleReposition);
        if (resizeObserverRef.current && modalRef.current) {
          try { resizeObserverRef.current.unobserve(modalRef.current); } catch (_) {}
        }
      };
    }
  }, [isOpen, computeAndSetPosition]);

  // Отдельно подписываемся на backButtonClicked при открытии
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (isOpen && tg?.onEvent) {
      tg.onEvent('backButtonClicked', onClose);
      return () => {
        try { tg.offEvent('backButtonClicked', onClose); } catch (_) {}
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Добавляем CSS анимацию для плавного появления
  const style = document.createElement('style');
  style.setAttribute('data-modal-animation', 'true');
  style.textContent = `
    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 999999,
        padding: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }} 
      onClick={onClose}>
      <div 
        ref={modalRef}
        style={{
          background: 'linear-gradient(180deg, rgba(139,92,246,0.96) 0%, rgba(34,211,238,0.96) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          width: 'min(92vw, 520px)',
          maxHeight: 'min(84dvh, 80vh)',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          top: modalPosition.top,
          left: modalPosition.left,
          transform: modalPosition.transform,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 0,
          animation: 'modalFadeIn 0.3s ease-out forwards',
          // Во время измерения переносим за пределы экрана, сохраняя реальный размер
          visibility: isMeasuring ? 'hidden' : 'visible',
          ...(isMeasuring ? { top: '-10000px', left: '-10000px' } : {})
        }} 
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '6px', 
              background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', 
              boxShadow: '0 4px 12px rgba(34,211,238,0.35)' 
            }} />
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: 0 }}>{title}</h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div style={{ 
          overflowY: 'auto',
          maxHeight: 'calc(80vh - 60px)',
          padding: '16px'
        }}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SimpleModal;
