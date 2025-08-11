import React, { useMemo, useState } from 'react';
import CafeTheme from './cafe/CafeTheme';
       import CafeHeader from './cafe/CafeHeader';
       import PremiumCafeMenu, { PremiumCoffeeItem } from './cafe/PremiumCafeMenu';
       import CafeCartBar from './cafe/CafeCartBar';
       import CafeLoyalty from './cafe/CafeLoyalty';
       import ItemDetailModal from './cafe/ItemDetailModal';
       import CoffeeIcons from './assets/images/coffee-icons';

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

  const handleItemClick = (item: PremiumCoffeeItem) => {
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
      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        cart={cart}
        onAdd={addItem}
        onRemove={removeItem}
        onToggleAddon={toggleAddon}
      />
    </CafeTheme>
  );
};

export default CoffeeDemo;


