import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@showcase/shared';

// Imported lazily to avoid circular deps — api imports store, store imports api
// We call api.setToken via dynamic import only in onRehydrateStorage
let _apiSetToken: ((t: string | null) => void) | null = null;
export function registerApiSetToken(fn: (t: string | null) => void) {
  _apiSetToken = fn;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** true once zustand has rehydrated from sessionStorage AND api token is synced */
  isAuthReady: boolean;
  isLoading: boolean;
  /** Streak already updated this session — don't call again */
  streakUpdated: boolean;
  setUser: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setAuthReady: () => void;
  setStreakUpdated: () => void;
}

/** Standalone helper for use outside React (e.g. in api.ts) */
export function clearAuth() {
  useAuthStore.getState().clearAuth();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isAuthReady: false,
      isLoading: true,
      streakUpdated: false,
      setUser: (user, token) => {
        // Also update api token synchronously
        _apiSetToken?.(token);
        set({ user, accessToken: token, isAuthenticated: true, isLoading: false, isAuthReady: true });
      },
      clearAuth: () => {
        _apiSetToken?.(null);
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, streakUpdated: false, isAuthReady: true });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setAuthReady: () => set({ isAuthReady: true }),
      setStreakUpdated: () => set({ streakUpdated: true }),
    }),
    {
      name: 'showcase-auth',
      storage: createJSONStorage(() => sessionStorage),
      // streakUpdated and isAuthReady intentionally NOT persisted — reset on page reload
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // Runs synchronously during store hydration — set api token BEFORE any React renders
        if (state?.accessToken) {
          _apiSetToken?.(state.accessToken);
        }
        state?.setLoading(false);
        state?.setAuthReady();
      },
    },
  ),
);
