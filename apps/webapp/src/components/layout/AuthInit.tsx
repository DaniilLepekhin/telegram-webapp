'use client';

/**
 * AuthInit — runs Telegram authentication once per page session.
 *
 * Placed inside Providers (so it has access to React Query) but outside any
 * specific route/page component. This ensures isFreshAuth is set BEFORE any
 * protected query fires, regardless of which route the user lands on.
 *
 * ShowcaseHub no longer owns auth — it still sends the streak update after
 * auth resolves (via the onAuthReady callback approach), but the actual
 * loginWithTelegram() call lives here.
 */

import { useTelegram } from '@/hooks/useTelegram';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { User } from '@showcase/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

// Module-level guard: survives StrictMode double-invoke and fast-refresh remounts
const _guard = { authAttempted: false, streakSent: false };

export function AuthInit() {
  const { initData, isReady } = useTelegram();
  const {
    setUser,
    setStreakUpdated,
    isFreshAuth,
    accessToken: storeToken,
  } = useAuthStore();
  const qc = useQueryClient();
  const didRunRef = useRef(false);

  useEffect(() => {
    // Only run once — module-level guard also blocks StrictMode second call
    if (!isReady || _guard.authAttempted || didRunRef.current) return;

    const safeInitData = initData.trim();

    // Dev environment / outside Telegram: no initData available.
    // In this case isFreshAuth stays false and protected queries won't fire —
    // which is correct since there is no real auth token.
    if (safeInitData.length < 10) return;

    _guard.authAttempted = true;
    didRunRef.current = true;

    const run = async () => {
      try {
        const res = await api.loginWithTelegram(safeInitData);
        if (res.success && res.data) {
          const { user: userData, accessToken } = res.data as {
            user: User & { createdAt?: string };
            accessToken: string;
          };

          // Synchronously updates api.token before returning
          setUser(userData, accessToken);

          // Invalidate any queries that may have been skipped due to
          // isFreshAuth=false — they will now refetch with a valid token
          qc.invalidateQueries({ queryKey: ['gamification'] });
          qc.invalidateQueries({ queryKey: ['activity'] });

          // Streak: once per session, right after we have a fresh token
          if (!_guard.streakSent) {
            _guard.streakSent = true;
            setStreakUpdated();
            api.updateStreak().catch(() => {});
          }

          api.trackEvent('page_view', { page: 'app_open' }).catch(() => {});
        }
      } catch (err) {
        // Auth failed — leave isFreshAuth=false. ShowcaseHub will surface the
        // error UI to the user on the home route.
        console.error('[AuthInit] loginWithTelegram failed:', err);
        // Allow retry on next navigation / page reload
        _guard.authAttempted = false;
        didRunRef.current = false;
      }
    };

    void run();
  }, [isReady, initData, setUser, setStreakUpdated, qc]);

  // Defensive: if isFreshAuth is already true when this component mounts
  // (shouldn't happen since it's not persisted, but guards against future changes)
  // and the streak hasn't been sent yet, send it now — but only with a valid token.
  useEffect(() => {
    if (isFreshAuth && storeToken && !_guard.streakSent) {
      _guard.streakSent = true;
      setStreakUpdated();
      api.updateStreak().catch(() => {});
    }
  }, [isFreshAuth, storeToken, setStreakUpdated]);

  return null;
}
