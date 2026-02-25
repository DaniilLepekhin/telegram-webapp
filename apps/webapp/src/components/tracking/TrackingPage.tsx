'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Link2, Copy, QrCode, BarChart3,
  Trash2, X, Check, ArrowLeft, Globe, Smartphone, TrendingUp,
  MousePointerClick, Target, Zap,
} from 'lucide-react';
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { isFreshAuth, accessToken } = useAuthStore();
  const { haptic } = useTelegram();
  const qc = useQueryClient();

  // isFreshAuth: only true after setUser() fires this session — no 401 from stale token
  const enabled = isFreshAuth && !!accessToken;

  const { data: linksData, isLoading } = useQuery({
    queryKey: ['tracking-links'],
    queryFn: async () => { const r = await api.getMyLinks(); return r.data as TrackingLink[]; },
    enabled,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['link-analytics', selectedLinkId],
    queryFn: async () => { const id = selectedLinkId ?? ''; const r = await api.getLinkAnalytics(id); return r.data as LinkAnalytics; },
    enabled: enabled && !!selectedLinkId && view === 'analytics',
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createLink(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking-links'] });
      setView('list');
      haptic.notification('success');
      toast.success('Ссылка создана!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteLink(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking-links'] });
      haptic.notification('success');
      toast.success('Ссылка удалена');
      setDeletingId(null);
    },
    onError: (e: Error) => { toast.error(e.message); setDeletingId(null); },
  });

  const handleCopy = async (url: string, id: string) => {
    haptic.impact('light');
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success('Ссылка скопирована!');
      const t = setTimeout(() => setCopiedId(null), 2000);
      // Clear the timeout if the component unmounts to avoid state updates on unmounted component
      return () => clearTimeout(t);
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const handleDelete = (id: string) => {
    haptic.impact('heavy');
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const links = linksData ?? [];
  const selectedLink = links.find(l => l.id === selectedLinkId);

  return (
    <div className="min-h-screen bg-surface-0 relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-600/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            {view === 'analytics' ? (
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Все ссылки</span>
              </button>
            ) : null}
            <h1 className="text-xl font-bold text-white">
              {view === 'create' ? 'Новая ссылка' : view === 'analytics' ? `/${selectedLink?.slug ?? '…'}` : 'Трекинг-ссылки'}
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              {view === 'list'
                ? links.length > 0 ? `${links.length} ссыл${links.length === 1 ? 'ка' : links.length < 5 ? 'ки' : 'ок'} создано` : 'Нет активных ссылок'
                : view === 'analytics' ? 'Детальная аналитика'
                : 'UTM параметры + A/B'}
            </p>
          </div>
          {view === 'list' && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => { haptic.impact('medium'); setView('create'); }}
              className="btn-glow px-4 py-2 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Создать
            </motion.button>
          )}
          {view === 'create' && (
            <button type="button" onClick={() => setView('list')} className="text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── LIST ─── */}
          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 space-y-3">
              {isLoading ? (
                <>
                  <div className="glass-card p-4 h-24 shimmer" />
                  <div className="glass-card p-4 h-24 shimmer" />
                  <div className="glass-card p-4 h-24 shimmer" />
                </>
              ) : links.length === 0 ? (
                <EmptyLinksState onCreateClick={() => setView('create')} />
              ) : (
                links.map((link, i) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: deletingId === link.id ? 0 : 1, y: 0, scale: deletingId === link.id ? 0.95 : 1 }}
                    transition={{ delay: i * 0.06, duration: 0.2 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', link.isActive ? 'bg-emerald-400' : 'bg-white/20')} />
                          <p className="font-semibold text-white truncate text-sm">/{link.slug}</p>
                          {link.title && <span className="text-white/30 text-xs truncate">{link.title}</span>}
                        </div>
                        <p className="text-white/40 text-xs mt-0.5 truncate pl-4">{link.targetUrl}</p>
                        {link.utmCampaign && (
                          <span className="badge mt-1 ml-4">{link.utmCampaign}</span>
                        )}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-cyan-400">{link.clickCount}</span>
                        <span className="text-xs text-white/30">кл.</span>
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
                      <div className="flex items-center gap-1.5 ml-auto">
                        <ActionButton
                          onClick={() => handleCopy(`${typeof window !== 'undefined' ? window.location.origin : ''}/t/${link.slug}`, link.id)}
                          title="Копировать"
                        >
                          {copiedId === link.id
                            ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                            : <Copy className="w-3.5 h-3.5 text-white/50" />}
                        </ActionButton>
                        <ActionButton
                          onClick={() => { setSelectedLinkId(link.id); setView('analytics'); }}
                          title="Аналитика"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-white/50" />
                        </ActionButton>
                        {link.qrCodeUrl && (
                          <ActionButton onClick={() => window.open(link.qrCodeUrl, '_blank')} title="QR-код">
                            <QrCode className="w-3.5 h-3.5 text-white/50" />
                          </ActionButton>
                        )}
                        <ActionButton
                          onClick={() => handleDelete(link.id)}
                          title="Удалить"
                          className="hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-rose-400" />
                        </ActionButton>
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
              <LinkAnalyticsView data={analyticsData} isLoading={analyticsLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyLinksState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 text-center mt-4"
    >
      {/* Illustration */}
      <div className="relative w-20 h-20 mx-auto mb-5">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Link2 className="w-9 h-9 text-cyan-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center">
          <Plus className="w-3.5 h-3.5 text-brand-400" />
        </div>
      </div>

      <h3 className="text-white font-semibold text-base mb-1">Нет трекинг-ссылок</h3>
      <p className="text-white/40 text-sm mb-1">Создай ссылку с UTM-метками,</p>
      <p className="text-white/30 text-xs mb-5">отслеживай клики, устройства и конверсии</p>

      {/* Feature hints */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { icon: MousePointerClick, label: 'Клики', color: 'text-cyan-400' },
          { icon: Globe, label: 'Гео', color: 'text-emerald-400' },
          { icon: TrendingUp, label: 'CVR', color: 'text-amber-400' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="glass rounded-xl p-2.5 flex flex-col items-center gap-1">
            <Icon className={cn('w-4 h-4', color)} />
            <span className="text-[10px] text-white/40">{label}</span>
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onCreateClick}
        className="btn-glow px-6 py-2.5 text-sm w-full"
      >
        + Создать первую ссылку
      </motion.button>
    </motion.div>
  );
}

// ─── Action Button ─────────────────────────────────────────────────────────────
function ActionButton({ onClick, children, title, className }: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn('w-8 h-8 rounded-xl glass flex items-center justify-center transition-colors hover:bg-white/10', className)}
    >
      {children}
    </button>
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      maxClicks: form.maxClicks ? Number.parseInt(form.maxClicks, 10) : undefined,
      expiresAt: form.expiresAt || undefined,
    });
  };

  const baseFields = [
    { key: 'targetUrl', label: 'URL назначения *', placeholder: 'https://t.me/your_channel', type: 'url' },
    { key: 'title', label: 'Название (опционально)', placeholder: 'Летняя кампания', type: 'text' },
    { key: 'slug', label: 'Slug (авто если пусто)', placeholder: 'my-campaign', type: 'text' },
  ] as const;

  const advancedFields = [
    { key: 'utmSource', label: 'UTM Source', placeholder: 'telegram', type: 'text' },
    { key: 'utmMedium', label: 'UTM Medium', placeholder: 'bot', type: 'text' },
    { key: 'utmCampaign', label: 'UTM Campaign', placeholder: 'summer2025', type: 'text' },
    { key: 'maxClicks', label: 'Лимит кликов', placeholder: '1000', type: 'number' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pb-4">
      {baseFields.map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label htmlFor={`field-${key}`} className="text-xs text-white/40 mb-1 block">{label}</label>
          <input
            id={`field-${key}`}
            type={type}
            value={form[key]}
            onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:border-brand-500/50 focus:outline-none transition-colors"
          />
        </div>
      ))}

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(v => !v)}
        className="text-xs text-brand-400/70 hover:text-brand-400 transition-colors flex items-center gap-1"
      >
        <Zap className="w-3 h-3" />
        {showAdvanced ? 'Скрыть UTM и лимиты' : 'UTM параметры и лимиты'}
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {advancedFields.map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label htmlFor={`adv-${key}`} className="text-xs text-white/40 mb-1 block">{label}</label>
                <input
                  id={`adv-${key}`}
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:border-brand-500/50 focus:outline-none transition-colors"
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-2xl glass border border-white/10 text-white/60 text-sm">
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading || !form.targetUrl}
          className="flex-1 btn-glow py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Создаём…' : '+ Создать ссылку'}
        </button>
      </div>
    </form>
  );
}

// ─── Link Analytics View ──────────────────────────────────────────────────────
function LinkAnalyticsView({ data, isLoading }: { data?: LinkAnalytics; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="glass-card p-4 h-32 shimmer" />
        <div className="glass-card p-4 h-24 shimmer" />
        <div className="glass-card p-4 h-24 shimmer" />
      </div>
    );
  }

  if (!data) return (
    <div className="glass-card p-8 text-center">
      <BarChart3 className="w-10 h-10 text-white/20 mx-auto mb-2" />
      <p className="text-white/40 text-sm">Нет данных</p>
    </div>
  );

  const { link, stats } = data;
  const cvr = stats.totalClicks > 0 ? Math.round((stats.conversions / stats.totalClicks) * 100) : 0;

  return (
    <div className="space-y-4 pb-4">
      {/* Main stats */}
      <div className="glass-card p-4">
        <p className="text-white/40 text-xs truncate mb-3">{link.targetUrl}</p>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Кликов', value: stats.totalClicks, color: 'text-cyan-400', icon: MousePointerClick },
            { label: 'Уникальных', value: stats.uniqueClicks, color: 'text-violet-400', icon: Target },
            { label: 'Конверсий', value: stats.conversions, color: 'text-emerald-400', icon: TrendingUp },
            { label: 'CVR', value: `${cvr}%`, color: 'text-amber-400', icon: Zap },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="text-center glass rounded-xl p-2">
                <Icon className={cn('w-3.5 h-3.5 mx-auto mb-1', m.color)} />
                <div className={cn('text-base font-bold', m.color)}>{m.value}</div>
                <div className="text-[9px] text-white/30 leading-tight">{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel */}
      {stats.totalClicks > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Воронка конверсии</h4>
          <FunnelBar label="Переходы" value={stats.totalClicks} max={stats.totalClicks} color="bg-cyan-500" />
          <FunnelBar label="Уникальные" value={stats.uniqueClicks} max={stats.totalClicks} color="bg-violet-500" />
          <FunnelBar label="Конверсии" value={stats.conversions} max={stats.totalClicks} color="bg-emerald-500" />
        </div>
      )}

      {/* Countries */}
      {Object.keys(stats.byCountry ?? {}).length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            По странам
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.byCountry as Record<string, number>)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([country, count]) => {
                const pct = stats.totalClicks > 0 ? (count / stats.totalClicks) * 100 : 0;
                return (
                  <div key={country}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/70">{country}</span>
                      <span className="text-xs font-semibold text-white">{count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-cyan-500/60 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Devices */}
      {Object.keys(stats.byDevice ?? {}).length > 0 && (
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-violet-400" />
            По устройствам
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.byDevice as Record<string, number>)
              .sort(([, a], [, b]) => b - a)
              .map(([device, count]) => {
                const pct = stats.totalClicks > 0 ? (count / stats.totalClicks) * 100 : 0;
                return (
                  <div key={device}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white/70 capitalize">{device}</span>
                      <span className="text-xs font-semibold text-white">{count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-violet-500/60 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-semibold text-white">{value} <span className="text-white/30">({Math.round(pct)}%)</span></span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          style={{ opacity: 0.7 }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface TrackingLink {
  id: string;
  slug: string;
  title?: string;
  targetUrl: string;
  isActive: boolean;
  clickCount: number;
  conversionCount: number;
  utmCampaign?: string;
  qrCodeUrl?: string;
}

interface LinkAnalytics {
  link: { slug: string; targetUrl: string };
  stats: {
    totalClicks: number;
    uniqueClicks: number;
    conversions: number;
    byCountry: Record<string, number>;
    byDevice: Record<string, number>;
  };
}
