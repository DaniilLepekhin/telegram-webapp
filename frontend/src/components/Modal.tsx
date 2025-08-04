import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Блокируем скролл body
      document.body.style.overflow = 'hidden';
      
      // Получаем полную высоту документа
      const fullHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        window.innerHeight
      );

      const fullWidth = Math.max(
        document.body.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.clientWidth,
        document.documentElement.scrollWidth,
        document.documentElement.offsetWidth,
        window.innerWidth
      );

      // Устанавливаем размеры overlay
      if (overlayRef.current) {
        overlayRef.current.style.width = `${fullWidth}px`;
        overlayRef.current.style.height = `${fullHeight}px`;
      }
    } else {
      // Разблокируем скролл
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute bg-black/70 backdrop-blur-sm"
        style={{
          top: 0,
          left: 0,
          position: 'fixed',
          zIndex: 9999
        }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div
        className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl border border-white/30 shadow-2xl mx-4 max-w-sm w-full max-h-[80vh] overflow-hidden"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-white/20">
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
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;