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
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Адаптивные размеры
      const modalWidth = Math.min(350, viewportWidth - 20);
      const modalHeight = Math.min(500, viewportHeight - 20);
      
      // Центрируем относительно кнопки
      let top = rect.top + (rect.height / 2) - (modalHeight / 2);
      let left = rect.left + (rect.width / 2) - (modalWidth / 2);
      
      // Корректируем если выходит за границы
      if (top < 10) top = 10;
      if (top + modalHeight > viewportHeight - 10) top = viewportHeight - modalHeight - 10;
      if (left < 10) left = 10;
      if (left + modalWidth > viewportWidth - 10) left = viewportWidth - modalWidth - 10;
      
      setPosition({ top, left });
    }
  }, [isOpen, triggerRef]);

  const handleOverlayClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleOverlayClick}
      />
      
      {/* Modal */}
      <div 
        className="absolute bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-white/30 shadow-2xl overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          width: '350px',
          maxHeight: '500px',
          zIndex: 10000
        }}
      >
        {children}
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center">
          <div className="bg-black/80 backdrop-blur-sm absolute inset-0" onClick={handleCancelClose} />
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-white/30 p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Закрыть окно?</h3>
            <p className="text-white/60 mb-6">Несохраненные изменения будут потеряны</p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelClose}
                className="flex-1 bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmClose}
                className="flex-1 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionedModal; 