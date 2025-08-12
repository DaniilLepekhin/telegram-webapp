import React, { useState } from 'react';
import { PremiumCoffeeItem, CoffeeAddon } from './PremiumCafeMenu';

interface ItemDetailModalProps {
  item: PremiumCoffeeItem | null;
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, { qty: number; addons: Record<string, boolean> }>;
  onAdd: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onToggleAddon: (itemId: string, addonId: string) => void;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  cart,
  onAdd,
  onRemove,
  onToggleAddon
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  if (!isOpen || !item) return null;

  const cartItem = cart[item.id];
  const currentQty = cartItem?.qty || 0;
  const selectedAddons = cartItem?.addons || {};

  const presets = [
    { id: 'classic', name: 'Классический', description: 'Без дополнений', addons: {} },
    { id: 'sweet', name: 'Сладкий', description: 'С сиропом', addons: { [item.addons[0]?.id]: true } },
    { id: 'premium', name: 'Премиум', description: 'Все дополнения', addons: Object.fromEntries(item.addons.map(a => [a.id, true])) }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setSelectedPreset(preset.id);
    // Применяем пресет к корзине
    Object.keys(selectedAddons).forEach(addonId => {
      onToggleAddon(item.id, addonId);
    });
    Object.entries(preset.addons).forEach(([addonId, enabled]) => {
      if (enabled && !selectedAddons[addonId]) {
        onToggleAddon(item.id, addonId);
      }
    });
  };

  const totalPrice = item.basePrice + 
    Object.entries(selectedAddons)
      .filter(([, enabled]) => enabled)
      .reduce((sum, [addonId]) => sum + (item.addons.find(a => a.id === addonId)?.price || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/20 rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Заголовок */}
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-amber-600/30 to-amber-800/30 flex items-center justify-center">
            <span className="text-8xl opacity-40">{item.image}</span>
          </div>
          
          {/* Бейджи */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {item.popular && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                🔥 Популярное
              </div>
            )}
            {item.new && (
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                ✨ Новинка
              </div>
            )}
          </div>
          
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 space-y-6">
          {/* Название и описание */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
            <p className="text-white/70 leading-relaxed">{item.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
              <span>⏱️ {item.prepTime}</span>
              <span>💰 {item.basePrice} ₽</span>
            </div>
          </div>

          {/* Быстрые пресеты */}
          <div>
            <h3 className="text-white font-semibold mb-3">Быстрые варианты</h3>
            <div className="grid grid-cols-1 gap-2">
              {presets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`p-3 rounded-xl text-left transition-all duration-200 ${
                    selectedPreset === preset.id
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/50'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="text-white font-medium">{preset.name}</div>
                  <div className="text-white/60 text-sm">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Дополнения */}
          {item.addons.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Дополнения</h3>
              <div className="space-y-3">
                {item.addons.map(addon => (
                  <label key={addon.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selectedAddons[addon.id]}
                        onChange={() => onToggleAddon(item.id, addon.id)}
                        className="w-4 h-4 text-emerald-600 bg-white/10 border-white/20 rounded focus:ring-emerald-500 focus:ring-2"
                      />
                      <div>
                        <div className="text-white font-medium">{addon.name}</div>
                        {addon.description && (
                          <div className="text-white/60 text-sm">{addon.description}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-emerald-400 font-medium">+{addon.price} ₽</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Количество и итоговая цена */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white font-semibold">Количество</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  -
                </button>
                <span className="text-white font-bold text-xl min-w-[3ch] text-center">
                  {currentQty}
                </span>
                <button
                  onClick={() => onAdd(item.id)}
                  className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg shadow-emerald-500/25"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-lg">
              <span className="text-white/70">Итого:</span>
              <span className="text-white font-bold text-2xl">{totalPrice} ₽</span>
            </div>
          </div>

          {/* Кнопка добавления в корзину */}
          <button
            onClick={() => {
              if (currentQty === 0) onAdd(item.id);
              onClose();
            }}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-bold text-lg rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            {currentQty === 0 ? 'Добавить в корзину' : 'Обновить корзину'}
          </button>
               </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;

