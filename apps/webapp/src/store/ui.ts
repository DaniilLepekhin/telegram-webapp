import { create } from 'zustand';

interface UIState {
  /** True while any full-screen interactive demo is mounted. */
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  hideBottomNav: false,
  setHideBottomNav: (hide) => set({ hideBottomNav: hide }),
}));
