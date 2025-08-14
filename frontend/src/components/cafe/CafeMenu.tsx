import React from 'react';

export type CoffeeAddon = { id: string; name: string; price: number };
export type CoffeeItem = { id: string; name: string; basePrice: number; addons: CoffeeAddon[] };

interface CafeMenuProps {
  items: CoffeeItem[];
  cart: Record<string, { qty: number; addons: Record<string, boolean> }>;
  onAdd: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onToggleAddon: (itemId: string, addonId: string) => void;
}

const CafeMenu: React.FC<CafeMenuProps> = ({ items, cart, onAdd, onRemove, onToggleAddon }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map(item => (
        <div key={item.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-semibold">{item.name}</h3>
            <span className="text-white/80">{item.basePrice} ₽</span>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <button onClick={() => onRemove(item.id)} className="px-3 py-1 bg-white/10 rounded text-white hover:bg-white/15">-</button>
            <span className="text-white min-w-[2ch] text-center">{cart[item.id]?.qty || 0}</span>
            <button onClick={() => onAdd(item.id)} className="px-3 py-1 bg-white/10 rounded text-white hover:bg-white/15">+</button>
          </div>
          <div className="space-y-1">
            {item.addons.map(add => (
              <label key={add.id} className="flex items-center justify-between text-white/85 text-sm">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" checked={!!cart[item.id]?.addons?.[add.id]} onChange={() => onToggleAddon(item.id, add.id)} />
                  <span>{add.name}</span>
                </div>
                <span className="text-white/70">+{add.price} ₽</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CafeMenu;




