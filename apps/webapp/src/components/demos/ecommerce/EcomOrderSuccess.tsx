'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MessageCircle, Package } from 'lucide-react';

interface EcomOrderSuccessProps {
  onBackToShop: () => void;
}

export function EcomOrderSuccess({ onBackToShop }: EcomOrderSuccessProps) {
  const orderNumber = `DEMO-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div className="px-4 pt-8 pb-32 text-center">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-glow-mint"
      >
        <CheckCircle2 className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-th mt-6">Заказ оформлен!</h2>
        <p className="text-th/40 text-sm mt-2">
          Номер заказа:{' '}
          <span className="font-mono text-th/60">{orderNumber}</span>
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-left"
      >
        <div className="space-y-4">
          {[
            {
              icon: CheckCircle2,
              title: 'Заказ принят',
              desc: 'Мы начали обрабатывать ваш заказ',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/15',
              active: true,
            },
            {
              icon: Package,
              title: 'Сборка и отправка',
              desc: 'Заказ будет собран и передан в СДЭК',
              color: 'text-th/30',
              bg: 'bg-th-border/5',
              active: false,
            },
            {
              icon: MessageCircle,
              title: 'Уведомление в Telegram',
              desc: 'Бот пришлёт трек-номер и статус доставки',
              color: 'text-th/30',
              bg: 'bg-th-border/5',
              active: false,
            },
          ].map(({ icon: Icon, title, desc, color, bg, active }, i) => (
            <div key={title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {i < 2 && (
                  <div
                    className={`w-0.5 h-6 mt-1 ${active ? 'bg-emerald-500/30' : 'bg-th-border/10'}`}
                  />
                )}
              </div>
              <div className="pt-1">
                <p
                  className={`text-sm font-medium ${active ? 'text-th' : 'text-th/40'}`}
                >
                  {title}
                </p>
                <p className="text-xs text-th/30 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Demo notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-4 mt-8 text-center"
      >
        <p className="text-xs text-th/40">
          Это демонстрация работы E-commerce бота.
        </p>
        <p className="text-xs text-th/30 mt-1">
          В реальном боте клиент получит все уведомления о статусе заказа,
          трек-номер СДЭК и возможность связаться с поддержкой.
        </p>
      </motion.div>

      {/* Back button */}
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onBackToShop}
        className="mt-6 btn-glow px-6 py-3 text-sm flex items-center gap-2 mx-auto"
      >
        Вернуться в каталог
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}
