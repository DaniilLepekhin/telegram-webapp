'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { ApiError } from '@/lib/api';
import { AuthInit } from './AuthInit';

export function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: api token is now synced synchronously in onRehydrateStorage (store/auth.ts)
  // via registerApiSetToken — no useEffect needed here

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: (failureCount, error) => {
              // Use .status from ApiError for precise retry decisions
              const status = error instanceof ApiError ? error.status : 0;
              const message = error instanceof Error ? error.message : '';
              // 401/403 — never retry, token is invalid
              if (status === 401 || status === 403) return false;
              if (message.includes('401') || message.includes('403')) return false;
              // Other 4xx — client error, don't retry
              if (status >= 400 && status < 500) return false;
              // 5xx — retry once (backend restart / transient)
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* AuthInit runs on every route — ensures isFreshAuth is set before any protected query fires */}
      <AuthInit />
      {children}
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(18, 18, 42, 0.95)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#fff',
            backdropFilter: 'blur(16px)',
          },
        }}
      />
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
