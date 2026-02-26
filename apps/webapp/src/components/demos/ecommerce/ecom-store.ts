import { create } from 'zustand';
import type { DemoCartItem } from './ecom-types';

interface EcomCartState {
  items: DemoCartItem[];
  addItem: (item: Omit<DemoCartItem, 'quantity'>) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

/** Key for matching items: productId + size combo */
function itemKey(productId: string, size?: string): string {
  return size ? `${productId}__${size}` : productId;
}

export const useEcomCart = create<EcomCartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const key = itemKey(item.productId, item.size);
    set((state) => {
      const existing = state.items.find(
        (i) => itemKey(i.productId, i.size) === key,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            itemKey(i.productId, i.size) === key
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    });
  },

  removeItem: (productId, size) => {
    const key = itemKey(productId, size);
    set((state) => ({
      items: state.items.filter((i) => itemKey(i.productId, i.size) !== key),
    }));
  },

  updateQuantity: (productId, quantity, size) => {
    const key = itemKey(productId, size);
    if (quantity <= 0) {
      set((state) => ({
        items: state.items.filter((i) => itemKey(i.productId, i.size) !== key),
      }));
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        itemKey(i.productId, i.size) === key ? { ...i, quantity } : i,
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
