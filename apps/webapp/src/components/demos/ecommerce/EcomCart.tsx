'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useEcomCart } from './ecom-store';

interface EcomCartProps {
  onContinueShopping: () => void;
  onCheckout: () => void;
}

export function EcomCart({ onContinueShopping, onCheckout }: EcomCartProps) {
  const { haptic } = useTelegram();
  const items = useEcomCart((s) => s.items);
  const total = useEcomCart((s) => s.getTotal());
  const updateQuantity = useEcomCart((s) => s.updateQuantity);
  const removeItem = useEcomCart((s) => s.removeItem);
  const clearCart = useEcomCart((s) => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="px-4 pt-12 text-center">
        <div className="w-20 h-20 mx-auto mb-5 glass rounded-3xl flex items-center justify-center">
          <ShoppingBag className="w-9 h-9 text-th/15" />
        </div>
        <h3 className="text-th font-semibold text-base mb-1">Корзина пуста</h3>
        <p className="text-th/40 text-sm mb-6">Добавьте товары из каталога</p>
        <button
          type="button"
          onClick={onContinueShopping}
          className="btn-glow px-6 py-3 text-sm"
        >
          Перейти в каталог
        </button>
      </div>
    );
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="pb-40">
      {/* Items */}
      <div className="px-4 pt-3 space-y-2.5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-th/40">
            {itemCount}{' '}
            {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товара' : 'товаров'}
          </p>
          <button
            type="button"
            onClick={() => {
              haptic.impact('light');
              clearCart();
            }}
            className="text-xs text-th/30 hover:text-rose-400 transition-colors"
          >
            Очистить
          </button>
        </div>

        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={`${item.productId}-${item.size ?? 'ns'}`}
              layout
              exit={{ opacity: 0, scale: 0.9, height: 0 }}
              className="glass-card p-3 flex gap-3"
            >
              {/* Image */}
              <div
                className={cn(
                  'w-20 h-20 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                  item.gradient,
                )}
              >
                <span className="text-3xl">{item.icon}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-th truncate">
                  {item.name}
                </p>
                {(item.size || item.color) && (
                  <p className="text-[10px] text-th/30 mt-0.5">
                    {[item.size && `Размер: ${item.size}`, item.color]
                      .filter(Boolean)
                      .join(' / ')}
                  </p>
                )}
                <p className="text-sm font-bold text-th mt-1">
                  {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      haptic.selection();
                      updateQuantity(
                        item.productId,
                        item.quantity - 1,
                        item.size,
                      );
                    }}
                    className="w-7 h-7 glass rounded-lg flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5 text-th/50" />
                  </button>
                  <span className="text-sm font-semibold text-th tabular-nums w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      haptic.selection();
                      updateQuantity(
                        item.productId,
                        item.quantity + 1,
                        item.size,
                      );
                    }}
                    className="w-7 h-7 glass rounded-lg flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 text-th/50" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      haptic.impact('light');
                      removeItem(item.productId, item.size);
                    }}
                    className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-th/25 hover:text-rose-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary + Checkout */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-th-bg/80 backdrop-blur-xl border-t border-th-border/5">
        <div className="px-4 py-4 max-w-md mx-auto">
          {/* Summary */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-th/40">Итого</span>
            <span className="text-lg font-bold text-th">
              {total.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              haptic.impact('medium');
              onCheckout();
            }}
            className="w-full btn-glow py-3.5 text-sm flex items-center justify-center gap-2"
          >
            Оформить заказ
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
