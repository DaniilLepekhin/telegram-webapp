import React, { useMemo, useState } from 'react';

type Referral = { id: string; level: number; name: string };

const mockData: Referral[] = Array.from({ length: 28 }).map((_, i) => ({
  id: String(i + 1),
  level: (i % 5) + 1,
  name: `Пользователь ${i + 1}`
}));

const ReferralProgram: React.FC = () => {
  const [refCode] = useState<string>(() => Math.random().toString(36).slice(2));
  const byLevel = useMemo(() => {
    const map: Record<number, Referral[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (const r of mockData) map[r.level].push(r);
    return map;
  }, []);

  const appBase = 'https://app.daniillepekhin.com/track';
  const link = `${appBase}/ref?code=${refCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center pt-6 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-fuchsia-400 to-purple-600 rounded-2xl shadow-xl mb-3">
          <span className="text-2xl">🤝</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">Реферальная программа</h1>
        <p className="text-white/70">5 линий • ссылка приглашения • структура</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
          <p className="text-white/80 mb-2">Ваша реферальная ссылка</p>
          <div className="flex items-center gap-2">
            <input readOnly value={link} className="flex-1 bg-white/10 text-white rounded-lg px-3 py-2 border border-white/20" />
            <button onClick={() => navigator.clipboard.writeText(link)} className="px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/15">Копировать</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[1,2,3,4,5].map(lvl => (
            <div key={lvl} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-white/60 text-xs mb-1">Линия</div>
              <div className="text-white font-semibold text-lg mb-1">{lvl}</div>
              <div className="text-white/80 text-sm">{byLevel[lvl].length} чел.</div>
            </div>
          ))}
        </div>

        <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-2">Структура</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {mockData.map(u => (
              <div key={u.id} className="flex items-center justify-between text-white/80 text-sm">
                <span>{u.name}</span>
                <span className="text-white/50">Линия {u.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;


