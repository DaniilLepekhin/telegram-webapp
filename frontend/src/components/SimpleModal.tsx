import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  triggerElement?: HTMLElement | null;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, children, title, triggerElement }) => {
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      
      // Блокируем скролл и фиксируем позицию
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      document.body.style.width = '100%';
      
      return () => {
        // Восстанавливаем скролл
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Вычисляем позицию модала
  let modalPosition = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  let modalTop = 'auto';
  let modalLeft = 'auto';

  if (triggerElement) {
    const rect = triggerElement.getBoundingClientRect();
    const modalWidth = 400;
    const modalHeight = Math.min(500, window.innerHeight * 0.8);
    
    // Позиционируем снизу от кнопки
    let top = rect.bottom + 10;
    let left = rect.left;
    
    // Если не помещается снизу - показываем сверху
    if (top + modalHeight > window.innerHeight - 20) {
      top = rect.top - modalHeight - 10;
    }
    
    // Если не помещается справа - центрируем относительно кнопки
    if (left + modalWidth > window.innerWidth - 20) {
      left = Math.max(20, rect.left + rect.width/2 - modalWidth/2);
    }
    
    // Если все еще не помещается - выравниваем по краю
    if (left + modalWidth > window.innerWidth - 20) {
      left = window.innerWidth - modalWidth - 20;
    }
    
    // Минимальные отступы
    if (top < 20) top = 20;
    if (left < 20) left = 20;
    
    modalPosition = {
      display: 'block',
      alignItems: 'unset',
      justifyContent: 'unset'
    };
    modalTop = `${top}px`;
    modalLeft = `${left}px`;
  }

  // Получаем реальную высоту документа
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );

  const modalContent = (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: `${documentHeight}px`,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 999999,
        padding: '20px',
        ...modalPosition
      }} 
      onClick={onClose}>
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          width: triggerElement ? '400px' : '100%',
          maxWidth: triggerElement ? '400px' : '400px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: triggerElement ? 'absolute' : 'relative',
          top: modalTop,
          left: modalLeft
        }} 
        onClick={(e) => e.stopPropagation()}>
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

  // Рендерим модал прямо в body через портал
  return createPortal(modalContent, document.body);
};

export default SimpleModal;