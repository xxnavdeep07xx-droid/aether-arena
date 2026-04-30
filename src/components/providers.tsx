'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/lib/store';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,        // 2 min: serve cache, no refetch
      gcTime: 10 * 60 * 1000,            // 10 min: keep in memory
      retry: 1,
      refetchOnWindowFocus: false,      // prevent surprise refetches on tab switch
      refetchOnReconnect: true,          // refetch on reconnect is fine
    },
  },
});

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 800);
    const t2 = setTimeout(() => setPhase('exit'), 2400);
    const t3 = setTimeout(() => onFinish(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div onClick={() => onFinish()} className={`fixed inset-0 z-[200] bg-arena-dark flex items-center justify-center transition-opacity duration-700 cursor-pointer ${phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative flex items-center justify-center">
        {/* Background radial glow */}
        <div className={`absolute w-[400px] h-[400px] rounded-full transition-all duration-1000 ${phase === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
          style={{ background: 'radial-gradient(circle, rgba(255,75,92,0.12) 0%, rgba(255,75,92,0.03) 40%, transparent 70%)' }}
        />

        {/* Expanding pulse rings */}
        <div className={`absolute rounded-full border-2 border-arena-accent/50 transition-all duration-[2000ms] ease-out ${phase === 'enter' ? 'w-32 h-32 scale-100 opacity-80' : phase === 'hold' ? 'w-[300px] h-[300px] scale-100 opacity-0' : 'opacity-0'}`}
          style={{ animation: phase === 'enter' ? 'none' : undefined }}
        />
        <div className={`absolute rounded-full border border-arena-accent/30 transition-all duration-[2000ms] ease-out delay-300 ${phase === 'enter' ? 'w-28 h-28 scale-100 opacity-60' : phase === 'hold' ? 'w-[350px] h-[350px] scale-100 opacity-0' : 'opacity-0'}`}
        />

        {/* Rotating energy ring 1 */}
        <div className={`absolute w-44 h-44 rounded-full border-2 border-transparent transition-all duration-700 ${phase === 'enter' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}
          style={{ borderTopColor: 'rgba(255,75,92,0.6)', borderRightColor: 'rgba(255,75,92,0.2)', animation: 'splash-ring-rotate 3s linear infinite' }}
        />
        {/* Rotating energy ring 2 */}
        <div className={`absolute w-52 h-52 rounded-full border-2 border-transparent transition-all duration-700 delay-150 ${phase === 'enter' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}
          style={{ borderBottomColor: 'rgba(255,75,92,0.4)', borderLeftColor: 'rgba(255,75,92,0.15)', animation: 'splash-ring-rotate-reverse 5s linear infinite' }}
        />

        {/* Floating particles */}
        <div className={`absolute w-1 h-1 rounded-full transition-opacity duration-500 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}
          style={{ top: '20%', left: '65%', background: 'rgba(255,75,92,0.9)', boxShadow: '0 0 6px rgba(255,75,92,0.8)', animation: 'particle-float-1 2.5s ease-out infinite' }}
        />
        <div className={`absolute w-1 h-1 rounded-full transition-opacity duration-500 delay-100 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}
          style={{ top: '35%', left: '20%', background: 'rgba(255,107,122,0.8)', boxShadow: '0 0 4px rgba(255,107,122,0.6)', animation: 'particle-float-2 3s ease-out infinite 0.5s' }}
        />
        <div className={`absolute w-1.5 h-1.5 rounded-full transition-opacity duration-500 delay-200 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}
          style={{ top: '70%', left: '70%', background: 'rgba(255,75,92,0.7)', boxShadow: '0 0 5px rgba(255,75,92,0.7)', animation: 'particle-float-3 2.8s ease-out infinite 1s' }}
        />
        <div className={`absolute w-1 h-1 rounded-full transition-opacity duration-500 delay-300 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}
          style={{ top: '75%', left: '25%', background: 'rgba(255,160,170,0.6)', boxShadow: '0 0 4px rgba(255,160,170,0.5)', animation: 'particle-float-4 3.2s ease-out infinite 0.3s' }}
        />
        <div className={`absolute w-1 h-1 rounded-full transition-opacity duration-500 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}
          style={{ top: '15%', left: '35%', background: 'rgba(255,75,92,0.9)', boxShadow: '0 0 8px rgba(255,75,92,0.9)', animation: 'particle-float-5 2s ease-out infinite 0.8s' }}
        />

        {/* Energy streaks */}
        <div className={`absolute w-0.5 h-full transition-opacity duration-500 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}
          style={{ left: '12%', background: 'linear-gradient(to bottom, transparent, rgba(255,75,92,0.5), transparent)', animation: 'energy-streak 3s ease-in-out infinite' }}
        />
        <div className={`absolute w-0.5 h-full transition-opacity duration-500 delay-200 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}
          style={{ right: '12%', background: 'linear-gradient(to bottom, transparent, rgba(255,75,92,0.4), transparent)', animation: 'energy-streak 4s ease-in-out infinite 1.5s' }}
        />

        {/* The Logo */}
        <div className={`relative z-10 transition-all duration-700 ${phase === 'enter' ? 'scale-0 opacity-0 blur-lg' : phase === 'hold' ? 'scale-110 opacity-100 blur-0' : 'scale-100 opacity-100 blur-0'}`}>
          <Image
            src="/logo-hero.webp"
            alt="Aether Arena"
            width={160}
            height={160}
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-contain"
            style={{ filter: phase === 'hold' ? 'drop-shadow(0 0 20px rgba(255,75,92,0.6)) brightness(1.1)' : 'drop-shadow(0 0 10px rgba(255,75,92,0.3))' }}
          />
        </div>

        {/* Tap to skip */}
        <p className={`absolute -bottom-20 text-[11px] text-arena-text-muted/60 transition-all duration-500 delay-700 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}>Tap to skip</p>

        {/* Loading dots */}
        <div className={`absolute -bottom-16 flex items-center gap-2 transition-all duration-500 delay-500 ${phase === 'enter' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-arena-accent"
              style={{ animation: `splash-dot-float 1.2s ease-in-out infinite ${i * 0.2}s` }}
            />
          ))}
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
            // Prefetch common data in background after auth succeeds
            queryClient.prefetchQuery({ queryKey: ['tournaments', { game: '', status: '', format: '', fee: '' }], queryFn: () => apiFetch<any>('/api/tournaments?limit=6').then(d => Array.isArray(d.tournaments) ? d.tournaments : []) }).catch(() => {});
            queryClient.prefetchQuery({ queryKey: ['featured-streams'], queryFn: () => apiFetch<any>('/api/streams').then(d => Array.isArray(d.streams) ? d.streams : []) }).catch(() => {});
            queryClient.prefetchQuery({ queryKey: ['games-filter'], queryFn: () => apiFetch<any>('/api/games').then(d => Array.isArray(d.games) ? d.games : []) }).catch(() => {});
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
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--arena-card)',
            border: '1px solid var(--arena-border)',
            color: 'var(--arena-text-primary)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
