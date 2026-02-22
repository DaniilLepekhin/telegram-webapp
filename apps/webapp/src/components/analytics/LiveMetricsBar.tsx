'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LiveEvent } from '@showcase/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

export function LiveMetricsBar() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [current, setCurrent] = useState<LiveEvent | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connect = () => {
      const es = new EventSource(`${API_BASE}/api/v1/analytics/live`);
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data) as LiveEvent;
          setEvents((prev) => [event, ...prev].slice(0, 20));
        } catch {}
      };

      es.onerror = () => {
        es.close();
        // Retry in 5s
        retryRef.current = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, []);

  // Cycle through events display
  useEffect(() => {
    if (events.length === 0) return;
    setCurrent(events[0]);
    const timer = setTimeout(() => setCurrent(null), 3000);
    return () => clearTimeout(timer);
  }, [events]);

  if (!current) return <div className="h-10" />;

  return (
    <div className="px-4 pt-3 pb-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-2xl px-4 py-2.5 flex items-center gap-3"
        >
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Live</span>
          </div>

          <div className="w-px h-3 bg-white/10" />

          {/* Event */}
          <span className="text-base">{current.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/80 truncate">
              <span className="font-medium text-white">{current.title}</span>
              {current.description && (
                <span className="text-white/40"> — {current.description}</span>
              )}
            </p>
          </div>

          {/* Timestamp */}
          <span className="text-[10px] text-white/20 flex-shrink-0 font-mono">
            {new Date(current.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
