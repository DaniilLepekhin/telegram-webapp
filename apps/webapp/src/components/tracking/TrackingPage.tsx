'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Link2, Copy, ExternalLink, QrCode, BarChart3, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';

type View = 'list' | 'create' | 'analytics';

export function TrackingPage() {
  const [view, setView] = useState<View>('list');
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { haptic } = useTelegram();
  const qc = useQueryClient();

  const { data: linksData, isLoading } = useQuery({
    queryKey: ['tracking-links'],
    queryFn: async () => { const r = await api.getMyLinks(); return r.data as any[]; },
    enabled: isAuthenticated,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['link-analytics', selectedLinkId],
    queryFn: async () => { const r = await api.getLinkAnalytics(selectedLinkId!); return r.data as any; },
    enabled: !!selectedLinkId && view === 'analytics',
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createLink(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking-links'] });
      setView('list');
      haptic.notification('success');
      toast.success('✅ Ссылка создана!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCopy = async (url: string, id: string) => {
    haptic.impact('light');
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Ссылка скопирована!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const links = linksData ?? [];

  return (
    <div className="min-h-screen bg-surface-0 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Трекинг-ссылки</h1>
            <p className="text-sm text-white/40 mt-0.5">{links.length} ссылок создано</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { haptic.impact('medium'); setView('create'); }}
            className="btn-glow px-4 py-2 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Создать
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── LIST ─── */}
          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card p-4 h-24 shimmer" />
                ))
              ) : links.length === 0 ? (
                <div className="glass-card p-8 text-center mt-4">
                  <Link2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">Нет ссылок</p>
                  <p className="text-white/30 text-xs mt-1">Создай первую трекинг-ссылку с UTM и A/B тестами</p>
                  <button onClick={() => setView('create')} className="btn-glow px-4 py-2 text-sm mt-4">
                    + Создать ссылку
                  </button>
                </div>
              ) : (
                links.map((link: any, i: number) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', link.isActive ? 'bg-emerald-400' : 'bg-white/20')} />
                          <p className="font-semibold text-white truncate text-sm">/{link.slug}</p>
                        </div>
                        <p className="text-white/40 text-xs mt-0.5 truncate">{link.targetUrl}</p>
                        {link.utmCampaign && (
                          <span className="badge mt-1">{link.utmCampaign}</span>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-cyan-400">{link.clickCount}</span>
                        <span className="text-xs text-white/30">кликов</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-emerald-400">{link.conversionCount}</span>
                        <span className="text-xs text-white/30">конв.</span>
                      </div>
                      {link.clickCount > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-amber-400">
                            {Math.round((link.conversionCount / link.clickCount) * 100)}%
                          </span>
                          <span className="text-xs text-white/30">CVR</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => handleCopy(`${window.location.origin}/t/${link.slug}`, link.id)}
                          className="w-8 h-8 rounded-xl glass flex items-center justify-center transition-colors hover:bg-white/10"
                        >
                          {copiedId === link.id
                            ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                            : <Copy className="w-3.5 h-3.5 text-white/50" />
                          }
                        </button>
                        <button
                          onClick={() => { setSelectedLinkId(link.id); setView('analytics'); }}
                          className="w-8 h-8 rounded-xl glass flex items-center justify-center transition-colors hover:bg-white/10"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-white/50" />
                        </button>
                        {link.qrCodeUrl && (
                          <button
                            onClick={() => window.open(link.qrCodeUrl, '_blank')}
                            className="w-8 h-8 rounded-xl glass flex items-center justify-center transition-colors hover:bg-white/10"
                          >
                            <QrCode className="w-3.5 h-3.5 text-white/50" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* ─── CREATE ─── */}
          {view === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-4">
              <CreateLinkForm
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setView('list')}
                isLoading={createMutation.isPending}
              />
            </motion.div>
          )}

          {/* ─── ANALYTICS ─── */}
          {view === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="px-4">
              <button onClick={() => setView('list')} className="flex items-center gap-2 text-white/50 text-sm mb-4 hover:text-white transition-colors">
                <X className="w-4 h-4" /> Закрыть аналитику
              </button>
              <LinkAnalyticsView data={analyticsData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Create Link Form ─────────────────────────────────────────────────────────
function CreateLinkForm({ onSubmit, onCancel, isLoading }: {
  onSubmit: (d: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    targetUrl: '', slug: '', title: '',
    utmSource: '', utmMedium: '', utmCampaign: '',
    maxClicks: '', expiresAt: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.targetUrl) return;
    onSubmit({
      targetUrl: form.targetUrl,
      slug: form.slug || undefined,
      title: form.title || undefined,
      utmSource: form.utmSource || undefined,
      utmMedium: form.utmMedium || undefined,
      utmCampaign: form.utmCampaign || undefined,
      maxClicks: form.maxClicks ? parseInt(form.maxClicks) : undefined,
      expiresAt: form.expiresAt || undefined,
    });
  };

  const fields = [
    { key: 'targetUrl', label: 'URL назначения *', placeholder: 'https://t.me/your_channel', type: 'url' },
    { key: 'slug', label: 'Slug (авто)', placeholder: 'my-campaign', type: 'text' },
    { key: 'title', label: 'Название', placeholder: 'Летняя кампания', type: 'text' },
    { key: 'utmSource', label: 'UTM Source', placeholder: 'telegram', type: 'text' },
    { key: 'utmMedium', label: 'UTM Medium', placeholder: 'bot', type: 'text' },
    { key: 'utmCampaign', label: 'UTM Campaign', placeholder: 'summer2025', type: 'text' },
    { key: 'maxClicks', label: 'Макс. кликов', placeholder: '1000', type: 'number' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-white">Новая ссылка</h2>
        <button type="button" onClick={onCancel} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      {fields.map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label className="text-xs text-white/40 mb-1 block">{label}</label>
          <input
            type={type}
            value={form[key]}
            onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:border-brand-500/50 focus:outline-none transition-colors"
          />
        </div>
      ))}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-2xl glass border border-white/10 text-white/60 text-sm">
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading || !form.targetUrl}
          className="flex-1 btn-glow py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳ Создаём...' : '+ Создать ссылку'}
        </button>
      </div>
    </form>
  );
}

// ─── Link Analytics View ──────────────────────────────────────────────────────
function LinkAnalyticsView({ data }: { data: any }) {
  if (!data) return <div className="glass-card p-8 text-center"><BarChart3 className="w-10 h-10 text-white/20 mx-auto mb-2" /><p className="text-white/40 text-sm">Загрузка...</p></div>;

  const { link, stats } = data;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="font-bold text-white">/{link.slug}</h3>
        <p className="text-white/40 text-xs mt-0.5 truncate">{link.targetUrl}</p>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Кликов', value: stats.totalClicks, color: 'text-cyan-400' },
            { label: 'Уникальных', value: stats.uniqueClicks, color: 'text-violet-400' },
            { label: 'Конверсий', value: stats.conversions, color: 'text-emerald-400' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className={cn('text-xl font-bold', m.color)}>{m.value}</div>
              <div className="text-[10px] text-white/30">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Countries */}
      {Object.keys(stats.byCountry).length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-white mb-3">🌍 По странам</h4>
          <div className="space-y-2">
            {Object.entries(stats.byCountry as Record<string, number>)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">{country}</span>
                  <span className="text-sm font-semibold text-white">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Devices */}
      {Object.keys(stats.byDevice).length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-white mb-3">📱 По устройствам</h4>
          <div className="space-y-2">
            {Object.entries(stats.byDevice as Record<string, number>)
              .sort(([, a], [, b]) => b - a)
              .map(([device, count]) => (
                <div key={device} className="flex items-center justify-between">
                  <span className="text-sm text-white/70 capitalize">{device}</span>
                  <span className="text-sm font-semibold text-white">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
