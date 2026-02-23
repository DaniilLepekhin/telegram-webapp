'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { api, ApiError } from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    api.setToken(accessToken);
  }, [accessToken]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: (failureCount, error) => {
              // Use status code if available (ApiError), otherwise fall back to message parsing
              const status = error instanceof ApiError ? error.status : 0;
              const message = error instanceof Error ? error.message : '';
              // Never retry 401/403 — token is invalid, re-login is the only fix
              if (status === 401 || status === 403) return false;
              if (message.includes('401') || message.includes('403')) return false;
              // Don't retry other 4xx client errors
              if (status >= 400 && status < 500) return false;
              // Retry 5xx (backend restart) once
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
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
