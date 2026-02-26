'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCallback, useState } from 'react';
import { EcomCart } from './EcomCart';
import { EcomCatalog } from './EcomCatalog';
import { EcomCheckout } from './EcomCheckout';
import { EcomOrderSuccess } from './EcomOrderSuccess';
import { EcomProductDetail } from './EcomProductDetail';
import { useEcomCart } from './ecom-store';
import type { EcomView } from './ecom-types';

interface EcomDemoProps {
  onBack: () => void;
}

export function EcomDemo({ onBack }: EcomDemoProps) {
  const { haptic } = useTelegram();
  const [view, setView] = useState<EcomView>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [history, setHistory] = useState<EcomView[]>([]);
  const itemCount = useEcomCart((s) => s.getItemCount());
  const clearCart = useEcomCart((s) => s.clearCart);

  const navigate = useCallback(
    (to: EcomView, productId?: string) => {
      haptic.selection();
      setHistory((prev) => [...prev, view]);
      setView(to);
      if (productId !== undefined) setSelectedProductId(productId);
    },
    [view, haptic],
  );

  const goBack = useCallback(() => {
    haptic.impact('light');
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setView(prev);
    } else {
      onBack();
    }
  }, [history, haptic, onBack]);

  const handleBackToShop = useCallback(() => {
    haptic.impact('light');
    clearCart();
    setHistory([]);
    setView('catalog');
  }, [haptic, clearCart]);

  const headerTitle = {
    catalog: 'Demo Shop',
    product: 'Товар',
    cart: 'Корзина',
    checkout: 'Оформление',
    success: 'Заказ оформлен',
  }[view];

  return (
    <div className="min-h-screen bg-th-bg relative">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-th-bg/80 backdrop-blur-xl border-b border-th-border/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-th/60 hover:text-th transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">
              {history.length === 0 ? 'Кейсы' : 'Назад'}
            </span>
          </button>

          <h1 className="text-sm font-bold text-th absolute left-1/2 -translate-x-1/2">
            {headerTitle}
          </h1>

          {/* Cart badge */}
          {view !== 'cart' && view !== 'checkout' && view !== 'success' && (
            <button
              type="button"
              onClick={() => navigate('cart')}
              className="relative p-2"
            >
              <ShoppingBag className="w-5 h-5 text-th/50" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>
          )}

          {(view === 'cart' || view === 'checkout' || view === 'success') && (
            <div className="w-9" />
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'catalog' && (
          <ViewWrapper key="catalog">
            <EcomCatalog
              onSelectProduct={(id) => navigate('product', id)}
              onOpenCart={() => navigate('cart')}
            />
          </ViewWrapper>
        )}
        {view === 'product' && selectedProductId && (
          <ViewWrapper key={`product-${selectedProductId}`}>
            <EcomProductDetail
              productId={selectedProductId}
              onGoToCart={() => navigate('cart')}
            />
          </ViewWrapper>
        )}
        {view === 'cart' && (
          <ViewWrapper key="cart">
            <EcomCart
              onContinueShopping={goBack}
              onCheckout={() => navigate('checkout')}
            />
          </ViewWrapper>
        )}
        {view === 'checkout' && (
          <ViewWrapper key="checkout">
            <EcomCheckout onSuccess={() => navigate('success')} />
          </ViewWrapper>
        )}
        {view === 'success' && (
          <ViewWrapper key="success">
            <EcomOrderSuccess onBackToShop={handleBackToShop} />
          </ViewWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
