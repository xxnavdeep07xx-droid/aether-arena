'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore, useAppStore } from '@/lib/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, logout } = useAuthStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch {
        logout();
      }
    };
    void checkAuth();
  }, [setUser, logout, setLoading]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-arena-dark flex items-center justify-center">
        <div className="text-arena-accent text-2xl font-bold tracking-wider">AE</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#1a1a24',
            border: '1px solid #2a2a38',
            color: '#ffffff',
          },
        }}
      />
    </QueryClientProvider>
  );
}
