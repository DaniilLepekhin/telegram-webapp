import { create } from 'zustand';

interface EcomFavoritesState {
  ids: Set<string>;
  toggle: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  count: () => number;
}

export const useEcomFavorites = create<EcomFavoritesState>((set, get) => ({
  ids: new Set<string>(),

  toggle: (productId) => {
    set((state) => {
      const next = new Set(state.ids);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return { ids: next };
    });
  },

  isFavorite: (productId) => get().ids.has(productId),

  count: () => get().ids.size,
}));
