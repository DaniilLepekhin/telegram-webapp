import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  triggerElement?: HTMLElement | null;
  clickPosition?: { x: number; y: number } | null;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      // Только блокируем прокрутку, без position:fixed — корректная работа ввода/вставки на iOS/Android
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Центрируем всегда через flex-оверлей

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
        padding: 'max(16px, env(safe-area-inset-left))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} 
      onClick={onClose}>
      <div 
        style={{
          background: 'linear-gradient(180deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.96) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          width: `${Math.min(560, Math.floor(window.innerWidth * 0.94))}px`,
          maxWidth: '94vw',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)'
        }} 
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', boxShadow: '0 6px 16px rgba(34,211,238,0.35)' }} />
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
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div style={{ maxHeight: 'calc(90vh - 72px)', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );

  // Рендерим модал прямо в body через портал
  return createPortal(modalContent, document.body);
};

export default SimpleModal;