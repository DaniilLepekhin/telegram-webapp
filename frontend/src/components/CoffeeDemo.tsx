import React, { useMemo, useState } from 'react';
import CafeTheme from './cafe/CafeTheme';
       import CafeHeader from './cafe/CafeHeader';
       import PremiumCafeMenu, { PremiumCoffeeItem } from './cafe/PremiumCafeMenu';
       import CafeCartBar from './cafe/CafeCartBar';
       import CafeLoyalty from './cafe/CafeLoyalty';
       import SimpleModal from './SimpleModal';
       import CoffeeIcons from '../assets/images/coffee-icons';

       const MENU: PremiumCoffeeItem[] = [
         { 
           id: 'latte', 
           name: 'Латте', 
           description: 'Нежный кофе с молоком и пенкой. Идеальный баланс кофе и молока для мягкого вкуса.',
           basePrice: 220, 
           image: CoffeeIcons.latte,
           category: 'coffee',
           badges: ['Популярное'],
           prepTime: '3-5 мин',
           popular: true,
           addons: [
             { id: 'syrup_caramel', name: 'Сироп карамель', price: 30, description: 'Сладкий карамельный вкус' },
             { id: 'milk_almond', name: 'Миндальное молоко', price: 40, description: 'Безлактозная альтернатива' },
             { id: 'extra_shot', name: 'Доп. шот эспрессо', price: 50, description: 'Более крепкий вкус' },
           ]
         },
           { 
           id: 'americano', 
           name: 'Американо', 
           description: 'Классический эспрессо с горячей водой. Чистый вкус кофе без лишних добавок.',
           basePrice: 170, 
           image: CoffeeIcons.americano,
           category: 'coffee',
           badges: ['Классика'],
           prepTime: '2-3 мин',
           addons: [
             { id: 'extra_shot', name: 'Доп. шот эспрессо', price: 50, description: 'Усиленный вкус' },
             { id: 'syrup_vanilla', name: 'Сироп ваниль', price: 30, description: 'Нежный ванильный аромат' },
           ]
         },
           { 
           id: 'cappuccino', 
           name: 'Капучино', 
           description: 'Эспрессо с молоком и молочной пенкой в равных пропорциях. Итальянская классика.',
           basePrice: 210, 
           image: CoffeeIcons.cappuccino,
           category: 'coffee',
           badges: ['Классика'],
           prepTime: '4-6 мин',
           addons: [
             { id: 'syrup_vanilla', name: 'Сироп ваниль', price: 30, description: 'Классический ванильный вкус' },
             { id: 'cinnamon', name: 'Корица', price: 15, description: 'Теплый пряный аромат' },
           ]
         },
           { 
           id: 'green_tea', 
           name: 'Зеленый чай', 
           description: 'Свежий зеленый чай с нежным травяным вкусом. Отличная альтернатива кофе.',
           basePrice: 150, 
           image: CoffeeIcons.greenTea,
           category: 'tea',
           badges: ['Здоровье'],
           prepTime: '3-4 мин',
           new: true,
           addons: [
             { id: 'honey', name: 'Мед', price: 25, description: 'Натуральная сладость' },
             { id: 'lemon', name: 'Лимон', price: 20, description: 'Освежающий цитрусовый вкус' },
           ]
         },
           { 
           id: 'tiramisu', 
           name: 'Тирамису', 
           description: 'Классический итальянский десерт с кофе, маскарпоне и какао. Нежный и воздушный.',
           basePrice: 280, 
           image: CoffeeIcons.tiramisu,
           category: 'desserts',
           badges: ['Популярное', 'Новинка'],
           prepTime: 'Готово',
           popular: true,
           new: true,
           addons: [
             { id: 'extra_coffee', name: 'Доп. кофе', price: 20, description: 'Более насыщенный вкус' },
           ]
         },
           { 
           id: 'croissant', 
           name: 'Круассан', 
           description: 'Слоеный французский круассан с хрустящей корочкой. Идеально к кофе.',
           basePrice: 120, 
           image: CoffeeIcons.croissant,
           category: 'snacks',
           badges: ['Классика'],
           prepTime: 'Готово',
           addons: [
             { id: 'chocolate', name: 'Шоколад', price: 30, description: 'Шоколадная начинка' },
             { id: 'jam', name: 'Джем', price: 25, description: 'Фруктовый джем' },
           ]
         },
];

const BRANCHES = ['Центр', 'Юг', 'Север', 'Запад'];

function getRoundedToQuarter(date = new Date()) {
  const d = new Date(date);
  const q = 15; // minutes
  const minutes = d.getMinutes();
  const rounded = Math.ceil(minutes / q) * q;
  d.setMinutes(rounded === 60 ? 0 : rounded);
  if (rounded === 60) d.setHours(d.getHours() + 1);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function buildTimeSlots(count = 8, stepMin = 15) {
  const start = getRoundedToQuarter();
  const slots: string[] = ['Ближайшее'];
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getTime() + i * stepMin * 60 * 1000);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

const CoffeeDemo: React.FC = () => {
  const [cart, setCart] = useState<Record<string, { qty: number; addons: Record<string, boolean> }>>({});
  const [branch, setBranch] = useState<string>('Центр');
  const [time, setTime] = useState<string>('Ближайшее');
  const [userId] = useState<string>(() => Math.random().toString(36).slice(2));
  const [selectedItem, setSelectedItem] = useState<PremiumCoffeeItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const timeSlots = useMemo(() => buildTimeSlots(), []);

  const total = useMemo(() => {
    let sum = 0;
    for (const item of MENU) {
      const entry = cart[item.id];
      if (!entry) continue;
      const addonsSum = Object.entries(entry.addons || {})
        .filter(([, v]) => v)
        .reduce((acc, [addonId]) => acc + (item.addons.find(a => a.id === addonId)?.price || 0), 0);
      sum += entry.qty * (item.basePrice + addonsSum);
    }
    return sum;
  }, [cart]);

  const toggleAddon = (itemId: string, addonId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: {
        qty: prev[itemId]?.qty || 1,
        addons: { ...(prev[itemId]?.addons || {}), [addonId]: !(prev[itemId]?.addons || {})[addonId] }
      }
    }));
  };

  const addItem = (itemId: string) => {
    setCart(prev => ({ ...prev, [itemId]: { qty: (prev[itemId]?.qty || 0) + 1, addons: prev[itemId]?.addons || {} } }));
  };
  
  const removeItem = (itemId: string) => {
    setCart(prev => {
      const qty = (prev[itemId]?.qty || 0) - 1;
      if (qty <= 0) { const copy = { ...prev }; delete copy[itemId]; return copy; }
      return { ...prev, [itemId]: { qty, addons: prev[itemId]?.addons || {} } };
    });
  };

  const [clickPos, setClickPos] = useState<{x: number; y: number} | null>(null);
  
  const handleItemClick = (item: PremiumCoffeeItem, event: React.MouseEvent) => {
    setClickPos({x: event.clientX, y: event.clientY});
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const qrValue = `COFFEE:${userId}`;

  return (
    <CafeTheme>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <CafeHeader title="Демо кофейни" subtitle="Меню • Корзина • Филиалы • Время • Бонусы" />

        <div className="max-w-6xl mx-auto p-4 space-y-6">
          <PremiumCafeMenu
            items={MENU}
            cart={cart}
            onAdd={addItem}
            onRemove={removeItem}
            onToggleAddon={toggleAddon}
            onItemClick={handleItemClick}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
              <label className="text-white/80 text-sm">Филиал</label>
              <select value={branch} onChange={e => setBranch(e.target.value)} className="mt-2 w-full bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20">
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 md:col-span-2">
              <label className="text-white/80 text-sm">Время</label>
              <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {timeSlots.map(t => (
                  <button key={t} onClick={() => setTime(t)} className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap border ${time === t ? 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50' : 'bg-white/5 text-white/80 border-white/15 hover:bg-white/10'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <CafeLoyalty code={qrValue} />
        </div>

        <CafeCartBar branch={branch} time={time} total={total} onCheckout={() => {}} />
      </div>

      {/* Модальное окно деталей блюда */}
      <SimpleModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedItem?.name || 'Детали блюда'}
        clickPosition={clickPos}
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Изображение и бейджи */}
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-amber-600/30 to-amber-800/30 rounded-2xl flex items-center justify-center">
                {typeof selectedItem.image === 'string' ? (
                  <span className="text-8xl opacity-40">{selectedItem.image}</span>
                ) : (
                  <div className="opacity-80 scale-150">{selectedItem.image}</div>
                )}
              </div>
              
              {/* Бейджи */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {selectedItem.popular && (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                    🔥 Популярное
                  </div>
                )}
                {selectedItem.new && (
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                    ✨ Новинка
                  </div>
                )}
              </div>
            </div>

            {/* Название и описание */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h2>
              <p className="text-white/70 leading-relaxed">{selectedItem.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                <span>⏱️ {selectedItem.prepTime}</span>
                <span>💰 {selectedItem.basePrice} ₽</span>
              </div>
            </div>

            {/* Быстрые пресеты */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Быстрые пресеты</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    // Классический - без дополнений
                    Object.keys(cart[selectedItem.id]?.addons || {}).forEach(addonId => {
                      if (cart[selectedItem.id]?.addons[addonId]) {
                        onToggleAddon(selectedItem.id, addonId);
                      }
                    });
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 text-white text-sm transition-all duration-200 hover:scale-105"
                >
                  <div className="text-lg mb-1">☕</div>
                  <div className="font-medium">Классический</div>
                  <div className="text-xs text-white/60">Без дополнений</div>
                </button>
                
                <button
                  onClick={() => {
                    // Сладкий - с первым дополнением
                    const firstAddon = selectedItem.addons[0];
                    if (firstAddon) {
                      if (!cart[selectedItem.id]?.addons[firstAddon.id]) {
                        onToggleAddon(selectedItem.id, firstAddon.id);
                      }
                    }
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 text-white text-sm transition-all duration-200 hover:scale-105"
                >
                  <div className="text-lg mb-1">🍯</div>
                  <div className="font-medium">Сладкий</div>
                  <div className="text-xs text-white/60">С сиропом</div>
                </button>
                
                <button
                  onClick={() => {
                    // Премиум - все дополнения
                    selectedItem.addons.forEach(addon => {
                      if (!cart[selectedItem.id]?.addons[addon.id]) {
                        onToggleAddon(selectedItem.id, addon.id);
                      }
                    });
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 text-white text-sm transition-all duration-200 hover:scale-105"
                >
                  <div className="text-lg mb-1">⭐</div>
                  <div className="font-medium">Премиум</div>
                  <div className="text-xs text-white/60">Все дополнения</div>
                </button>
              </div>
            </div>

            {/* Дополнения */}
            {selectedItem.addons.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Дополнения</h3>
                <div className="space-y-3">
                  {selectedItem.addons.map(addon => (
                    <label key={addon.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!cart[selectedItem.id]?.addons[addon.id]}
                          onChange={() => onToggleAddon(selectedItem.id, addon.id)}
                          className="w-5 h-5 text-emerald-600 bg-white/10 border-white/20 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <div>
                          <div className="text-white font-medium">{addon.name}</div>
                          <div className="text-white/60 text-sm">{addon.description}</div>
                        </div>
                      </div>
                      <div className="text-emerald-400 font-semibold">+{addon.price} ₽</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Управление количеством */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-white font-medium">Количество</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onRemove(selectedItem.id)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                >
                  -
                </button>
                <span className="text-white font-semibold text-lg min-w-[2ch] text-center">
                  {cart[selectedItem.id]?.qty || 0}
                </span>
                <button
                  onClick={() => onAdd(selectedItem.id)}
                  className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 shadow-lg shadow-emerald-500/25"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </SimpleModal>
    </CafeTheme>
  );
};

export default CoffeeDemo;


