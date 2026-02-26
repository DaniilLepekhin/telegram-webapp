'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Lock,
  MapPin,
  Smartphone,
  Star,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { useEcomCart } from './ecom-store';

interface EcomCheckoutProps {
  onSuccess: () => void;
}

type PaymentMethod = 'card' | 'sbp' | 'stars';

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  icon: typeof CreditCard;
  desc: string;
}> = [
  {
    id: 'card',
    label: 'Банковская карта',
    icon: CreditCard,
    desc: 'Visa, Mastercard, МИР',
  },
  {
    id: 'sbp',
    label: 'СБП',
    icon: Smartphone,
    desc: 'Система быстрых платежей',
  },
  { id: 'stars', label: 'Telegram Stars', icon: Star, desc: 'Оплата звёздами' },
];

export function EcomCheckout({ onSuccess }: EcomCheckoutProps) {
  const { haptic } = useTelegram();
  const items = useEcomCart((s) => s.items);
  const total = useEcomCart((s) => s.getTotal());

  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [submitting, setSubmitting] = useState(false);

  const delivery = 350;
  const grandTotal = total + delivery;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.notification('success');
    setSubmitting(true);
    // Simulate payment processing
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const isValid = form.name.trim().length > 0 && form.phone.trim().length > 5;

  return (
    <form onSubmit={handleSubmit} className="pb-32 px-4 pt-3">
      {/* Order summary */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-th/40">Ваш заказ</span>
          <span className="text-xs text-th/40">{itemCount} шт.</span>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size ?? 'ns'}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">{item.icon}</span>
                <span className="text-sm text-th/70 truncate">{item.name}</span>
                {item.quantity > 1 && (
                  <span className="text-xs text-th/30">x{item.quantity}</span>
                )}
              </div>
              <span className="text-sm font-medium text-th flex-shrink-0 ml-2">
                {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-th-border/5 mt-3 pt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-th/40">Товары</span>
            <span className="text-sm text-th">
              {total.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-th/40 flex items-center gap-1">
              <Truck className="w-3 h-3" /> Доставка СДЭК
            </span>
            <span className="text-sm text-th">
              {delivery.toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-th-border/5">
            <span className="text-sm font-semibold text-th">Итого</span>
            <span className="text-lg font-bold text-th">
              {grandTotal.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="mb-4">
        <p className="text-xs text-th/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Данные для доставки
        </p>

        <div className="space-y-2.5">
          {[
            {
              key: 'name',
              label: 'Имя и фамилия *',
              placeholder: 'Иван Петров',
              type: 'text',
            },
            {
              key: 'phone',
              label: 'Телефон *',
              placeholder: '+7 (999) 123-45-67',
              type: 'tel',
            },
            {
              key: 'city',
              label: 'Город',
              placeholder: 'Москва',
              type: 'text',
            },
            {
              key: 'address',
              label: 'Пункт выдачи СДЭК',
              placeholder: 'ул. Тверская, д. 1',
              type: 'text',
            },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label
                htmlFor={`checkout-${key}`}
                className="text-xs text-th/40 mb-1 block"
              >
                {label}
              </label>
              <input
                id={`checkout-${key}`}
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={placeholder}
                className="w-full glass rounded-xl px-4 py-3 text-sm text-th placeholder-th/20 border border-th-border/[0.08] focus:border-brand-500/50 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div className="mb-6">
        <p className="text-xs text-th/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5" /> Способ оплаты
        </p>

        <div className="space-y-2">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                haptic.selection();
                setPaymentMethod(id);
              }}
              className={cn(
                'w-full glass-card p-3.5 flex items-center gap-3 transition-all',
                paymentMethod === id
                  ? 'border border-brand-500/30 bg-brand-500/5'
                  : '',
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  paymentMethod === id ? 'bg-brand-500/15' : 'bg-th-border/5',
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    paymentMethod === id ? 'text-brand-400' : 'text-th/30',
                  )}
                />
              </div>
              <div className="text-left">
                <p
                  className={cn(
                    'text-sm font-medium',
                    paymentMethod === id ? 'text-th' : 'text-th/60',
                  )}
                >
                  {label}
                </p>
                <p className="text-[10px] text-th/30">{desc}</p>
              </div>

              {paymentMethod === id && (
                <motion.div
                  layoutId="payment-check"
                  className="ml-auto w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-th-bg/80 backdrop-blur-xl border-t border-th-border/5">
        <div className="px-4 py-4 max-w-md mx-auto">
          <button
            type="submit"
            disabled={!isValid || submitting}
            className={cn(
              'w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
              isValid && !submitting
                ? 'bg-gradient-to-r from-brand-500 to-neon-violet text-white shadow-glow-sm active:scale-[0.97]'
                : 'bg-th-border/10 text-th/30 cursor-not-allowed',
            )}
          >
            {submitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Оплатить {grandTotal.toLocaleString('ru-RU')} ₽
              </>
            )}
          </button>
          <p className="text-[10px] text-th/20 text-center mt-2">
            Демо-режим — оплата не будет списана
          </p>
        </div>
      </div>
    </form>
  );
}
