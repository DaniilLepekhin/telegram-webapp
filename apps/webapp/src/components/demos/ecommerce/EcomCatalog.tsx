'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart, Plus, Search, Star, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from './ecom-data';
import { useEcomFavorites } from './ecom-favorites-store';
import { useEcomCart } from './ecom-store';

interface EcomCatalogProps {
  onSelectProduct: (id: string) => void;
  onOpenCart: () => void;
}

export function EcomCatalog({ onSelectProduct }: EcomCatalogProps) {
  const { haptic } = useTelegram();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const addItem = useEcomCart((s) => s.addItem);
  const toggleFavorite = useEcomFavorites((s) => s.toggle);
  const favoriteIds = useEcomFavorites((s) => s.ids);

  const filteredProducts = useMemo(() => {
    let products = DEMO_PRODUCTS;
    if (selectedCategory) {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return products;
  }, [selectedCategory, searchQuery]);

  const handleQuickAdd = (
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

  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    haptic.impact('light');
    toggleFavorite(productId);
  };

  return (
    <div className="pb-32">
      {/* Search bar */}
      <div className="px-4 pt-3 pb-2">
        {showSearch ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 glass rounded-xl flex items-center px-3 py-2.5 gap-2">
              <Search className="w-4 h-4 text-th/30 flex-shrink-0" />
              <input
                type="text"
                // biome-ignore lint/a11y/noAutofocus: search UX requires it
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск товаров..."
                className="flex-1 bg-transparent text-sm text-th placeholder-th/25 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="p-2 text-th/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            className="w-full glass rounded-xl flex items-center px-3 py-2.5 gap-2"
          >
            <Search className="w-4 h-4 text-th/30" />
            <span className="text-sm text-th/30">Поиск товаров...</span>
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          <CategoryPill
            label="Все"
            icon="🔥"
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          />
          {DEMO_CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              label={cat.name}
              icon={cat.icon}
              active={selectedCategory === cat.id}
              onClick={() =>
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id)
              }
            />
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="px-4">
        {filteredProducts.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-th/40 text-sm">Ничего не найдено</p>
            <p className="text-th/25 text-xs mt-1">Попробуйте другой запрос</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((product, i) => {
              const isFav = favoriteIds.has(product.id);
              return (
                <motion.button
                  key={product.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  onClick={() => onSelectProduct(product.id)}
                  className="text-left group active:scale-[0.97] transition-transform"
                >
                  <div className="glass-card overflow-hidden">
                    {/* Image placeholder */}
                    <div
                      className={cn(
                        'relative aspect-square bg-gradient-to-br flex items-center justify-center',
                        product.gradient,
                      )}
                    >
                      <span className="text-5xl opacity-80 group-hover:scale-110 transition-transform">
                        {product.icon}
                      </span>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.isNew && (
                          <span className="px-1.5 py-0.5 rounded-md bg-white/90 text-[9px] font-bold text-emerald-600 uppercase">
                            New
                          </span>
                        )}
                        {product.isBestseller && (
                          <span className="px-1.5 py-0.5 rounded-md bg-white/90 text-[9px] font-bold text-amber-600 uppercase">
                            Hit
                          </span>
                        )}
                        {product.compareAtPrice && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-[9px] font-bold text-white uppercase">
                            -
                            {Math.round(
                              (1 - product.price / product.compareAtPrice) *
                                100,
                            )}
                            %
                          </span>
                        )}
                      </div>

                      {/* Favorite heart */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Heart
                          className={cn(
                            'w-4 h-4 transition-colors',
                            isFav
                              ? 'text-rose-500 fill-rose-500'
                              : 'text-white/80',
                          )}
                        />
                      </button>

                      {/* Quick add-to-cart */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-brand-500/90 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform shadow-lg"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-xs text-th font-medium line-clamp-2 leading-tight min-h-[2rem]">
                        {product.name}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-th/50 font-medium">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mt-1.5">
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
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0',
        active
          ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
          : 'glass text-th/40 hover:text-th/60',
      )}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
