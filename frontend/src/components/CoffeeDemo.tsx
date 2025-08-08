import React, { useMemo, useState } from 'react';

type CoffeeAddon = { id: string; name: string; price: number };
type CoffeeItem = { id: string; name: string; basePrice: number; addons: CoffeeAddon[] };

const MENU: CoffeeItem[] = [
  { id: 'latte', name: 'Латте', basePrice: 220, addons: [
    { id: 'syrup_caramel', name: 'Сироп карамель', price: 30 },
    { id: 'milk_almond', name: 'Миндальное молоко', price: 40 },
  ]},
  { id: 'americano', name: 'Американо', basePrice: 170, addons: [
    { id: 'extra_shot', name: 'Доп. шот', price: 50 },
  ]},
  { id: 'cappuccino', name: 'Капучино', basePrice: 210, addons: [
    { id: 'syrup_vanilla', name: 'Сироп ваниль', price: 30 },
  ]},
];

const BRANCHES = ['Центр', 'Юг', 'Север', 'Запад'];

const CoffeeDemo: React.FC = () => {
  const [cart, setCart] = useState<Record<string, { qty: number; addons: Record<string, boolean> }>>({});
  const [branch, setBranch] = useState<string>('Центр');
  const [time, setTime] = useState<string>('ASAP');
  const [userId] = useState<string>(() => Math.random().toString(36).slice(2));

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
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-white">☕ Демо кофейни</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MENU.map(item => (
          <div key={item.id} className="bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">{item.name}</h3>
              <span className="text-white/70">{item.basePrice} ₽</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <button onClick={() => removeItem(item.id)} className="px-3 py-1 bg-white/10 rounded text-white">-</button>
              <span className="text-white">{cart[item.id]?.qty || 0}</span>
              <button onClick={() => addItem(item.id)} className="px-3 py-1 bg-white/10 rounded text-white">+</button>
            </div>
            <div className="space-y-1">
              {item.addons.map(add => (
                <label key={add.id} className="flex items-center justify-between text-white/80 text-sm">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={!!cart[item.id]?.addons?.[add.id]} onChange={() => toggleAddon(item.id, add.id)} />
                    <span>{add.name}</span>
                  </div>
                  <span>+{add.price} ₽</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <label className="text-white/80">Филиал</label>
          <select value={branch} onChange={e => setBranch(e.target.value)} className="bg-white/10 text-white rounded px-3 py-1 border border-white/20">
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-white/80">Время</label>
          <input value={time} onChange={e => setTime(e.target.value)} placeholder="ASAP или 15:30" className="bg-white/10 text-white rounded px-3 py-1 border border-white/20" />
        </div>
        <div className="text-white">Итого: <b>{total} ₽</b></div>
        <button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg py-3">Заказать</button>
      </div>

      <div className="bg-white/10 border border-white/20 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">🎁 Бонусная программа</h3>
        <p className="text-white/70 text-sm mb-2">Покажите QR бариста для начисления/списания бонусов</p>
        <div className="bg-white rounded p-3 text-center select-all">{qrValue}</div>
      </div>
    </div>
  );
};

export default CoffeeDemo;


