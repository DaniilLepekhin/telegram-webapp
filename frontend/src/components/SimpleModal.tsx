import React, { useEffect } from 'react';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      // Блокируем скролл везде
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      // Добавляем глобальные стили для модала
      const style = document.createElement('style');
      style.id = 'modal-overlay-styles';
      style.innerHTML = `
        .modal-overlay-global {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          min-width: 100vw !important;
          min-height: 100vh !important;
          max-width: none !important;
          max-height: none !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          outline: none !important;
          box-sizing: border-box !important;
          z-index: 999999 !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      
      // Удаляем глобальные стили
      const style = document.getElementById('modal-overlay-styles');
      if (style) {
        style.remove();
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      const style = document.getElementById('modal-overlay-styles');
      if (style) {
        style.remove();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay-global"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }} 
      onClick={onClose}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0
          }}>{title}</h2>
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
        <div style={{
          maxHeight: 'calc(80vh - 80px)',
          overflowY: 'auto'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;