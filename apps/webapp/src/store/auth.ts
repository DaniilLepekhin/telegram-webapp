import type { User } from '@showcase/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  /**
   * true only after a SUCCESSFUL setUser() call in the CURRENT page session.
   * NOT set by onRehydrateStorage — prevents protected queries from firing
   * with a potentially-expired token from sessionStorage before re-auth completes.
   */
  isFreshAuth: boolean;
  isLoading: boolean;
  /** Streak already updated this session — don't call again */
  streakUpdated: boolean;
  setUser: (user: User, token: string) => void;
  /** Update only the access token (used by api.ts after a silent token refresh) */
  setAccessToken: (token: string) => void;
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
      isFreshAuth: false,
      isLoading: true,
      streakUpdated: false,
      setUser: (user, token) => {
        // Update api token synchronously, mark fresh auth for this session
        _apiSetToken?.(token);
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
          isAuthReady: true,
          isFreshAuth: true,
        });
      },
      setAccessToken: (token) => {
        _apiSetToken?.(token);
        set({ accessToken: token });
      },
      clearAuth: () => {
        _apiSetToken?.(null);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          streakUpdated: false,
          isAuthReady: true,
          isFreshAuth: false,
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setAuthReady: () => set({ isAuthReady: true }),
      setStreakUpdated: () => set({ streakUpdated: true }),
    }),
    {
      name: 'showcase-auth',
      storage: createJSONStorage(() => sessionStorage),
      // isFreshAuth, streakUpdated, isAuthReady intentionally NOT persisted.
      // isFreshAuth=false on every page load — prevents protected queries from
      // firing with a stale/expired token before re-auth completes.
      // user PII (name, username, photoUrl) is NOT persisted to sessionStorage
      // to reduce XSS exposure — it is re-populated on every auth via setUser().
      partialize: (s) => ({
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Runs synchronously during store hydration — set api token BEFORE any React renders.
        // We still set the token so it's available if the token is still fresh enough,
        // but isFreshAuth stays false until setUser() is called.
        if (state?.accessToken) {
          _apiSetToken?.(state.accessToken);
        }
        state?.setLoading(false);
        state?.setAuthReady();
        // NOTE: isFreshAuth is NOT set here intentionally
      },
    },
  ),
);
