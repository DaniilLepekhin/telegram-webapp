'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Plus, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { DEMO_PRODUCTS } from './ecom-data';
import { useEcomFavorites } from './ecom-favorites-store';
import { useEcomCart } from './ecom-store';

interface EcomFavoritesProps {
  onSelectProduct: (id: string) => void;
  onContinueShopping: () => void;
}

export function EcomFavorites({
  onSelectProduct,
  onContinueShopping,
}: EcomFavoritesProps) {
  const { haptic } = useTelegram();
  const favoriteIds = useEcomFavorites((s) => s.ids);
  const toggleFavorite = useEcomFavorites((s) => s.toggle);
  const addItem = useEcomCart((s) => s.addItem);

  const favoriteProducts = useMemo(
    () => DEMO_PRODUCTS.filter((p) => favoriteIds.has(p.id)),
    [favoriteIds],
  );

  const handleRemove = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    haptic.impact('light');
    toggleFavorite(productId);
  };

  const handleAddToCart = (
    e: React.MouseEvent,
    product: (typeof DEMO_PRODUCTS)[number],
  ) => {
    e.stopPropagation();
    haptic.notification('success');
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      gradient: product.gradient,
      icon: product.icon,
      size: product.sizes?.[2] ?? product.sizes?.[0],
      color: product.colors?.[0]?.name,
    });
    toast.success(`${product.name} — в корзине`);
  };

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl glass flex items-center justify-center mb-6"
        >
          <Heart className="w-10 h-10 text-th/20" />
        </motion.div>
        <h3 className="text-lg font-bold text-th mb-2">Пока пусто</h3>
        <p className="text-sm text-th/40 text-center mb-6">
          Нажмите на сердечко, чтобы добавить товар в избранное
        </p>
        <button
          type="button"
          onClick={onContinueShopping}
          className="glass px-6 py-3 rounded-2xl text-sm font-semibold text-brand-300 flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ShoppingBag className="w-4 h-4" />
          Перейти в каталог
        </button>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs text-th/40">
          {favoriteProducts.length}{' '}
          {favoriteProducts.length === 1
            ? 'товар'
            : favoriteProducts.length < 5
              ? 'товара'
              : 'товаров'}
        </p>
      </div>

      <div className="px-4 space-y-2.5">
        <AnimatePresence>
          {favoriteProducts.map((product) => (
            <motion.button
              key={product.id}
              type="button"
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelectProduct(product.id)}
              className="w-full glass-card p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              {/* Image */}
              <div
                className={cn(
                  'w-20 h-20 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                  product.gradient,
                )}
              >
                <span className="text-3xl">{product.icon}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-th truncate">
                  {product.name}
                </p>

                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] text-th/40">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-sm font-bold text-th">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-[10px] text-th/30 line-through">
                      {product.compareAtPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Plus className="w-4 h-4 text-brand-400" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, product.id)}
                  className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
