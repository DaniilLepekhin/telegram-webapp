import React, { useEffect, useState } from 'react';

interface PositionedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  triggerRef?: React.RefObject<HTMLElement>;
}

const PositionedModal: React.FC<PositionedModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  triggerRef 
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [modalSize, setModalSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Примерный размер модального окна
      const modalWidth = Math.min(400, viewportWidth - 40);
      const modalHeight = Math.min(600, viewportHeight - 40);
      
      // Вычисляем позицию
      let top = rect.bottom + 10; // 10px отступ от кнопки
      let left = rect.left;
      
      // Если модальное окно выходит за правый край экрана
      if (left + modalWidth > viewportWidth - 20) {
        left = viewportWidth - modalWidth - 20;
      }
      
      // Если модальное окно выходит за нижний край экрана
      if (top + modalHeight > viewportHeight - 20) {
        top = rect.top - modalHeight - 10; // Показываем сверху от кнопки
      }
      
      // Если модальное окно выходит за левый край экрана
      if (left < 20) {
        left = 20;
      }
      
      // Если модальное окно выходит за верхний край экрана
      if (top < 20) {
        top = 20;
      }
      
      setPosition({ top, left });
      setModalSize({ width: modalWidth, height: modalHeight });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="absolute bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-white/30 shadow-2xl overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          width: modalSize.width,
          maxHeight: modalSize.height,
          zIndex: 10000
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PositionedModal; 