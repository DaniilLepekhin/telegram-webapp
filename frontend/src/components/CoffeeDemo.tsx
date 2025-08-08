import React, { useMemo, useState } from 'react';

type CoffeeAddon = { id: string; name: string; price: number };
type CoffeeItem = { id: string; name: string; basePrice: number; addons: CoffeeAddon[] };

const MENU: CoffeeItem[] = [
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero */}
      <div className="text-center pt-6 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-2xl shadow-xl mb-3">
          <span className="text-2xl">☕</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">Демо кофейни</h1>
        <p className="text-white/70">Меню • Корзина • Филиалы • Время • Бонусы</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MENU.map(item => (
            <div key={item.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{item.name}</h3>
                <span className="text-white/80">{item.basePrice} ₽</span>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <button onClick={() => removeItem(item.id)} className="px-3 py-1 bg-white/10 rounded text-white hover:bg-white/15">-</button>
                <span className="text-white min-w-[2ch] text-center">{cart[item.id]?.qty || 0}</span>
                <button onClick={() => addItem(item.id)} className="px-3 py-1 bg-white/10 rounded text-white hover:bg-white/15">+</button>
              </div>
              <div className="space-y-1">
                {item.addons.map(add => (
                  <label key={add.id} className="flex items-center justify-between text-white/85 text-sm">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={!!cart[item.id]?.addons?.[add.id]} onChange={() => toggleAddon(item.id, add.id)} />
                      <span>{add.name}</span>
                    </div>
                    <span className="text-white/70">+{add.price} ₽</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
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

        {/* Bonus */}
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">🎁 Бонусная программа</h3>
          <p className="text-white/70 text-sm mb-3">Покажите QR/код бариста для начисления или списания бонусов</p>
          <div className="bg-white rounded-lg p-3 text-center select-all text-slate-800">{qrValue}</div>
        </div>
      </div>

      {/* Sticky checkout */}
      <div className="sticky bottom-0 left-0 right-0 backdrop-blur-xl bg-slate-900/80 border-t border-white/10">
        <div className="max-w-4xl mx-auto p-3 flex items-center justify-between">
          <div className="text-white/80 text-sm">{branch} • {time}</div>
          <div className="flex items-center gap-3">
            <div className="text-white text-lg font-semibold">{total} ₽</div>
            <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold">
              Оформить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeDemo;


