import React, { useState } from 'react';
import CoffeeIcons from '../../assets/images/coffee-icons';

export type PremiumCoffeeItem = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string | React.ReactNode;
  category: string;
  badges: string[];
  prepTime: string;
  addons: CoffeeAddon[];
  popular?: boolean;
  new?: boolean;
};

export type CoffeeAddon = { 
  id: string; 
  name: string; 
  price: number; 
  description?: string;
};

interface PremiumCafeMenuProps {
  items: PremiumCoffeeItem[];
  cart: Record<string, { qty: number; addons: Record<string, boolean> }>;
  onAdd: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onToggleAddon: (itemId: string, addonId: string) => void;
  onItemClick: (item: PremiumCoffeeItem, event: React.MouseEvent) => void;
}

const PremiumCafeMenu: React.FC<PremiumCafeMenuProps> = ({ 
  items, 
  cart, 
  onAdd, 
  onRemove, 
  onToggleAddon, 
  onItemClick 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['all', ...new Set(items.map(item => item.category))];
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Категории */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:shadow-lg hover:shadow-white/10'
            }`}
          >
            {category === 'all' ? '✨ Все' : 
             category === 'coffee' ? '☕️ Кофе' :
             category === 'tea' ? '🫖 Чай' :
             category === 'desserts' ? '🍰 Десерты' :
             category === 'snacks' ? '🥐 Закуски' : category}
          </button>
        ))}
      </div>

      {/* Меню */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className="group cursor-pointer"
            onClick={(e) => onItemClick(item, e)}
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-4 transition-all duration-500 hover:bg-white/20 hover:border-white/40 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-2 hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
              {/* Изображение */}
              <div className="relative mb-4">
                <div className="w-full h-48 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl overflow-hidden transition-all duration-500 group-hover:shadow-inner group-hover:shadow-purple-500/20">
                  <div className="w-full h-full bg-gradient-to-br from-amber-600/20 via-amber-700/15 to-amber-800/20 flex items-center justify-center transition-all duration-500 group-hover:from-amber-600/30 group-hover:via-amber-700/25 group-hover:to-amber-800/30">
                    {typeof item.image === 'string' ? (
                      <span className="text-6xl opacity-30 transition-all duration-500 group-hover:opacity-50 group-hover:scale-110">{item.image}</span>
                    ) : (
                      <div className="opacity-80 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110">{item.image}</div>
                    )}
                  </div>
                </div>
                
                {/* Бейджи */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.popular && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg animate-pulse">
                      🔥 Популярное
                    </div>
                  )}
                  {item.new && (
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg animate-bounce">
                      ✨ Новинка
                    </div>
                  )}
                </div>
                
                {/* Время приготовления */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full transition-all duration-300 hover:bg-black/70 hover:scale-105">
                  ⏱️ {item.prepTime}
                </div>
              </div>

              {/* Информация */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1 transition-all duration-300 group-hover:text-emerald-200">{item.name}</h3>
                  <p className="text-white/70 text-sm leading-relaxed transition-all duration-300 group-hover:text-white/80">{item.description}</p>
                </div>

                {/* Цена и кнопки */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-white transition-all duration-300 group-hover:text-emerald-200 group-hover:scale-105">
                    {item.basePrice} ₽
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                      }}
                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-white/20"
                    >
                      -
                    </button>
                    <span className="text-white font-semibold min-w-[2ch] text-center">
                      {cart[item.id]?.qty || 0}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdd(item.id);
                      }}
                      className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Дополнения */}
                {item.addons.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-white/60 text-xs mb-2">Дополнения:</p>
                    <div className="space-y-1">
                      {item.addons.map(addon => (
                        <label 
                          key={addon.id} 
                          className="flex items-center justify-between text-white/80 text-sm cursor-pointer transition-all duration-200 hover:text-white hover:scale-105"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={!!cart[item.id]?.addons?.[addon.id]} 
                              onChange={() => onToggleAddon(item.id, addon.id)}
                              className="w-4 h-4 text-emerald-600 bg-white/10 border-white/20 rounded focus:ring-emerald-500 focus:ring-2 transition-all duration-200 hover:scale-110"
                            />
                            <span>{addon.name}</span>
                          </div>
                          <span className="text-emerald-400 font-medium transition-all duration-200 hover:text-emerald-300 hover:scale-110">+{addon.price} ₽</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumCafeMenu;
