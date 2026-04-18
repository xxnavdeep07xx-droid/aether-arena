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

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('exit'), 1600);
    const t3 = setTimeout(() => onFinish(), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[200] bg-arena-dark flex items-center justify-center transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative flex items-center justify-center">
        {/* Animated ring */}
        <div className={`absolute w-24 h-24 rounded-2xl border-2 border-arena-accent/40 transition-all duration-700 ${phase === 'hold' || phase === 'exit' ? 'scale-[1.8] opacity-0' : 'scale-100 opacity-100'}`} />
        <div className={`absolute w-20 h-20 rounded-2xl border border-arena-accent/20 transition-all duration-700 delay-100 ${phase === 'hold' || phase === 'exit' ? 'scale-[2.2] opacity-0' : 'scale-100 opacity-100'}`} />
        {/* Logo */}
        <div className={`relative transition-all duration-500 ${phase === 'enter' ? 'scale-0 opacity-0' : phase === 'hold' ? 'scale-110' : 'scale-100'}`}>
          <img src="/logo.png" alt="AA" className="w-16 h-16 rounded-xl" />
        </div>
        {/* Brand text */}
        <div className={`absolute -bottom-10 transition-all duration-500 delay-200 ${phase === 'enter' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <span className="text-sm font-bold tracking-[0.3em] text-arena-accent">AETHER ARENA</span>
        </div>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, logout } = useAuthStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [showSplash, setShowSplash] = useState(true);

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
      setLoading(false);
    };
    void checkAuth();
  }, [setUser, logout, setLoading]);

  // Don't show SSR flash - render nothing until mounted
  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
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
