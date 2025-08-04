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
      
      // Фиксированные размеры модального окна
      const modalWidth = 350;
      const modalHeight = 500;
      
      // Позиционируем рядом с кнопкой (справа или снизу)
      let top = rect.bottom + 10; // 10px отступ от кнопки
      let left = rect.left;
      
      // Если не помещается снизу - показываем сверху
      if (top + modalHeight > viewportHeight - 20) {
        top = rect.top - modalHeight - 10;
      }
      
      // Если не помещается справа - выравниваем по левому краю
      if (left + modalWidth > viewportWidth - 20) {
        left = viewportWidth - modalWidth - 20;
      }
      
      // Минимальные отступы от краев
      if (top < 20) top = 20;
      if (left < 20) left = 20;
      
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
    <>
      {/* Overlay - покрывает ВСЮ площадь экрана */}
      <div 
        className="fixed bg-black/60 backdrop-blur-sm"
        style={{
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999
        }}
        onClick={handleOverlayClick}
      />
      
      {/* Modal */}
      <div 
        className="fixed bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-white/30 shadow-2xl overflow-hidden"
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
        <>
          <div 
            className="fixed bg-black/80 backdrop-blur-sm"
            style={{
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 10001
            }}
            onClick={handleCancelClose} 
          />
          <div className="fixed inset-0 z-[10002] flex items-center justify-center">
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
        </>
      )}
    </>
  );
};

export default PositionedModal; 