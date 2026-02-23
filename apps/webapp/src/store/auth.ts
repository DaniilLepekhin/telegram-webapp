import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@showcase/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isLoading: boolean;
  /** Флаг: streak уже обновлён в этой сессии — не вызывать повторно */
  streakUpdated: boolean;
  setUser: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  setStreakUpdated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      isLoading: true,
      streakUpdated: false,
      setUser: (user, token) => set({ user, accessToken: token, isAuthenticated: true, isLoading: false }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, streakUpdated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHydrated: (hydrated) => set({ hasHydrated: hydrated }),
      setStreakUpdated: () => set({ streakUpdated: true }),
    }),
    {
      name: 'showcase-auth',
      storage: createJSONStorage(() => sessionStorage),
      // streakUpdated intentionally NOT persisted — reset on page reload
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
        state?.setHydrated(true);
      },
    },
  ),
);
