'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Check,
  RotateCcw,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DEMO_PRODUCTS } from './ecom-data';
import { useEcomCart } from './ecom-store';

interface EcomProductDetailProps {
  productId: string;
  onGoToCart: () => void;
}

export function EcomProductDetail({ productId }: EcomProductDetailProps) {
  const product = DEMO_PRODUCTS.find((p) => p.id === productId);
  const { haptic } = useTelegram();
  const addItem = useEcomCart((s) => s.addItem);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes?.[2] ?? product?.sizes?.[0],
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors?.[0]?.name,
  );
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-th/40">Товар не найден</p>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    haptic.notification('success');
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      gradient: product.gradient,
      icon: product.icon,
      size: selectedSize,
      color: selectedColor,
    });
    setAdded(true);
    toast.success('Добавлено в корзину');
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="pb-32">
      {/* Image */}
      <div
        className={cn(
          'aspect-[4/3] bg-gradient-to-br flex items-center justify-center relative',
          product.gradient,
        )}
      >
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          className="text-8xl"
        >
          {product.icon}
        </motion.span>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {product.isNew && (
            <span className="px-2 py-1 rounded-lg bg-white/90 text-xs font-bold text-emerald-600">
              NEW
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2 py-1 rounded-lg bg-white/90 text-xs font-bold text-amber-600">
              HIT
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 rounded-lg bg-rose-500 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pt-4">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`star-${product.id}-${i}`}
                className={cn(
                  'w-3.5 h-3.5',
                  i < Math.floor(product.rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-th/15',
                )}
              />
            ))}
          </div>
          <span className="text-xs text-th/40">
            {product.rating} ({product.reviewCount} отзывов)
          </span>
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold text-th leading-tight">
          {product.name}
        </h2>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-2xl font-bold text-th">
            {product.price.toLocaleString('ru-RU')} ₽
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-th/30 line-through">
              {product.compareAtPrice.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-th/50 leading-relaxed mt-3">
          {product.description}
        </p>

        {/* Size selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-5">
            <p className="text-xs text-th/40 font-semibold uppercase tracking-wider mb-2">
              Размер{selectedSize ? `: ${selectedSize}` : ''}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    setSelectedSize(size);
                  }}
                  className={cn(
                    'min-w-[40px] h-10 px-3 rounded-xl text-sm font-medium transition-all',
                    selectedSize === size
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                      : 'glass text-th/50 hover:text-th/70',
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color selector */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-th/40 font-semibold uppercase tracking-wider mb-2">
              Цвет{selectedColor ? `: ${selectedColor}` : ''}
            </p>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    haptic.selection();
                    setSelectedColor(color.name);
                  }}
                  className={cn(
                    'w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center',
                    color.value,
                    selectedColor === color.name
                      ? 'border-brand-400 ring-2 ring-brand-400/30'
                      : 'border-th-border/10',
                  )}
                >
                  {selectedColor === color.name && (
                    <Check
                      className={cn(
                        'w-4 h-4',
                        color.value.includes('white') ||
                          color.value.includes('amber-100')
                          ? 'text-zinc-800'
                          : 'text-white',
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          {[
            { icon: Truck, label: 'Доставка 1-3 дня' },
            { icon: Shield, label: 'Гарантия 1 год' },
            { icon: RotateCcw, label: 'Возврат 14 дней' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="glass rounded-xl p-2.5 flex flex-col items-center gap-1.5 text-center"
            >
              <Icon className="w-4 h-4 text-brand-400" />
              <span className="text-[10px] text-th/40 leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-th-bg/80 backdrop-blur-xl border-t border-th-border/5">
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={added}
            className={cn(
              'flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
              added
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-gradient-to-r from-brand-500 to-neon-violet text-white shadow-glow-sm active:scale-[0.97]',
            )}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" />
                Добавлено
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />В корзину —{' '}
                {product.price.toLocaleString('ru-RU')} ₽
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
