import React, { useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  triggerElement?: HTMLElement | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, triggerElement }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  useEffect(() => {
    if (isOpen) {
      // Блокируем скролл body
      document.body.style.overflow = 'hidden';
      
      // Устанавливаем затемнение на весь экран
      if (overlayRef.current) {
        overlayRef.current.style.position = 'fixed';
        overlayRef.current.style.top = '0';
        overlayRef.current.style.left = '0';
        overlayRef.current.style.width = '100vw';
        overlayRef.current.style.height = '100vh';
      }

      // Позиционируем модал рядом с кнопкой
      if (triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Размеры модального окна (примерные)
        const modalWidth = 384; // max-w-sm = 384px
        const modalHeight = Math.min(600, viewportHeight * 0.8);
        
        // Позиционируем снизу от кнопки
        let top = rect.bottom + 10;
        let left = rect.left;
        
        // Если не помещается снизу - показываем сверху
        if (top + modalHeight > viewportHeight - 20) {
          top = rect.top - modalHeight - 10;
        }
        
        // Если не помещается справа - центрируем относительно кнопки
        if (left + modalWidth > viewportWidth - 20) {
          left = Math.max(20, rect.left + rect.width/2 - modalWidth/2);
        }
        
        // Если все еще не помещается - выравниваем по краю
        if (left + modalWidth > viewportWidth - 20) {
          left = viewportWidth - modalWidth - 20;
        }
        
        // Минимальные отступы
        if (top < 20) top = 20;
        if (left < 20) left = 20;
        
        setPosition({
          top: `${top}px`,
          left: `${left}px`,
          transform: 'none'
        });
      } else {
        // Если нет triggerElement - центрируем
        setPosition({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        });
      }
    } else {
      // Разблокируем скролл
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, triggerElement]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="bg-black/70 backdrop-blur-sm"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className="absolute bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl border border-white/30 shadow-2xl w-96 max-h-[80vh] overflow-hidden"
        style={{ 
          zIndex: 10000,
          top: position.top,
          left: position.left,
          transform: position.transform
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: title ? 'calc(80vh - 80px)' : '80vh' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;