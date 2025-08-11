import React, { useEffect, useState, useRef } from 'react';
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      
      // Плавно блокируем скролл без резких изменений
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      
      // Всегда центрируем модальное окно по экрану, но с небольшим смещением в сторону клика
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Базовые размеры модального окна
      const modalHeight = 400;
      const modalWidth = 480;
      
      // Строго центрируем модальное окно по экрану
      let topValue = (viewportHeight - modalHeight) / 2;
      let leftValue = (viewportWidth - modalWidth) / 2 + 100;
      
      // Отладочная информация
      console.log('Modal positioning:', {
        viewportHeight,
        viewportWidth,
        modalHeight,
        modalWidth,
        topValue,
        leftValue,
        clickPosition
      });
      
      if (clickPosition) {
        // Смещаем горизонтально в сторону клика, но не сильно
        const clickOffset = Math.min(100, Math.max(-100, (clickPosition.x - viewportWidth / 2) * 0.3));
        leftValue += clickOffset;
      }
      
      // Проверяем, чтобы модальное окно не выходило за границы экрана
      if (topValue < 20) {
        topValue = 20;
      }
      if (topValue + modalHeight > viewportHeight - 20) {
        topValue = viewportHeight - modalHeight - 20;
      }
      
      if (leftValue < 20) {
        leftValue = 20;
      }
      if (leftValue + modalWidth > viewportWidth - 20) {
        leftValue = viewportWidth - modalWidth - 20;
      }
      
      setModalPosition({ 
        top: `${topValue}px`, 
        left: `${leftValue}px`, 
        transform: 'none' 
      });
      
      return () => {
        // Плавно восстанавливаем скролл
        document.body.style.overflow = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        
        // Удаляем добавленные стили
        const addedStyles = document.querySelectorAll('style[data-modal-animation]');
        addedStyles.forEach(style => style.remove());
      };
    }
  }, [isOpen, clickPosition, triggerElement]);

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
        height: '100vh',
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
          background: 'linear-gradient(180deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.96) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          width: '90vw',
          maxWidth: '480px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
          position: 'absolute',
          top: modalPosition.top,
          left: modalPosition.left,
          transform: modalPosition.transform,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 0,
          animation: 'modalFadeIn 0.3s ease-out forwards'
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
