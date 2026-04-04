'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { NotificationListener } from './notification-listener';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
        <NotificationListener />
        <SonnerToaster position="top-right" richColors closeButton />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'bg-card text-card-foreground border border-border shadow-lg',
            duration: 4000,
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
