import React, { useMemo, useState } from 'react';
import CafeTheme from './cafe/CafeTheme';
import CafeHeader from './cafe/CafeHeader';
import CafeMenu, { CoffeeItem } from './cafe/CafeMenu';
import CafeCartBar from './cafe/CafeCartBar';
import CafeLoyalty from './cafe/CafeLoyalty';

type CoffeeAddon = { id: string; name: string; price: number };
type CoffeeItemLocal = { id: string; name: string; basePrice: number; addons: CoffeeAddon[] };

const MENU: CoffeeItemLocal[] = [
  { id: 'latte', name: 'Латте ☕️', basePrice: 220, addons: [
    { id: 'syrup_caramel', name: 'Сироп карамель', price: 30 },
    { id: 'milk_almond', name: 'Миндальное молоко', price: 40 },
  ]},
  { id: 'americano', name: 'Американо ☕️', basePrice: 170, addons: [
    { id: 'extra_shot', name: 'Доп. шот эспрессо', price: 50 },
  ]},
  { id: 'cappuccino', name: 'Капучино ☕️', basePrice: 210, addons: [
    { id: 'syrup_vanilla', name: 'Сироп ваниль', price: 30 },
  ]},
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

  const qrValue = `COFFEE:${userId}`;

  return (
    <CafeTheme>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <CafeHeader title="Демо кофейни" subtitle="Меню • Корзина • Филиалы • Время • Бонусы" />

        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <CafeMenu
            items={MENU as unknown as CoffeeItem[]}
            cart={cart}
            onAdd={addItem}
            onRemove={removeItem}
            onToggleAddon={toggleAddon}
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
    </CafeTheme>
  );
};

export default CoffeeDemo;


