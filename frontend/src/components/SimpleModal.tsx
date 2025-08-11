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
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      
      // Умное позиционирование модального окна
      setTimeout(() => {
        if (modalRef.current) {
          const modal = modalRef.current;
          const modalRect = modal.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          
          let top = '50%';
          let left = '50%';
          let transform = 'translate(-50%, -50%)';
          
          // Если есть позиция клика, используем её
          if (clickPosition) {
            const modalHeight = modalRect.height;
            const modalWidth = modalRect.width;
            
            // Вычисляем позицию, чтобы модалка была видна
            let topValue = clickPosition.y;
            let leftValue = clickPosition.x;
            
            // Проверяем, не выходит ли модалка за границы экрана
            if (topValue + modalHeight > viewportHeight - 20) {
              topValue = viewportHeight - modalHeight - 20;
            }
            if (topValue < 20) {
              topValue = 20;
            }
            
            if (leftValue + modalWidth > viewportWidth - 20) {
              leftValue = viewportWidth - modalWidth - 20;
            }
            if (leftValue < 20) {
              leftValue = 20;
            }
            
            top = `${topValue}px`;
            left = `${leftValue}px`;
            transform = 'none';
          }
          // Если есть элемент-триггер, позиционируем относительно него
          else if (triggerElement) {
            const triggerRect = triggerElement.getBoundingClientRect();
            const modalHeight = modalRect.height;
            const modalWidth = modalRect.width;
            
            let topValue = triggerRect.bottom + 10;
            let leftValue = triggerRect.left + (triggerRect.width / 2) - (modalWidth / 2);
            
            // Проверяем границы экрана
            if (topValue + modalHeight > viewportHeight - 20) {
              topValue = triggerRect.top - modalHeight - 10;
            }
            if (topValue < 20) {
              topValue = 20;
            }
            
            if (leftValue < 20) {
              leftValue = 20;
            }
            if (leftValue + modalWidth > viewportWidth - 20) {
              leftValue = viewportWidth - modalWidth - 20;
            }
            
            top = `${topValue}px`;
            left = `${leftValue}px`;
            transform = 'none';
          }
          
          setModalPosition({ top, left, transform });
        }
      }, 10);
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, clickPosition, triggerElement]);

  if (!isOpen) return null;

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
        padding: '16px',
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
          width: '100%',
          maxWidth: '560px',
          maxHeight: 'calc(100vh - 32px)',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
          position: 'absolute',
          top: modalPosition.top,
          left: modalPosition.left,
          transform: modalPosition.transform,
          transition: 'all 0.3s ease-out'
        }} 
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', 
              boxShadow: '0 6px 16px rgba(34,211,238,0.35)' 
            }} />
            <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: 0 }}>{title}</h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
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
          maxHeight: 'calc(100vh - 120px)',
          padding: '20px'
        }}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SimpleModal;
