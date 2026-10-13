'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { NotificationListener } from './notification-listener';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
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
