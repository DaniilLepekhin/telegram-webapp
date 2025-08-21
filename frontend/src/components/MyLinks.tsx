import React, { useEffect, useState } from 'react';

type LinkRow = {
  id: number;
  link_id: string;
  title: string;
  description?: string;
  target_url: string;
  chat_title?: string;
  username?: string;
  created_at: string;
  is_active: boolean;
  total_clicks?: number;
  total_subscriptions?: number;
};

const MyLinks: React.FC = () => {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const openInTelegram = (url: string) => {
    const tg = (window as any)?.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url);
    } else {
      // Fallback: open normally
      window.location.href = url;
    }
  };

  const isTelegramLink = (url: string) => /^(https?:\/\/t\.me\/|tg:\/\/)/i.test(url);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/tracking/links');
        const data = await res.json();
        if (data?.success && Array.isArray(data.links)) {
          setLinks(data.links);
        } else {
          setError(data?.error || 'Не удалось получить ссылки');
        }
      } catch (e: any) {
        setError(e?.message || 'Ошибка сети');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-400/40 rounded-xl text-red-100 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.length === 0 ? (
        <div className="text-center text-white/70 py-8">Ссылок пока нет</div>
      ) : (
        links.map((link) => {
          const shareUrl = `https://app.daniillepekhin.com/track/${link.link_id}`;
          const conversion = link.total_clicks
            ? Math.round(((link.total_subscriptions || 0) / link.total_clicks) * 100)
            : 0;
          return (
            <div key={link.id} className="bg-white/10 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold truncate">{link.title || 'Без названия'}</h4>
                    {link.is_active ? (
                      <span className="text-emerald-300/90 text-xs bg-emerald-400/10 px-2 py-0.5 rounded-full">Активна</span>
                    ) : (
                      <span className="text-white/60 text-xs bg-white/10 px-2 py-0.5 rounded-full">Выключена</span>
                    )}
                  </div>
                  <div className="text-white/70 text-sm">
                    <div className="truncate">Канал: {link.username ? `@${link.username}` : (link.chat_title || '—')}</div>
                    <div className="truncate">Цель: <a
                      href={link.target_url}
                      className="underline decoration-dotted"
                      onClick={(e) => {
                        if (isTelegramLink(link.target_url)) {
                          e.preventDefault();
                          openInTelegram(link.target_url);
                        }
                      }}
                    >{link.target_url}</a></div>
                    <div className="mt-1 text-xs text-white/60">Создана: {new Date(link.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-white font-medium">{link.total_clicks || 0} кликов</div>
                  <div className="text-white/80 text-sm">{link.total_subscriptions || 0} подписок</div>
                  <div className="text-white/60 text-xs">CR: {conversion}%</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                <code className="text-white/90 bg-white/10 px-2 py-1 rounded-md text-xs truncate">
                  {shareUrl}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="px-3 py-1.5 rounded-md text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                >
                  Скопировать
                </button>
                <button
                  onClick={() => openInTelegram(isTelegramLink(link.target_url) ? link.target_url : shareUrl)}
                  className="px-3 py-1.5 rounded-md text-xs bg-white/10 text-white hover:bg-white/15"
                >
                  Открыть
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyLinks;



