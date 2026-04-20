'use client';

import { useAppStore, useAuthStore, useSearchStore, ViewName } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, Gamepad2, Users, Zap, Shield, ChevronRight,
  Tv, BarChart3, User, Home, Settings, LogOut,
  Crown, Target, Clock, Coins, Plus, Eye, Pencil,
  CheckCircle2, XCircle, Search, Bell, ChevronLeft,
  Menu, X, Swords, Star, TrendingUp, DollarSign,
  Calendar, Hash, Copy, ExternalLink, Upload,
  ArrowLeft, Play, CircleDot, Medal, Award, Link2,
  Trash2, RefreshCw, MonitorPlay, ShoppingBag, Store,
  MessageSquare, Mail
} from 'lucide-react';
import { cn, paiseToRupee, formatDateTime, formatDate, timeAgo, LEAGUE_CONFIG, getStatusBg, getFormatLabel } from '@/lib/utils';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Area, AreaChart } from 'recharts';

// ==================== SKELETON HELPERS ====================

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-arena-card rounded-xl', className)} />;
}

function HomeSkeleton() {
  return (
    <div className="space-y-6 py-2">
      {/* Stream banner */}
      <Skeleton className="h-64 md:h-72 w-full rounded-2xl" />
      {/* Top players */}
      <div>
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1,2,3,4].map(i => <Skeleton key={i} className="w-44 h-20 rounded-xl flex-shrink-0" />)}
        </div>
      </div>
      {/* Affiliate */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
      {/* Tournaments */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex gap-2 mb-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl overflow-hidden border border-arena-border/30">
              <Skeleton className="h-28 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-1.5 w-full rounded-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TournamentsSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="flex flex-wrap gap-2 mb-6">
        {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-xl overflow-hidden border border-arena-border/30">
            <Skeleton className="h-28 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="flex flex-wrap gap-4 mb-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="flex items-center px-4 py-3 border-b border-arena-border/30">
            <Skeleton className="h-5 w-8 mr-4" />
            <Skeleton className="h-8 w-8 rounded-lg mr-3" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StreamsSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="py-2">
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden mb-6">
        <Skeleton className="h-28 w-full rounded-none" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 mb-4">
            <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
            <div className="flex-1 pt-10">
              <Skeleton className="h-6 w-36 mb-2" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-arena-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="splash-bg-glow" />

      {/* Energy swirls */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full energy-swirl opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full energy-swirl energy-swirl-2 opacity-40" />

      {/* Pulse rings */}
      <div className="splash-ring" />
      <div className="splash-ring splash-ring-2" />

      {/* Floating particles */}
      <div className="energy-particle energy-particle-1" />
      <div className="energy-particle energy-particle-2" />
      <div className="energy-particle energy-particle-3" />
      <div className="energy-particle energy-particle-4" />
      <div className="energy-particle energy-particle-5" />
      <div className="energy-particle energy-particle-6" />

      {/* Energy streaks */}
      <div className="energy-streak energy-streak-1" />
      <div className="energy-streak energy-streak-2" />

      {/* Logo */}
      <div className="relative z-10">
        <div className="hero-energy-container w-36 h-36 md:w-48 md:h-48">
          <div className="energy-aura" />
          <div className="energy-ring energy-ring-1" />
          <div className="energy-ring energy-ring-2" />
          <div className="energy-ring energy-ring-3" />
          <img
            src="/logo-hero.webp"
            alt="Aether Arena"
            className="relative z-10 w-full h-full object-contain splash-logo logo-hero-energy rounded-3xl"
          />
        </div>
      </div>

      {/* Tagline */}
      <p className="splash-text mt-8 md:mt-10 text-sm md:text-base font-medium tracking-[0.2em] text-arena-text-secondary uppercase select-none">
        Compete &middot; Win &middot; Rise
      </p>

      {/* Loading dots */}
      <div className="flex items-center gap-2 mt-10">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="splash-loading-dot w-1.5 h-1.5 rounded-full bg-arena-accent"
          />
        ))}
      </div>
    </div>
  );
}

function ViewRenderer() {
  const { currentView, viewParams, navigate } = useAppStore();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Skeleton loading based on current view instead of spinner
  if (isLoading) {
    const skeletonMap: Partial<Record<ViewName, React.ReactNode>> = {
      'landing': <LandingSkeleton />,
      'home': <HomeSkeleton />,
      'tournaments': <TournamentsSkeleton />,
      'leaderboard': <LeaderboardSkeleton />,
      'streams': <StreamsSkeleton />,
      'profile': <ProfileSkeleton />,
      'notifications': <NotificationsSkeleton />,
    };
    return skeletonMap[currentView] || <HomeSkeleton />;
  }

  const viewMap: Record<ViewName, React.ReactNode> = {
    'landing': <LandingView />,
    'home': <HomeView />,
    'tournaments': <TournamentsView />,
    'tournament-detail': <TournamentDetailView />,
    'leaderboard': <LeaderboardView />,
    'streams': <StreamsView />,
    'profile': <ProfileView />,
    'notifications': <NotificationsView />,
    'admin-dashboard': <AdminDashboardView />,
    'admin-tournaments': <AdminTournamentsView />,
    'admin-tournament-create': <AdminTournamentCreateView />,
    'admin-registrations': <AdminRegistrationsView />,
    'admin-games': <AdminGamesView />,
    'admin-streams': <AdminStreamsView />,
    'admin-affiliates': <AdminAffiliatesView />,
    'admin-topup': <AdminTopupView />,
    'admin-analytics': <AdminAnalyticsView />,
    'admin-settings': <AdminSettingsView />,
    'privacy-policy': <PrivacyPolicyView />,
    'terms-conditions': <TermsConditionsView />,
    'refund-policy': <RefundPolicyView />,
    'contact': <ContactView />,
  };

  return (
    <div key={currentView} className="animate-fade-in">
      {viewMap[currentView] || <HomeView />}
    </div>
  );
}

// ==================== LANDING VIEW ====================

function LandingView() {
  const { setUser } = useAuthStore();
  const { navigate: nav } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', username: '', displayName: '' });
  const [loading, setLoading] = useState(false);

  const { data: featuredTournaments } = useQuery({
    queryKey: ['featured-tournaments'],
    queryFn: () => fetch('/api/tournaments?featured=true&limit=4').then(r => r.json()).then(d => d.tournaments || d),
  });

  const { data: games } = useQuery({
    queryKey: ['landing-games'],
    queryFn: () => fetch('/api/games').then(r => r.json()).then(d => d.games || d),
  });

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => fetch('/api/stats').then(r => r.json()),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        nav('home');
        toast.success('Welcome back!');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch {
      toast.error('Login failed');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        nav('home');
        toast.success('Account created! Welcome to Aether Arena!');
      } else {
        toast.error(data.error || 'Signup failed');
      }
    } catch {
      toast.error('Signup failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-arena-dark">
      {/* Landing Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-arena-dark/80 backdrop-blur-xl border-b border-arena-border">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="/logo-md.webp" alt="Aether Arena" className="w-9 h-9 rounded-xl logo-energy" />
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowLogin(true)} className="px-3 py-1.5 text-xs font-medium border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/50 rounded-lg transition-all duration-200">Log In</button>
            <button onClick={() => setShowSignup(true)} className="px-3 py-1.5 text-xs font-medium bg-arena-accent hover:bg-arena-accent-light text-white rounded-lg transition-all duration-200">Sign Up</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-arena-accent/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left - Text */}
            <div className="max-w-3xl flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-arena-accent/10 border border-arena-accent/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
                <CircleDot className="w-3 h-3 text-arena-accent animate-pulse" />
                <span className="text-sm text-arena-accent font-medium">Live Tournaments Now</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Compete. Win.<br />
                <span className="text-arena-accent"> Rise Through the Ranks.</span>
              </h1>
              <p className="text-lg md:text-xl text-arena-text-secondary mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Join India&apos;s fastest-growing mobile esports tournament platform. Free Fire, BGMI, COD Mobile &amp; more. Register, compete, and win real prizes.
              </p>
              <div className="flex gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <button onClick={() => setShowSignup(true)} className="px-8 py-3 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-arena-accent/25 hover:-translate-y-0.5">
                  Get Started Free
                </button>
                <button onClick={() => setShowLogin(true)} className="px-8 py-3 border border-arena-border hover:border-arena-accent/50 text-white font-semibold rounded-xl transition-all duration-200">
                  Log In
                </button>
              </div>
            </div>

            {/* Right - Animated Logo */}
            <div className="flex-shrink-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="hero-energy-container w-48 h-48 md:w-64 md:h-64">
                {/* Background aura */}
                <div className="energy-aura" />
                {/* Energy swirls */}
                <div className="energy-swirl" />
                <div className="energy-swirl energy-swirl-2" />
                {/* Rotating energy rings */}
                <div className="energy-ring energy-ring-1" />
                <div className="energy-ring energy-ring-2" />
                <div className="energy-ring energy-ring-3" />
                {/* Floating particles */}
                <div className="energy-particle energy-particle-1" />
                <div className="energy-particle energy-particle-2" />
                <div className="energy-particle energy-particle-3" />
                <div className="energy-particle energy-particle-4" />
                <div className="energy-particle energy-particle-5" />
                <div className="energy-particle energy-particle-6" />
                {/* Energy streaks */}
                <div className="energy-streak energy-streak-1" />
                <div className="energy-streak energy-streak-2" />
                <div className="energy-streak energy-streak-3" />
                {/* The Logo */}
                <img
                  src="/logo-hero.webp"
                  alt="Aether Arena"
                  className="relative z-10 w-full h-full object-contain logo-hero-energy rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-arena-border bg-arena-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Users, label: 'Players', value: stats?.players != null ? stats.players.toLocaleString() : '...' },
            { icon: Trophy, label: 'Tournaments', value: stats?.tournaments != null ? stats.tournaments.toLocaleString() : '...' },
            { icon: Coins, label: 'Prizes Won', value: stats ? `₹${(stats.prizesWon / 100).toLocaleString('en-IN')}` : '...' },
            { icon: Gamepad2, label: 'Games', value: stats?.games != null ? String(stats.games) : '...' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 text-arena-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-arena-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Find a Tournament', desc: 'Browse upcoming tournaments for your favorite games. Filter by game, format, or entry fee.', icon: Search },
            { step: '02', title: 'Register & Pay', desc: 'Sign up instantly. Free tournaments need no payment. Paid ones use simple UPI transfer.', icon: User },
            { step: '03', title: 'Compete & Win', desc: 'Join the match room, compete against players, and win real prize money!', icon: Trophy },
          ].map((item) => (
            <div key={item.step} className="bg-arena-card border border-arena-border rounded-2xl p-6 hover:border-arena-accent/30 transition-all duration-200 hover:-translate-y-0.5">
              <div className="text-4xl font-black text-arena-accent/20 mb-4">{item.step}</div>
              <item.icon className="w-8 h-8 text-arena-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2 leading-tight">{item.title}</h3>
              <p className="text-arena-text-secondary text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tournaments */}
      {featuredTournaments && featuredTournaments.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Tournaments</h2>
            <button onClick={() => nav('tournaments')} className="text-arena-accent text-sm font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTournaments.slice(0, 3).map((t: any) => (
              <div key={t.id} className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden hover:border-arena-accent/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                onClick={() => nav('tournament-detail', { id: t.id })}>
                <div className="h-32 bg-gradient-to-br from-arena-accent/20 to-arena-purple/20 flex items-center justify-center">
                  <Gamepad2 className="w-12 h-12 text-arena-text-muted" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getStatusBg(t.status))}>{t.status.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-arena-text-muted">{getFormatLabel(t.format)}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{t.title}</h3>
                  <p className="text-xs text-arena-text-muted mb-3">{t.game?.name || 'Unknown Game'}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn('font-bold', t.entryFee === 0 ? 'text-arena-success' : 'text-arena-accent')}>{paiseToRupee(t.entryFee)}</span>
                    <span className="text-xs text-arena-text-secondary">{paiseToRupee(t.prizePool)} Prize</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Games */}
      {games && games.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Games</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {games.map((g: any) => (
              <div key={g.id} className="bg-arena-card border border-arena-border rounded-2xl p-4 flex items-center gap-3 hover:border-arena-accent/30 transition-all duration-200 cursor-pointer">
                <div className="w-10 h-10 bg-arena-accent/10 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-arena-accent" />
                </div>
                <span className="font-medium">{g.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-arena-border bg-arena-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src="/logo-md.webp" alt="Aether Arena" className="w-8 h-8 rounded-xl" />
              </div>
              <p className="text-xs text-arena-text-secondary leading-relaxed max-w-xs">India&apos;s fastest-growing mobile esports tournament platform. Compete, win, and rise through the ranks.</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-arena-text-muted uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2">
                <li><button onClick={() => nav('tournaments')} className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">Tournaments</button></li>
                <li><button onClick={() => nav('leaderboard')} className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">Leaderboard</button></li>
                <li><button onClick={() => nav('streams')} className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">Streams</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-arena-text-muted uppercase tracking-wider mb-3">Support</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-arena-text-secondary">Discord</span></li>
                <li><span className="text-sm text-arena-text-secondary">FAQ</span></li>
                <li><button onClick={() => nav('contact')} className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-arena-text-muted uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><button onClick={() => nav('terms-conditions')} className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">Terms</button></li>
                <li><button onClick={() => nav('privacy-policy')} className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">Privacy</button></li>
                <li><button onClick={() => nav('refund-policy')} className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">Refund Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-arena-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-md.webp" alt="Aether Arena" className="w-6 h-6 rounded-lg" />
              <span className="text-xs text-arena-text-muted">© 2025 Aether Arena. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-arena-text-muted hover:text-arena-accent transition-colors duration-150 cursor-pointer">Twitter</span>
              <span className="text-xs text-arena-text-muted hover:text-arena-accent transition-colors duration-150 cursor-pointer">Discord</span>
              <span className="text-xs text-arena-text-muted hover:text-arena-accent transition-colors duration-150 cursor-pointer">YouTube</span>
              <span className="text-xs text-arena-text-muted hover:text-arena-accent transition-colors duration-150 cursor-pointer">Instagram</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-8 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <button onClick={() => setShowLogin(false)} aria-label="Close" className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Email</label>
                <input type="email" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 h-11 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Password</label>
                <input type="password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 h-11 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50">
                {loading ? 'Logging in...' : 'Log In'}
              </button>
              {/* Discord OAuth */}
              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-arena-border" />
                <span className="text-xs text-arena-text-muted">or continue with</span>
                <div className="flex-1 h-px bg-arena-border" />
              </div>
              <button type="button" onClick={() => { window.location.href = '/api/auth/discord'; }}
                className="w-full py-2.5 h-11 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
                Discord
              </button>
              <p className="text-center text-sm text-arena-text-muted">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => { setShowLogin(false); setShowSignup(true); }} className="text-arena-accent hover:underline transition-colors duration-150">Sign Up</button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-8 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Account</h2>
              <button onClick={() => setShowSignup(false)} aria-label="Close" className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Email</label>
                <input type="email" required value={signupForm.email} onChange={e => setSignupForm({ ...signupForm, email: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 h-11 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Username</label>
                <input type="text" required value={signupForm.username} onChange={e => setSignupForm({ ...signupForm, username: e.target.value.replace(/\s/g, '').toLowerCase() })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 h-11 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" placeholder="gamer_tag" />
              </div>
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Display Name</label>
                <input type="text" value={signupForm.displayName} onChange={e => setSignupForm({ ...signupForm, displayName: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 h-11 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" placeholder="Your Name (optional)" />
              </div>
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Password</label>
                <input type="password" required minLength={6} value={signupForm.password} onChange={e => setSignupForm({ ...signupForm, password: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 h-11 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" placeholder="Min 6 characters" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              {/* Discord OAuth */}
              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-arena-border" />
                <span className="text-xs text-arena-text-muted">or sign up with</span>
                <div className="flex-1 h-px bg-arena-border" />
              </div>
              <button type="button" onClick={() => { window.location.href = '/api/auth/discord'; }}
                className="w-full py-2.5 h-11 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
                Continue with Discord
              </button>
              <p className="text-center text-sm text-arena-text-muted">
                Already have an account?{' '}
                <button type="button" onClick={() => { setShowSignup(false); setShowLogin(true); }} className="text-arena-accent hover:underline transition-colors duration-150">Log In</button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== HOME VIEW ====================

function HomeView() {
  const { data: streams } = useQuery({
    queryKey: ['home-streams'],
    queryFn: () => fetch('/api/streams').then(r => r.json()).then(d => d.streams || d || []),
  });
  const { data: entries } = useQuery({
    queryKey: ['home-top-players'],
    queryFn: () => fetch('/api/leaderboard?period=all_time&limit=10').then(r => r.json()).then(d => d.leaderboard || d || []),
  });
  const { data: tournaments } = useQuery({
    queryKey: ['home-tournaments-skel'],
    queryFn: () => fetch('/api/tournaments?limit=4').then(r => r.json()).then(d => d.tournaments || d || []),
  });

  const isLoading = !streams && !entries && !tournaments;

  if (isLoading) return <HomeSkeleton />;

  return (
    <div className="space-y-6">
      <StreamBannerSection />
      <TopPlayersSection />
      <AffiliateCarouselSection />
      <TopupCarouselSection />
      <HomeTournamentsSection />
    </div>
  );
}

function StreamBannerSection() {
  const { navigate } = useAppStore();
  const [current, setCurrent] = useState(0);

  const { data: streams } = useQuery({
    queryKey: ['featured-streams'],
    queryFn: () => fetch('/api/streams').then(r => r.json()).then(d => d.streams || d || []),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!streams || streams.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % streams.length), 6000);
    return () => clearInterval(timer);
  }, [streams]);

  if (!streams || streams.length === 0) return null;

  const stream = streams[current];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-arena-border h-64 md:h-72 bg-arena-card cursor-pointer group transition-all duration-200 hover:-translate-y-0.5"
      onClick={() => stream.streamUrl && window.open(stream.streamUrl, '_blank')}>
      <div className="absolute inset-0 bg-gradient-to-br from-arena-accent/20 via-arena-purple/10 to-arena-dark" />
      <div className="absolute inset-0 bg-gradient-to-r from-arena-card/90 via-arena-card/50 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-10">
        <div className="flex items-center gap-2 mb-3">
          {stream.status === 'live' ? (
            <span className="flex items-center gap-1.5 bg-arena-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
              <CircleDot className="w-3 h-3 animate-pulse" /> LIVE NOW
            </span>
          ) : (
            <span className="bg-arena-info/20 text-arena-info text-xs font-semibold px-3 py-1 rounded-full">
              UPCOMING
            </span>
          )}
          <span className="bg-arena-surface/80 text-arena-text-secondary text-xs px-2 py-0.5 rounded-full capitalize">
            {stream.platform}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-arena-accent transition-colors duration-150">{stream.title}</h2>
        <p className="text-arena-text-secondary text-sm mb-4 max-w-lg">{stream.description}</p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-medium rounded-xl transition-all duration-200 text-sm"
            onClick={e => { e.stopPropagation(); if (stream.streamUrl) window.open(stream.streamUrl, '_blank'); }}>
            <Play className="w-4 h-4" /> Watch Now
          </button>
          {stream.tournamentId && (
            <button className="flex items-center gap-2 px-5 py-2 h-10 border border-arena-border hover:border-arena-accent/50 text-white font-medium rounded-xl transition-all duration-200 text-sm"
              onClick={e => { e.stopPropagation(); navigate('tournament-detail', { id: stream.tournamentId }); }}>
              <Eye className="w-4 h-4" /> View Tournament
            </button>
          )}
        </div>
      </div>
      {/* Nav dots */}
      {streams.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
          {streams.map((_: any, i: number) => (
            <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
              className={cn('w-2 h-2 rounded-full transition-all', i === current ? 'w-5 bg-arena-accent' : 'bg-arena-text-muted hover:bg-white')} />
          ))}
        </div>
      )}
    </div>
  );
}

function TopPlayersSection() {
  const { navigate } = useAppStore();

  const { data: entries } = useQuery({
    queryKey: ['top-players'],
    queryFn: () => fetch('/api/leaderboard?period=all_time&limit=50').then(r => r.json()).then(d => {
      const all = d.leaderboard || d || [];
      // Deduplicate: keep highest points per player
      const best = new Map<string, any>();
      for (const e of all) {
        const pid = e.playerId || e.player?.id;
        if (!pid) continue;
        const existing = best.get(pid);
        if (!existing || (e.points || 0) > (existing.points || 0)) {
          best.set(pid, e);
        }
      }
      return Array.from(best.values()).sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10);
    }),
  });

  if (!entries || entries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Crown className="w-5 h-5 text-arena-gold" /> Top Players
        </h2>
        <button onClick={() => navigate('leaderboard')} className="text-arena-accent text-xs font-medium hover:underline flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {entries.map((entry: any, idx: number) => {
          const league = LEAGUE_CONFIG[entry.player?.league] || LEAGUE_CONFIG.bronze;
          return (
            <div key={entry.id || idx} onClick={() => navigate('profile', { username: entry.player?.username })}
              className="flex-shrink-0 w-44 bg-arena-card border border-arena-border rounded-xl p-3 flex items-center gap-3 hover:border-arena-accent/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden">
                  {entry.player?.avatarUrl ? (
                    <img src={entry.player.avatarUrl} alt={`${entry.player.username}'s avatar`} className="w-full h-full object-cover" />
                  ) : (
                    (entry.player?.username || '?')[0].toUpperCase()
                  )}
                </div>
                {idx < 3 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{ backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32'][idx], color: idx === 0 ? '#000' : '#fff' }}>
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{entry.player?.username || 'Unknown'}</div>
                <div className="text-xs font-medium" style={{ color: league.color }}>
                  {league.icon} {league.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AffiliateCarouselSection() {
  const [current, setCurrent] = useState(0);

  const { data: affiliates } = useQuery({
    queryKey: ['affiliates'],
    queryFn: () => fetch('/api/affiliates').then(r => r.json()).then(d => d.affiliates || d || []),
  });

  useEffect(() => {
    if (!affiliates || affiliates.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % affiliates.length), 10000);
    return () => clearInterval(timer);
  }, [affiliates]);

  const handleClick = async (affiliate: any) => {
    if (affiliate.url) window.open(affiliate.url, '_blank');
    try { await fetch(`/api/affiliates/${affiliate.id}/click`, { method: 'POST' }); } catch {}
  };

  if (!affiliates || affiliates.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-arena-accent" /> Recommended Gear
        </h2>
        <div className="flex gap-1">
          {affiliates.map((_: any, i: number) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={cn('w-2 h-2 rounded-full transition-all', i === current ? 'w-4 bg-arena-accent' : 'bg-arena-text-muted')} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {affiliates.slice(current, current + 3).concat(
          affiliates.length - current < 3 ? affiliates.slice(0, 3 - (affiliates.length - current)) : []
        ).map((a: any) => (
          <div key={a.id} onClick={() => handleClick(a)}
            className="bg-arena-card border border-arena-border rounded-xl p-4 md:p-5 flex gap-4 hover:border-arena-accent/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
            <div className="w-16 h-16 rounded-lg bg-arena-surface flex items-center justify-center flex-shrink-0">
              <Gamepad2 className="w-8 h-8 text-arena-text-muted" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate">{a.name}</h3>
              <p className="text-xs text-arena-text-muted mt-1 line-clamp-2">{a.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-bold text-arena-success">₹{a.priceDisplay || a.price.toLocaleString('en-IN')}</span>
                {a.originalPrice > 0 && <span className="text-xs text-arena-text-muted line-through">₹{a.originalPriceDisplay || a.originalPrice.toLocaleString('en-IN')}</span>}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-arena-text-muted flex-shrink-0 self-center" />
          </div>
        ))}
      </div>
      <div className="mt-3 text-center bg-arena-accent/5 border border-arena-accent/10 rounded-xl py-2">
        <p className="text-xs text-arena-accent font-medium">Official Aether Arena Store — Coming Soon</p>
      </div>
    </div>
  );
}

// ==================== QUICK TOP UP CAROUSEL ====================

function TopupCarouselSection() {
  const [current, setCurrent] = useState(0);
  const [filterGame, setFilterGame] = useState('all');

  const { data: packsData } = useQuery({
    queryKey: ['topup-packs', filterGame],
    queryFn: () => fetch(`/api/topup-packs${filterGame !== 'all' ? `?game=${filterGame}` : ''}`).then(r => r.json()).then(d => d.packs || []),
    refetchInterval: 60000,
  });

  const packs = (packsData || []) as any[];

  const gameNames = [...new Set(packs.map((p: any) => p.gameName))] as string[];
  
  const filtered = filterGame === 'all' ? packs : packs.filter((p: any) => p.gameSlug === filterGame);
  
  // Items per page: 3 on desktop, 1 on mobile
  const itemsPerPage = 3;
  const maxIndex = Math.max(0, filtered.length - itemsPerPage);

  useEffect(() => {
    if (filtered.length <= itemsPerPage) return;
    const timer = setInterval(() => setCurrent(c => {
      const idx = Math.max(0, filtered.length - itemsPerPage);
      return c >= idx ? 0 : c + 1;
    }), 4000);
    return () => clearInterval(timer);
  }, [filtered, itemsPerPage]);

  const prev = () => setCurrent(c => c <= 0 ? maxIndex : c - 1);
  const next = () => setCurrent(c => c >= maxIndex ? 0 : c + 1);

  if (packs.length === 0) return null;

  const visible = filtered.slice(current, current + itemsPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-arena-warning" />
          <h2 className="text-lg font-bold">Quick Top Up</h2>
          <span className="text-[10px] bg-arena-warning/20 text-arena-warning font-medium px-2 py-0.5 rounded-full">Codashop</span>
        </div>
        <div className="flex items-center gap-1.5">
          {gameNames.map((g: string) => (
            <button key={g} onClick={() => { setFilterGame(filterGame === g.toLowerCase().replace(/\s+/g, '-') ? 'all' : g.toLowerCase().replace(/\s+/g, '-')); setCurrent(0); }}
              className={cn(
                'text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all duration-150',
                filterGame === g.toLowerCase().replace(/\s+/g, '-')
                  ? 'bg-arena-accent text-white'
                  : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:border-arena-accent/50'
              )}>
              {g}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative">
        {filtered.length > itemsPerPage && (
          <>
            <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-8 h-8 rounded-full bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-white hover:border-arena-accent/50 transition-all duration-150 shadow-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-8 h-8 rounded-full bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-white hover:border-arena-accent/50 transition-all duration-150 shadow-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((pack: any, i: number) => (
            <a key={pack.id} href={pack.affiliateUrl} target="_blank" rel="noopener noreferrer"
              className="group bg-arena-card border border-arena-border rounded-xl p-4 hover:border-arena-warning/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-warning/5 block">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-arena-accent/10 text-arena-accent">{pack.gameName}</span>
                    {pack.isPopular && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-arena-warning/20 text-arena-warning">🔥 Popular</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-arena-warning transition-colors duration-150">{pack.packName}</h3>
                </div>
                <ExternalLink className="w-4 h-4 text-arena-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-1" />
              </div>
              {pack.description && (
                <p className="text-xs text-arena-text-muted mb-3 line-clamp-1">{pack.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-arena-warning">₹{(pack.price / 100).toLocaleString('en-IN')}</span>
                  {pack.originalPrice > pack.price && (
                    <span className="text-xs text-arena-text-muted line-through">₹{(pack.originalPrice / 100).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-arena-warning/20 text-arena-warning group-hover:bg-arena-warning group-hover:text-white transition-all duration-200">Buy Now</span>
              </div>
            </a>
          ))}
        </div>
        
        {filtered.length > itemsPerPage && (
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={cn('w-1.5 h-1.5 rounded-full transition-all', i === current ? 'w-4 bg-arena-warning' : 'bg-arena-text-muted/40 hover:bg-arena-text-muted')} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HomeTournamentsSection() {
  const { navigate } = useAppStore();
  const [filter, setFilter] = useState('all');

  const { data: tournaments } = useQuery({
    queryKey: ['home-tournaments', filter],
    queryFn: () => fetch(`/api/tournaments?status=${filter === 'all' ? '' : filter}&limit=6`).then(r => r.json()).then(d => d.tournaments || d || []),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Swords className="w-5 h-5 text-arena-accent" /> Tournaments
        </h2>
        <button onClick={() => navigate('tournaments')} className="text-arena-accent text-xs font-medium hover:underline flex items-center gap-1">
          Browse All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all', 'registration_open', 'in_progress', 'upcoming'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200',
              filter === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/30')}>
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>
      {tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tournaments.map((t: any) => (
            <TournamentCard key={t.id} tournament={t} onClick={() => navigate('tournament-detail', { id: t.id })} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-arena-text-muted/30" />
          <p className="text-sm text-arena-text-muted">No tournaments found</p>
          <p className="text-xs text-arena-text-muted/60 mt-1">Check back soon for exciting battles!</p>
        </div>
      )}
    </div>
  );
}

// ==================== TOURNAMENT CARD ====================

function TournamentCard({ tournament: t, onClick }: { tournament: any; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-arena-card border border-arena-border rounded-xl overflow-hidden hover:border-arena-accent/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="h-28 bg-gradient-to-br from-arena-accent/15 via-arena-purple/10 to-arena-surface flex items-center justify-center relative">
        <Gamepad2 className="w-10 h-10 text-arena-text-muted/50" />
        <div className="absolute top-3 left-3 flex gap-2">
          {t.isFeatured && <span className="bg-arena-gold/20 text-arena-gold text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
          {t.status === 'in_progress' && <span className="bg-arena-accent text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><CircleDot className="w-3 h-3 animate-pulse" /> LIVE</span>}
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getStatusBg(t.status))}>
            {t.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
          <span className="text-[10px] text-arena-text-muted">{getFormatLabel(t.format)}</span>
          <span className="text-[10px] text-arena-text-muted">{t.game?.name}</span>
        </div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-1">{t.title}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className={cn('font-bold text-sm', t.entryFee === 0 ? 'text-arena-success' : 'text-arena-accent')}>{paiseToRupee(t.entryFee)}</span>
          <span className="text-xs text-arena-text-secondary">Prize: {paiseToRupee(t.prizePool)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-arena-text-muted mb-2">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.startTime ? formatDate(t.startTime) : 'TBD'}</span>
          <span>{t.registeredPlayers || 0}/{t.maxPlayers} Players</span>
        </div>
        <div className="w-full bg-arena-dark rounded-full h-1.5">
          <div className="bg-arena-accent rounded-full h-1.5 transition-all duration-300" style={{ width: `${Math.min(100, ((t.registeredPlayers || 0) / t.maxPlayers) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

// ==================== TOURNAMENTS VIEW ====================

function TournamentsView() {
  const { navigate } = useAppStore();
  const { query: searchQuery } = useSearchStore();
  const [filters, setFilters] = useState({ game: '', status: '', format: '', fee: '' });

  const { data: games } = useQuery({
    queryKey: ['games-filter'],
    queryFn: () => fetch('/api/games').then(r => r.json()).then(d => d.games || d || []),
  });

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments', filters, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.game) params.set('game', filters.game);
      if (filters.status) params.set('status', filters.status);
      if (filters.format) params.set('format', filters.format);
      if (filters.fee) params.set('fee', filters.fee);
      if (searchQuery) params.set('search', searchQuery);
      return fetch(`/api/tournaments?${params}`).then(r => r.json()).then(d => d.tournaments || d || []);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        {searchQuery && (
          <span className="text-xs text-arena-text-muted">Showing results for "<span className="text-arena-accent">{searchQuery}</span>"</span>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <select value={filters.game} onChange={e => setFilters(f => ({ ...f, game: e.target.value }))}
            className="bg-arena-card border border-arena-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-arena-accent">
            <option value="">All Games</option>
            {games?.map((g: any) => <option key={g.id} value={g.slug}>{g.name}</option>)}
          </select>
          {['', 'upcoming', 'registration_open', 'in_progress', 'completed'].map(s => (
            <button key={s} onClick={() => setFilters(f => ({ ...f, status: s }))}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                filters.status === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-white')}>
              {s === '' ? 'All Status' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
          {['', 'solo', 'duo', 'squad'].map(f => (
            <button key={f} onClick={() => setFilters(fs => ({ ...fs, format: f }))}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                filters.format === f ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-white')}>
              {f === '' ? 'All Formats' : getFormatLabel(f)}
            </button>
          ))}
          {['', 'free', 'paid'].map(f => (
            <button key={f} onClick={() => setFilters(fs => ({ ...fs, fee: f }))}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                filters.fee === f ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-white')}>
              {f === '' ? 'All' : f === 'free' ? 'Free' : 'Paid'}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Grid */}
      {isLoading ? (
        <TournamentsSkeleton />
      ) : tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t: any) => (
            <TournamentCard key={t.id} tournament={t} onClick={() => navigate('tournament-detail', { id: t.id })} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-arena-text-muted/30" />
          <p className="text-arena-text-muted">{searchQuery ? `No tournaments found for "${searchQuery}"` : 'No tournaments match your filters'}</p>
          <p className="text-xs text-arena-text-muted/60 mt-1">{searchQuery ? 'Try different keywords' : 'Try adjusting your filters or check back later'}</p>
        </div>
      )}
    </div>
  );
}

// ==================== TOURNAMENT DETAIL VIEW ====================

function TournamentDetailView() {
  const { viewParams, navigate } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', viewParams.id],
    queryFn: () => fetch(`/api/tournaments/${viewParams.id}`).then(r => r.json()),
    enabled: !!viewParams.id,
  });

  useEffect(() => {
    if (!tournament || !isAuthenticated) return;
    const checkRegistration = async () => {
      try {
        const res = await fetch('/api/registrations');
        const data = await res.json();
        const regs = data.registrations || data || [];
        const existing = regs.find((r: any) => r.tournamentId === viewParams.id);
        if (existing) { setRegistered(true); setPaymentStatus(existing.paymentStatus); }
      } catch {}
    };
    checkRegistration();
  }, [tournament, isAuthenticated, viewParams.id]);

  const handleRegister = async (data: { paymentMethod?: string; paymentReference?: string }) => {
    try {
      const res = await fetch(`/api/tournaments/${viewParams.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setRegistered(true);
        setPaymentStatus(result.registration?.paymentStatus || 'pending');
        setShowRegister(false);
        toast.success(tournament.entryFee === 0 ? 'Registered successfully!' : 'Payment submitted! Waiting for verification.');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed');
    }
  };

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
  if (!tournament) return <div className="text-center py-20 text-arena-text-muted">Tournament not found</div>;

  const t = tournament;
  const canRegister = isAuthenticated && t.status === 'registration_open' && (t.registeredPlayers || 0) < t.maxPlayers && !registered;

  return (
    <div>
      <button onClick={() => navigate('tournaments')} className="flex items-center gap-2 text-arena-text-secondary hover:text-white mb-4 text-sm transition-colors duration-150">
        <ArrowLeft className="w-4 h-4" /> Back to Tournaments
      </button>

      {/* Header */}
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-arena-accent/20 via-arena-purple/15 to-arena-surface flex items-center justify-center relative">
          <Gamepad2 className="w-16 h-16 text-arena-text-muted/30" />
          <div className="absolute top-4 left-4 flex gap-2">
            {t.isFeatured && <span className="bg-arena-gold/20 text-arena-gold text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
            <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', getStatusBg(t.status))}>
              {t.status === 'in_progress' ? <span className="flex items-center gap-1"><CircleDot className="w-3 h-3 animate-pulse" /> LIVE</span> : t.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
              <p className="text-arena-text-secondary text-sm">{t.game?.name} • {getFormatLabel(t.format)}</p>
            </div>
            {canRegister ? (
              <button onClick={() => setShowRegister(true)} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-arena-accent/20 text-sm whitespace-nowrap">
                Register Now
              </button>
            ) : registered ? (
              <span className={cn('px-4 py-2 rounded-xl text-sm font-medium', paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-warning/20 text-arena-warning')}>
                {paymentStatus === 'verified' ? '✓ Registered' : '⏳ Payment Pending'}
              </span>
            ) : !isAuthenticated ? (
              <button onClick={() => { toast.error('Please log in to register'); window.dispatchEvent(new Event('show-login')); }} className="px-6 py-2.5 h-11 border border-arena-accent text-arena-accent font-semibold rounded-xl transition-all duration-200 text-sm">
                Login to Register
              </button>
            ) : null}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Entry Fee', value: paiseToRupee(t.entryFee), color: t.entryFee === 0 ? 'text-arena-success' : 'text-arena-accent' },
              { label: 'Prize Pool', value: paiseToRupee(t.prizePool), color: 'text-arena-gold' },
              { label: 'Format', value: getFormatLabel(t.format), color: '' },
              { label: 'Max Players', value: t.maxPlayers.toString(), color: '' },
            ].map(item => (
              <div key={item.label} className="bg-arena-surface rounded-xl p-3">
                <div className="text-[10px] text-arena-text-muted uppercase tracking-wider mb-1">{item.label}</div>
                <div className={cn('font-bold', item.color)}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Registration Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-arena-text-muted">{t.registeredPlayers || 0} Registered</span>
              <span className="text-arena-text-muted">{t.maxPlayers} Max</span>
            </div>
            <div className="w-full bg-arena-dark rounded-full h-2">
              <div className="bg-arena-accent rounded-full h-2 transition-all duration-300" style={{ width: `${Math.min(100, ((t.registeredPlayers || 0) / t.maxPlayers) * 100)}%` }} />
            </div>
          </div>

          {/* Date/Time */}
          <div className="flex flex-wrap gap-4 text-sm text-arena-text-secondary mb-4">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {t.startTime ? formatDateTime(t.startTime) : 'TBD'}</span>
            {t.map && <span className="flex items-center gap-1"><MonitorPlay className="w-4 h-4" /> Map: {t.map}</span>}
            {t.matchMode && <span className="flex items-center gap-1"><Gamepad2 className="w-4 h-4" /> {t.matchMode}</span>}
          </div>

          {/* Description */}
          {t.description && (
            <div className="border-t border-arena-border pt-4 mb-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-arena-text-secondary whitespace-pre-line">{t.description}</p>
            </div>
          )}

          {/* Custom Rules */}
          {t.customRules && (
            <div className="border-t border-arena-border pt-4 mb-4">
              <h3 className="font-semibold mb-2">Custom Rules</h3>
              <p className="text-sm text-arena-text-secondary whitespace-pre-line">{t.customRules}</p>
            </div>
          )}

          {/* Room Details (only for registered + verified) */}
          {registered && paymentStatus === 'verified' && (t.roomId || t.roomPassword) && (
            <div className="border-t border-arena-border pt-4 bg-arena-success/5 rounded-xl p-4">
              <h3 className="font-semibold text-arena-success mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Room Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {t.roomId && (
                  <div>
                    <div className="text-[10px] text-arena-text-muted uppercase">Room ID</div>
                    <div className="font-mono font-semibold flex items-center gap-2">{t.roomId} <Copy className="w-3 h-3 text-arena-text-muted cursor-pointer" onClick={() => { navigator.clipboard.writeText(t.roomId); toast.success('Copied!'); }} /></div>
                  </div>
                )}
                {t.roomPassword && (
                  <div>
                    <div className="text-[10px] text-arena-text-muted uppercase">Password</div>
                    <div className="font-mono font-semibold flex items-center gap-2">{t.roomPassword} <Copy className="w-3 h-3 text-arena-text-muted cursor-pointer" onClick={() => { navigator.clipboard.writeText(t.roomPassword); toast.success('Copied!'); }} /></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegister && (
        <RegistrationModal tournament={t} onRegister={handleRegister} onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}

function RegistrationModal({ tournament, onRegister, onClose }: { tournament: any; onRegister: (data: any) => void; onClose: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState<'upi_id' | 'screenshot'>('upi_id');
  const [transactionId, setTransactionId] = useState('');
  const { data: settings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: () => fetch('/api/admin/settings').then(r => r.json()).then(d => d.settings || d || []),
  });

  const upiId = settings?.find((s: any) => s.key === 'upi_id')?.value || 'aetherarena@upi';

  if (tournament.entryFee === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-sm animate-fade-in-up" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-2">Confirm Registration</h3>
          <p className="text-sm text-arena-text-secondary mb-1">{tournament.title}</p>
          <p className="text-lg font-bold text-arena-success mb-4">FREE Entry</p>
          <div className="flex gap-3">
            <button onClick={() => onClose} className="flex-1 py-2.5 border border-arena-border rounded-xl text-sm font-medium hover:border-white transition-colors duration-150">Cancel</button>
            <button onClick={() => onRegister({})} className="flex-1 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl text-sm font-semibold transition-all duration-200">Confirm</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-md animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Complete Payment</h3>
          <button onClick={onClose} aria-label="Close" className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-arena-surface rounded-xl p-4 mb-4">
          <p className="text-sm text-arena-text-secondary mb-1">{tournament.title}</p>
          <p className="text-2xl font-bold text-arena-accent">{paiseToRupee(tournament.entryFee)}</p>
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Pay using any UPI app:</p>
          <div className="bg-arena-dark rounded-xl p-3 flex items-center justify-between">
            <span className="font-mono text-sm">{upiId}</span>
            <Copy className="w-4 h-4 text-arena-text-muted cursor-pointer hover:text-white" onClick={() => { navigator.clipboard.writeText(upiId); toast.success('UPI ID copied!'); }} />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setPaymentMethod('upi_id')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200', paymentMethod === 'upi_id' ? 'bg-arena-accent text-white' : 'bg-arena-surface text-arena-text-secondary')}>Enter Transaction ID</button>
          <button onClick={() => setPaymentMethod('screenshot')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200', paymentMethod === 'screenshot' ? 'bg-arena-accent text-white' : 'bg-arena-surface text-arena-text-secondary')}>Upload Screenshot</button>
        </div>
        {paymentMethod === 'upi_id' ? (
          <input type="text" placeholder="Enter UPI Transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value)}
            className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 h-11 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150 mb-4" />
        ) : (
          <div className="bg-arena-dark border border-arena-border border-dashed rounded-xl p-6 text-center mb-4 cursor-pointer hover:border-arena-accent/50 transition-colors duration-150">
            <Upload className="w-8 h-8 text-arena-text-muted mx-auto mb-2" />
            <p className="text-xs text-arena-text-muted">Screenshot upload coming soon</p>
            <p className="text-[10px] text-arena-text-muted mt-1">Use Transaction ID for now</p>
          </div>
        )}
        <button onClick={() => { if (!transactionId && paymentMethod === 'upi_id') { toast.error('Please enter transaction ID'); return; } onRegister({ paymentMethod, paymentReference: transactionId }); }}
          className="w-full py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm">
          Submit Payment
        </button>
      </div>
    </div>
  );
}

// ==================== LEADERBOARD VIEW ====================

function LeaderboardView() {
  const [gameFilter, setGameFilter] = useState('all');
  const [period, setPeriod] = useState('all_time');

  const { data: games } = useQuery({
    queryKey: ['lb-games'],
    queryFn: () => fetch('/api/games').then(r => r.json()).then(d => d.games || d || []),
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard', gameFilter, period],
    queryFn: () => {
      const params = new URLSearchParams();
      if (gameFilter !== 'all') params.set('gameId', gameFilter);
      params.set('period', period);
      return fetch(`/api/leaderboard?${params}`).then(r => r.json()).then(d => d.leaderboard || d || []);
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-arena-accent" /> Leaderboard
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-1 bg-arena-card rounded-xl p-1 border border-arena-border">
          <button onClick={() => setGameFilter('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200', gameFilter === 'all' ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-white')}>All Games</button>
          {games?.map((g: any) => (
            <button key={g.id} onClick={() => setGameFilter(g.id)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap', gameFilter === g.id ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-white')}>{g.name}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-arena-card rounded-xl p-1 border border-arena-border">
          {['all_time', 'monthly', 'weekly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200', period === p ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-white')}>
              {p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LeaderboardSkeleton />
      ) : entries && entries.length > 0 ? (
        <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-arena-border">
                  <th className="text-left px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider">Rank</th>
                  <th className="text-left px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider">Player</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider">Points</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider hidden md:table-cell">Wins</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider hidden md:table-cell">Matches</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider hidden lg:table-cell">K/D</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider hidden lg:table-cell">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any, idx: number) => {
                  const league = LEAGUE_CONFIG[entry.player?.league] || LEAGUE_CONFIG.bronze;
                  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                  return (
                    <tr key={entry.id || idx} className="border-b border-arena-border/50 hover:bg-arena-card-hover transition-colors duration-150">
                      <td className="px-4 py-3">
                        <span className={cn('font-bold', idx < 3 ? 'text-lg' : 'text-sm')} style={{ color: idx < 3 ? rankColors[idx] : undefined }}>
                          {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx + 1}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arena-accent/20 to-arena-purple/20 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {entry.player?.avatarUrl ? <img src={entry.player.avatarUrl} alt={`${entry.player.username}'s avatar`} className="w-full h-full object-cover" /> : (entry.player?.username || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{entry.player?.username || 'Unknown'}</div>
                            <div className="text-xs font-medium" style={{ color: league.color }}>{league.icon} {league.label}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{entry.totalPoints || 0}</td>
                      <td className="px-4 py-3 text-right text-sm text-arena-text-secondary hidden md:table-cell">{entry.totalWins || 0}</td>
                      <td className="px-4 py-3 text-right text-sm text-arena-text-secondary hidden md:table-cell">{entry.totalMatches || 0}</td>
                      <td className="px-4 py-3 text-right text-sm text-arena-text-secondary hidden lg:table-cell">{(entry.kdRatio || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm hidden lg:table-cell">
                        <span className={cn((entry.winRate || 0) >= 50 ? 'text-arena-success' : 'text-arena-text-secondary')}>
                          {(entry.winRate || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Award className="w-12 h-12 mx-auto mb-4 text-arena-text-muted/30" />
          <p className="text-arena-text-muted">No leaderboard data yet</p>
          <p className="text-xs text-arena-text-muted mt-1">Play tournaments to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
}

// ==================== STREAMS VIEW ====================

function StreamsView() {
  const { data: streams, isLoading } = useQuery({
    queryKey: ['all-streams'],
    queryFn: () => fetch('/api/streams').then(r => r.json()).then(d => d.streams || d || []),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Tv className="w-6 h-6 text-arena-accent" /> Live Streams
      </h1>
      {isLoading ? (
        <StreamsSkeleton />
      ) : streams && streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streams.map((s: any) => (
            <div key={s.id} onClick={() => s.streamUrl && window.open(s.streamUrl, '_blank')} className="bg-arena-card border border-arena-border rounded-xl p-5 hover:border-arena-accent/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', s.status === 'live' ? 'bg-arena-accent text-white flex items-center gap-1' : 'bg-arena-info/20 text-arena-info')}>
                  {s.status === 'live' && <CircleDot className="w-3 h-3 animate-pulse" />}
                  {s.status.toUpperCase()}
                </span>
                <span className="text-xs text-arena-text-muted capitalize bg-arena-surface px-2 py-0.5 rounded-full">{s.platform}</span>
              </div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-arena-text-secondary mb-3 line-clamp-2">{s.description}</p>
              <div className="flex items-center justify-between text-xs text-arena-text-muted">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(s.scheduledStart)}</span>
                {s.peakViewers > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {s.peakViewers} viewers</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Tv className="w-12 h-12 mx-auto mb-4 text-arena-text-muted/30" />
          <p className="text-arena-text-muted">No streams scheduled</p>
          <p className="text-xs text-arena-text-muted mt-1">Stay tuned for upcoming streams!</p>
        </div>
      )}
    </div>
  );
}

// ==================== PROFILE VIEW ====================

function ProfileView() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const { navigate } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => fetch('/api/profiles/me').then(r => r.json()),
    enabled: isAuthenticated,
  });

  const { data: registrations } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => fetch('/api/registrations').then(r => r.json()).then(d => d.registrations || d || []),
    enabled: isAuthenticated,
  });

  const startEditing = () => {
    if (profile) setForm({ displayName: profile.displayName || '', bio: profile.bio || '' });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile || data);
        setEditing(false);
        toast.success('Profile updated!');
        refetch();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* continue logout regardless */ }
    logout();
    navigate('landing');
  };

  if (!isAuthenticated) return null;
  if (isLoading) return <ProfileSkeleton />;

  const p = profile || user;
  const league = LEAGUE_CONFIG[p?.league || 'bronze'] || LEAGUE_CONFIG.bronze;

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-br from-arena-accent/20 via-arena-purple/15 to-arena-surface" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 border-4 border-arena-card flex items-center justify-center text-2xl font-bold overflow-hidden">
              {p?.avatarUrl ? <img src={p.avatarUrl} alt={`${p.username}'s avatar`} className="w-full h-full object-cover" /> : (p?.username || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{p?.displayName || p?.username}</h1>
                <span className="text-sm font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: league.color + '20', color: league.color }}>
                  {league.icon} {league.label}
                </span>
              </div>
              <p className="text-sm text-arena-text-muted">@{p?.username}</p>
            </div>
            <button onClick={() => editing ? setEditing(false) : startEditing()} className="p-2 rounded-xl border border-arena-border hover:border-arena-accent/50 transition-colors duration-150">
              <Pencil className="w-4 h-4 text-arena-text-secondary" />
            </button>
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="bg-arena-surface rounded-xl p-4 mb-4 space-y-3 animate-fade-in">
              <div>
                <label className="text-xs text-arena-text-muted mb-1 block">Display Name</label>
                <input type="text" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                  className="w-full bg-arena-dark border border-arena-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arena-accent" />
              </div>
              <div>
                <label className="text-xs text-arena-text-muted mb-1 block">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                  className="w-full bg-arena-dark border border-arena-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-arena-accent resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-arena-accent text-white text-xs font-semibold rounded-lg disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 border border-arena-border text-xs font-medium rounded-lg hover:border-white transition-colors duration-150">Cancel</button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Tournaments', value: p?.totalTournamentsPlayed || 0, icon: Trophy },
              { label: 'Wins', value: p?.totalWins || 0, icon: Crown },
              { label: 'Kills', value: p?.totalKills || 0, icon: Target },
              { label: 'Prize Won', value: paiseToRupee(p?.totalPrizeWon || 0), icon: Coins },
            ].map(stat => (
              <div key={stat.label} className="bg-arena-surface rounded-xl p-3 text-center">
                <stat.icon className="w-4 h-4 text-arena-accent mx-auto mb-1" />
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-[10px] text-arena-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          {p?.bio && <p className="text-sm text-arena-text-secondary">{p.bio}</p>}
        </div>
      </div>

      {/* My Tournaments */}
      <div className="bg-arena-card border border-arena-border rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4">My Tournaments</h2>
        {registrations && registrations.length > 0 ? (
          <div className="space-y-2">
            {registrations.map((r: any) => (
              <div key={r.id} onClick={() => navigate('tournament-detail', { id: r.tournamentId })}
                className="flex items-center justify-between bg-arena-surface rounded-xl p-3 cursor-pointer hover:bg-arena-card-hover transition-colors duration-150">
                <div>
                  <div className="font-medium text-sm">{r.tournament?.title || 'Unknown Tournament'}</div>
                  <div className="text-xs text-arena-text-muted">{r.tournament?.game?.name} • {formatDate(r.createdAt)}</div>
                </div>
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full',
                  r.paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' :
                  r.paymentStatus === 'pending' ? 'bg-arena-warning/20 text-arena-warning' :
                  r.paymentStatus === 'failed' ? 'bg-arena-accent/20 text-arena-accent' : 'bg-arena-surface text-arena-text-muted'
                )}>
                  {r.paymentStatus.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-arena-text-muted text-center py-4">No tournament registrations yet</p>
        )}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="flex items-center gap-2 text-arena-text-muted hover:text-arena-accent text-sm transition-colors duration-150">
        <LogOut className="w-4 h-4" /> Log Out
      </button>
    </div>
  );
}

// ==================== NOTIFICATIONS VIEW ====================

function NotificationsView() {
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()).then(d => d.notifications || d || []),
  });

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (!res.ok) {
        toast.error('Failed to mark notifications as read');
        return;
      }
      refetch();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  if (isLoading) return <NotificationsSkeleton />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="w-6 h-6 text-arena-accent" /> Notifications</h1>
        {notifications && notifications.some((n: any) => !n.isRead) && (
          <button onClick={markAllRead} className="text-xs text-arena-accent hover:underline">Mark all as read</button>
        )}
      </div>
      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id} className={cn('bg-arena-card border rounded-xl p-4 transition-all duration-200', !n.isRead ? 'border-arena-accent/30 bg-arena-accent/5' : 'border-arena-border')}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  <p className="text-xs text-arena-text-secondary mt-1">{n.message}</p>
                </div>
                <span className="text-[10px] text-arena-text-muted whitespace-nowrap ml-4">{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 mx-auto mb-4 text-arena-text-muted/30" />
          <p className="text-arena-text-muted">No notifications</p>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN VIEWS ====================

function AdminDashboardView() {
  const { user } = useAuthStore();
  const { navigate } = useAppStore();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
  });

  if (!user?.isAdmin) return <div className="text-center py-20 text-arena-text-muted">Access Denied</div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-arena-info' },
    { label: 'Active Tournaments', value: stats?.activeTournaments || 0, icon: Trophy, color: 'text-arena-success' },
    { label: 'Pending Verifications', value: stats?.pendingVerifications || 0, icon: Clock, color: 'text-arena-warning' },
    { label: 'Total Revenue', value: paiseToRupee(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-arena-accent' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="bg-arena-card border border-arena-border rounded-xl p-5">
            <card.icon className={cn('w-6 h-6 mb-3', card.color)} />
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs text-arena-text-muted">{card.label}</div>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Manage Tournaments', icon: Trophy, view: 'admin-tournaments' as ViewName },
          { label: 'Verify Payments', icon: CheckCircle2, view: 'admin-registrations' as ViewName },
          { label: 'Manage Games', icon: Gamepad2, view: 'admin-games' as ViewName },
          { label: 'Manage Streams', icon: Tv, view: 'admin-streams' as ViewName },
          { label: 'Manage Affiliates', icon: Link2, view: 'admin-affiliates' as ViewName },
          { label: '⚡ Top Up Packs', icon: Zap, view: 'admin-topup' as ViewName },
          { label: '📊 Analytics', icon: BarChart3, view: 'admin-analytics' as ViewName },
          { label: 'Platform Settings', icon: Settings, view: 'admin-settings' as ViewName },
        ].map(action => (
          <button key={action.label} onClick={() => navigate(action.view)}
            className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center gap-3 hover:border-arena-accent/30 transition-all duration-200 hover:-translate-y-0.5 text-left">
            <action.icon className="w-5 h-5 text-arena-accent" />
            <span className="text-sm font-medium">{action.label}</span>
            <ChevronRight className="w-4 h-4 text-arena-text-muted ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN TOURNAMENTS VIEW ====================

function AdminTournamentsView() {
  const { navigate } = useAppStore();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: tournaments, refetch } = useQuery({
    queryKey: ['admin-tournaments', statusFilter],
    queryFn: () => fetch(`/api/admin/tournaments${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.json()).then(d => d.tournaments || d || []),
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tournament?')) return;
    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to delete tournament');
        return;
      }
      refetch();
      toast.success('Tournament deleted');
    } catch {
      toast.error('Failed to delete tournament');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Tournaments</h1>
        </div>
        <button onClick={() => navigate('admin-tournament-create')} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['', 'registration_open', 'in_progress', 'upcoming', 'completed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200',
              statusFilter === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary')}>
            {s === '' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {tournaments?.map((t: any) => (
          <div key={t.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between hover:border-arena-accent/30 transition-all duration-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{t.title}</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', getStatusBg(t.status))}>{t.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-xs text-arena-text-muted">{t.game?.name} • {paiseToRupee(t.entryFee)} • {t.registeredPlayers}/{t.maxPlayers} players</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button onClick={() => navigate('tournament-detail', { id: t.id })} aria-label="View tournament" className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150"><Eye className="w-4 h-4 text-arena-text-muted" /></button>
              <button onClick={() => handleDelete(t.id)} aria-label="Delete tournament" className="p-1.5 rounded-lg hover:bg-arena-accent/10 transition-colors duration-150"><Trash2 className="w-4 h-4 text-arena-text-muted hover:text-arena-accent" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN TOURNAMENT CREATE VIEW ====================

function AdminTournamentCreateView() {
  const { navigate } = useAppStore();
  const { data: games } = useQuery({ queryKey: ['admin-games'], queryFn: () => fetch('/api/games').then(r => r.json()).then(d => d.games || d || []) });
  const [form, setForm] = useState({ title: '', description: '', gameId: '', format: 'solo', entryFee: '0', prizePool: '0', maxPlayers: '100', startTime: '', customRules: '', isFeatured: false, roomId: '', roomPassword: '', map: '', matchMode: '', bannerImageUrl: '' });
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          entryFee: Math.round(Number(form.entryFee) * 100),
          prizePool: Math.round(Number(form.prizePool) * 100),
          maxPlayers: Number(form.maxPlayers),
          startTime: form.startTime || null,
        }),
      });
      if (res.ok) {
        toast.success('Tournament created!');
        navigate('admin-tournaments');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create tournament');
      }
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150";
  const labelClass = "text-xs text-arena-text-secondary mb-1 block";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('admin-tournaments')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Create Tournament</h1>
      </div>
      <form onSubmit={handleCreate} className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4 max-w-2xl">
        <div><label className={labelClass}>Title *</label><input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Game *</label><select required value={form.gameId} onChange={e => setForm({ ...form, gameId: e.target.value })} className={inputClass}><option value="">Select Game</option>{games?.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <div><label className={labelClass}>Format</label><select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })} className={inputClass}>{['solo','duo','squad','custom'].map(f => <option key={f} value={f}>{getFormatLabel(f)}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className={labelClass}>Entry Fee (₹)</label><input type="number" min="0" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Prize Pool (₹)</label><input type="number" min="0" value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Max Players *</label><input type="number" required min="2" value={form.maxPlayers} onChange={e => setForm({ ...form, maxPlayers: e.target.value })} className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Start Time</label><input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Map</label><input type="text" value={form.map} onChange={e => setForm({ ...form, map: e.target.value })} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} /></div>
        <div><label className={labelClass}>Custom Rules</label><textarea rows={3} value={form.customRules} onChange={e => setForm({ ...form, customRules: e.target.value })} className={cn(inputClass, 'resize-none')} /></div>
        <div><label className={labelClass}>Banner Image URL</label><input type="url" value={form.bannerImageUrl} onChange={e => setForm({ ...form, bannerImageUrl: e.target.value })} className={inputClass} placeholder="https://example.com/banner.jpg" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Room ID</label><input type="text" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Room Password</label><input type="text" value={form.roomPassword} onChange={e => setForm({ ...form, roomPassword: e.target.value })} className={inputClass} /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-arena-accent" />
          <span className="text-sm">Mark as Featured</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Creating...' : 'Create Tournament'}</button>
          <button type="button" onClick={() => navigate('admin-tournaments')} className="px-6 py-2.5 h-11 border border-arena-border rounded-xl text-sm font-medium hover:border-white transition-colors duration-150">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ==================== ADMIN REGISTRATIONS VIEW ====================

function AdminRegistrationsView() {
  const { navigate } = useAppStore();
  const [filter, setFilter] = useState('pending');

  const { data: registrations, refetch } = useQuery({
    queryKey: ['admin-registrations', filter],
    queryFn: () => fetch(`/api/admin/registrations?status=${filter}`).then(r => r.json()).then(d => d.registrations || d || []),
  });

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}/verify`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to verify payment');
        return;
      }
      refetch();
      toast.success('Payment verified!');
    } catch {
      toast.error('Failed to verify payment');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}/reject`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to reject payment');
        return;
      }
      refetch();
      toast.success('Payment rejected');
    } catch {
      toast.error('Failed to reject payment');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Payment Verifications</h1>
      </div>
      <div className="flex gap-2 mb-4">
        {['pending', 'verified', 'failed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
              filter === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary')}>
            {s.replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>
      {registrations && registrations.length > 0 ? (
        <div className="space-y-2">
          {registrations.map((r: any) => (
            <div key={r.id} className="bg-arena-card border border-arena-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-arena-accent/10 flex items-center justify-center text-xs font-bold">{(r.player?.username || '?')[0].toUpperCase()}</div>
                  <div>
                    <div className="font-medium text-sm">{r.player?.username || 'Unknown'}</div>
                    <div className="text-xs text-arena-text-muted">{r.tournament?.title}</div>
                  </div>
                </div>
                <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full',
                  r.paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' :
                  r.paymentStatus === 'pending' ? 'bg-arena-warning/20 text-arena-warning' : 'bg-arena-accent/20 text-arena-accent'
                )}>{r.paymentStatus}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-arena-text-muted mb-2">
                <span>Amount: {paiseToRupee(r.paidAmount)}</span>
                {r.paymentReference && <span>Ref: {r.paymentReference}</span>}
                <span>{timeAgo(r.createdAt)}</span>
              </div>
              {r.paymentStatus === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-arena-success/20 text-arena-success text-xs font-medium rounded-lg hover:bg-arena-success/30 transition-colors duration-150"><CheckCircle2 className="w-3 h-3" /> Verify</button>
                  <button onClick={() => handleReject(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-arena-accent/20 text-arena-accent text-xs font-medium rounded-lg hover:bg-arena-accent/30 transition-colors duration-150"><XCircle className="w-3 h-3" /> Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-arena-text-muted">No registrations found</div>
      )}
    </div>
  );
}

// ==================== ADMIN GAMES VIEW ====================

function AdminGamesView() {
  const { navigate } = useAppStore();
  const { data: games, refetch } = useQuery({
    queryKey: ['admin-games-list'],
    queryFn: () => fetch('/api/admin/games').then(r => r.json()).then(d => d.games || d || []),
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: '', slug: '', iconUrl: '', bannerUrl: '', maxTeamSize: 1, description: '', isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (game: any) => { setForm({ name: game.name, slug: game.slug, iconUrl: game.iconUrl || '', bannerUrl: game.bannerUrl || '', maxTeamSize: game.maxTeamSize, description: game.description || '', isActive: game.isActive, sortOrder: game.sortOrder }); setEditing(game); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/games/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to update game'); setSaving(false); return; }
        toast.success('Game updated!');
      } else {
        const res = await fetch('/api/admin/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to create game'); setSaving(false); return; }
        toast.success('Game created!');
      }
      setShowModal(false);
      refetch();
    } catch { toast.error('Failed to save game'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this game? This may affect associated tournaments.')) return;
    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to delete game'); return; }
      toast.success('Game deleted');
      refetch();
    } catch { toast.error('Failed to delete game'); }
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors duration-150";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Games</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" /> Add Game
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {games?.map((g: any) => (
          <div key={g.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center gap-4 hover:border-arena-accent/30 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0">
              {g.iconUrl ? <img src={g.iconUrl} alt={g.name} className="w-8 h-8 object-contain rounded-lg" /> : <Gamepad2 className="w-6 h-6 text-arena-accent" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{g.name}</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', g.isActive ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-text-muted/20 text-arena-text-muted')}>{g.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <p className="text-xs text-arena-text-muted">{g.slug} • Max Team: {g.maxTeamSize} • Sort: {g.sortOrder}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Edit game"><Pencil className="w-3.5 h-3.5 text-arena-text-muted" /></button>
              <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors duration-150" aria-label="Delete game"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editing ? 'Edit Game' : 'New Game'}</h2>
              <button onClick={() => setShowModal(false)} className="text-arena-text-muted hover:text-white" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="BGMI" /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Slug *</label><input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/\s/g, '').toLowerCase() })} className={inputClass} placeholder="bgmi" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Icon URL</label><input type="url" value={form.iconUrl} onChange={e => setForm({ ...form, iconUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Banner URL</label><input type="url" value={form.bannerUrl} onChange={e => setForm({ ...form, bannerUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
              </div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} placeholder="Game description" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Max Team Size</label><input type="number" min={1} value={form.maxTeamSize} onChange={e => setForm({ ...form, maxTeamSize: parseInt(e.target.value) || 1 })} className={inputClass} /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-arena-accent" />
                <span className="text-sm text-arena-text-secondary">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 h-10 border border-arena-border hover:border-arena-accent/50 text-white font-medium rounded-xl transition-all duration-200 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN STREAMS VIEW ====================

function AdminStreamsView() {
  const { navigate } = useAppStore();
  const { data: streams, refetch } = useQuery({
    queryKey: ['admin-streams-list'],
    queryFn: () => fetch('/api/admin/streams').then(r => r.json()).then(d => d.streams || d || []),
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { title: '', description: '', platform: '', streamUrl: '', thumbnailUrl: '', scheduledStart: '', scheduledEnd: '', isFeatured: false, status: 'scheduled' };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (s: any) => { setForm({ title: s.title, description: s.description || '', platform: s.platform || '', streamUrl: s.streamUrl || '', thumbnailUrl: s.thumbnailUrl || '', scheduledStart: s.scheduledStart ? new Date(s.scheduledStart).toISOString().slice(0, 16) : '', scheduledEnd: s.scheduledEnd ? new Date(s.scheduledEnd).toISOString().slice(0, 16) : '', isFeatured: s.isFeatured || false, status: s.status || 'scheduled' }); setEditing(s); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title || !form.scheduledStart) { toast.error('Title and scheduled start are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/streams/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to update stream'); setSaving(false); return; }
        toast.success('Stream updated!');
      } else {
        const res = await fetch('/api/admin/streams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to create stream'); setSaving(false); return; }
        toast.success('Stream created!');
      }
      setShowModal(false);
      refetch();
    } catch { toast.error('Failed to save stream'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this stream?')) return;
    try {
      const res = await fetch(`/api/admin/streams/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to delete stream'); return; }
      toast.success('Stream deleted');
      refetch();
    } catch { toast.error('Failed to delete stream'); }
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors duration-150";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Stream Management</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" /> Add Stream
        </button>
      </div>
      <div className="space-y-3">
        {streams?.map((s: any) => (
          <div key={s.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between hover:border-arena-accent/30 transition-all duration-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{s.title}</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', s.status === 'live' ? 'bg-arena-accent text-white' : 'bg-arena-info/20 text-arena-info')}>{s.status.toUpperCase()}</span>
                {s.isFeatured && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-arena-warning/20 text-arena-warning flex-shrink-0">Featured</span>}
              </div>
              <p className="text-xs text-arena-text-muted">{s.platform} • {formatDateTime(s.scheduledStart)} • {s.peakViewers} peak viewers</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              {s.streamUrl && <a href={s.streamUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Open stream"><ExternalLink className="w-3.5 h-3.5 text-arena-text-muted" /></a>}
              <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Edit stream"><Pencil className="w-3.5 h-3.5 text-arena-text-muted" /></button>
              <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors duration-150" aria-label="Delete stream"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editing ? 'Edit Stream' : 'New Stream'}</h2>
              <button onClick={() => setShowModal(false)} className="text-arena-text-muted hover:text-white" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Title *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Stream title" /></div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} placeholder="Stream description" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Platform</label><select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={inputClass}><option value="">Select</option><option value="youtube">YouTube</option><option value="twitch">Twitch</option><option value="facebook">Facebook</option><option value="other">Other</option></select></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}><option value="scheduled">Scheduled</option><option value="live">Live</option><option value="ended">Ended</option><option value="cancelled">Cancelled</option></select></div>
              </div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Stream URL</label><input type="url" value={form.streamUrl} onChange={e => setForm({ ...form, streamUrl: e.target.value })} className={inputClass} placeholder="https://youtube.com/watch?v=..." /></div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Thumbnail URL</label><input type="url" value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Scheduled Start *</label><input type="datetime-local" value={form.scheduledStart} onChange={e => setForm({ ...form, scheduledStart: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Scheduled End</label><input type="datetime-local" value={form.scheduledEnd} onChange={e => setForm({ ...form, scheduledEnd: e.target.value })} className={inputClass} /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-arena-accent" />
                <span className="text-sm text-arena-text-secondary">Featured</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 h-10 border border-arena-border hover:border-arena-accent/50 text-white font-medium rounded-xl transition-all duration-200 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN AFFILIATES VIEW ====================

function AdminAffiliatesView() {
  const { navigate } = useAppStore();
  const { data: affiliates, refetch } = useQuery({
    queryKey: ['admin-affiliates-list'],
    queryFn: () => fetch('/api/admin/affiliates').then(r => r.json()).then(d => d.affiliates || d || []),
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: '', platform: '', url: '', slug: '', description: '', category: '', imageUrl: '', price: 0, originalPrice: 0, isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (a: any) => { setForm({ name: a.name, platform: a.platform || '', url: a.url, slug: a.slug, description: a.description || '', category: a.category || '', imageUrl: a.imageUrl || '', price: a.price || 0, originalPrice: a.originalPrice || 0, isActive: a.isActive, sortOrder: a.sortOrder || 0 }); setEditing(a); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.url || !form.slug) { toast.error('Name, URL, and slug are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/affiliates/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to update affiliate'); setSaving(false); return; }
        toast.success('Affiliate updated!');
      } else {
        const res = await fetch('/api/admin/affiliates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to create affiliate'); setSaving(false); return; }
        toast.success('Affiliate created!');
      }
      setShowModal(false);
      refetch();
    } catch { toast.error('Failed to save affiliate'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this affiliate?')) return;
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error || 'Failed to delete affiliate'); return; }
      toast.success('Affiliate deleted');
      refetch();
    } catch { toast.error('Failed to delete affiliate'); }
  };

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors duration-150";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Affiliate Links</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200">
          <Plus className="w-4 h-4" /> Add Affiliate
        </button>
      </div>
      <div className="space-y-2">
        {affiliates?.map((a: any) => (
          <div key={a.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between hover:border-arena-accent/30 transition-all duration-200">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {a.imageUrl ? <img src={a.imageUrl} alt={a.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0"><ShoppingBag className="w-5 h-5 text-arena-accent" /></div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{a.name}</h3>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', a.isActive ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-text-muted/20 text-arena-text-muted')}>{a.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-xs text-arena-text-muted">{a.platform} • {paiseToRupee(a.price)}{a.originalPrice > a.price ? ` (was ${paiseToRupee(a.originalPrice)})` : ''} • {a.clicks} clicks</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-3">
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Open affiliate link"><ExternalLink className="w-3.5 h-3.5 text-arena-text-muted" /></a>
              <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors duration-150" aria-label="Edit affiliate"><Pencil className="w-3.5 h-3.5 text-arena-text-muted" /></button>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors duration-150" aria-label="Delete affiliate"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editing ? 'Edit Affiliate' : 'New Affiliate'}</h2>
              <button onClick={() => setShowModal(false)} className="text-arena-text-muted hover:text-white" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Name *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Product name" /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Slug *</label><input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/\s/g, '-').toLowerCase() })} className={inputClass} placeholder="product-slug" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Platform</label><input type="text" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className={inputClass} placeholder="Amazon" /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Category</label><input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass} placeholder="Gaming" /></div>
              </div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">URL *</label><input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className={inputClass} placeholder="https://amazon.in/..." /></div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Image URL</label><input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className={inputClass} placeholder="https://..." /></div>
              <div><label className="text-xs text-arena-text-secondary mb-1 block">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={cn(inputClass, 'resize-none')} placeholder="Product description" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Price (₹ paise)</label><input type="number" min={0} value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className={inputClass} placeholder="49900 = ₹499" /></div>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Original Price (₹ paise)</label><input type="number" min={0} value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: parseInt(e.target.value) || 0 })} className={inputClass} placeholder="99900 = ₹999" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-arena-accent" />
                  <span className="text-sm text-arena-text-secondary">Active</span>
                </label>
                <div><label className="text-xs text-arena-text-secondary mb-1 block">Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className={inputClass} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 h-10 border border-arena-border hover:border-arena-accent/50 text-white font-medium rounded-xl transition-all duration-200 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN SETTINGS VIEW ====================

function AdminSettingsView() {
  const { navigate } = useAppStore();
  const [saving, setSaving] = useState(false);

  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => fetch('/api/admin/settings').then(r => r.json()).then(d => d.settings || d || {}),
  });

  const [localSettings, setLocalSettings] = useState<Record<string, string> | null>(null);
  const settings = localSettings !== null ? localSettings : ((fetchedSettings || {}) as Record<string, string>);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Platform Settings</h1>
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-arena-card border border-arena-border rounded-xl h-12" />)}
        </div>
      ) : (
        <div className="bg-arena-card border border-arena-border rounded-2xl p-6 space-y-4 max-w-xl">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key}>
              <label className="text-xs text-arena-text-secondary mb-1 block">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
              <input type="text" value={value} onChange={e => setLocalSettings({ ...settings, [key]: e.target.value })}
                className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" />
            </div>
          ))}
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN TOP UP PACKS VIEW ====================

function AdminTopupView() {
  const { navigate } = useAppStore();
  const { data: packs, refetch } = useQuery({
    queryKey: ['admin-topup-packs'],
    queryFn: () => fetch('/api/admin/topup-packs').then(r => r.json()).then(d => d.packs || []),
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editingPack, setEditingPack] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { gameName: '', gameSlug: '', packName: '', description: '', price: 0, originalPrice: 0, imageUrl: '', affiliateUrl: '', isPopular: false, isActive: true, sortOrder: 0 };
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditingPack(null); setShowCreate(true); };
  const openEdit = (pack: any) => { setForm(pack); setEditingPack(pack); setShowCreate(true); };

  const handleSave = async () => {
    if (!form.gameName || !form.gameSlug || !form.packName) { toast.error('Game name, slug, and pack name are required'); return; }
    setSaving(true);
    try {
      if (editingPack) {
        await fetch(`/api/admin/topup-packs/${editingPack.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Pack updated!');
      } else {
        await fetch('/api/admin/topup-packs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Pack created!');
      }
      setShowCreate(false);
      refetch();
    } catch { toast.error('Failed to save pack'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pack?')) return;
    try {
      await fetch(`/api/admin/topup-packs/${id}`, { method: 'DELETE' });
      toast.success('Pack deleted');
      refetch();
    } catch { toast.error('Failed to delete pack'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">⚡ Top Up Packs</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-medium rounded-xl transition-all duration-200 text-sm">
          <Plus className="w-4 h-4" /> Add Pack
        </button>
      </div>

      <div className="space-y-2">
        {packs?.map((pack: any) => (
          <div key={pack.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-arena-warning/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-arena-warning" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-medium text-sm">{pack.gameName} — {pack.packName}</h3>
                  {pack.isPopular && <span className="text-[10px] bg-arena-warning/20 text-arena-warning px-1.5 py-0.5 rounded-full">🔥 Popular</span>}
                </div>
                <p className="text-xs text-arena-text-muted">₹{(pack.price / 100).toLocaleString('en-IN')}{pack.originalPrice > pack.price ? ` (was ₹${(pack.originalPrice / 100).toLocaleString('en-IN')})` : ''} • Sort: {pack.sortOrder}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', pack.isActive ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-text-muted/20 text-arena-text-muted')}>{pack.isActive ? 'Active' : 'Inactive'}</span>
              <button onClick={() => openEdit(pack)} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors"><Pencil className="w-3.5 h-3.5 text-arena-text-muted" /></button>
              <button onClick={() => handleDelete(pack.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editingPack ? 'Edit Pack' : 'New Pack'}</h2>
              <button onClick={() => setShowCreate(false)} className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Game Name *</label>
                  <input type="text" value={form.gameName} onChange={e => setForm({ ...form, gameName: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="BGMI" />
                </div>
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Game Slug *</label>
                  <input type="text" value={form.gameSlug} onChange={e => setForm({ ...form, gameSlug: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="bgmi" />
                </div>
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Pack Name *</label>
                <input type="text" value={form.packName} onChange={e => setForm({ ...form, packName: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="60 UC" />
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="Basic currency pack" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Price (₹ paise) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: parseInt(e.target.value) || 0 })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Original Price (₹ paise)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: parseInt(e.target.value) || 0 })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs text-arena-text-secondary mb-1 block">Affiliate URL (Codashop)</label>
                <input type="url" value={form.affiliateUrl} onChange={e => setForm({ ...form, affiliateUrl: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="https://www.codashop.com/in/bgmi" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isPopular" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} className="accent-arena-accent" />
                  <label htmlFor="isPopular" className="text-xs text-arena-text-secondary">Popular</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-arena-accent" />
                  <label htmlFor="isActive" className="text-xs text-arena-text-secondary">Active</label>
                </div>
                <div>
                  <label className="text-xs text-arena-text-secondary mb-1 block">Sort</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-arena-accent transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 h-10 border border-arena-border hover:border-arena-accent/50 text-white font-medium rounded-xl transition-all duration-200 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">{saving ? 'Saving...' : editingPack ? 'Update' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADMIN ANALYTICS VIEW ====================

function AdminAnalyticsView() {
  const { navigate } = useAppStore();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(r => r.json()),
    refetchInterval: 120000,
  });

  const d = data?.overview;
  const STATUS_COLORS: Record<string, string> = {
    upcoming: '#00aaff',
    registration_open: '#00ff88',
    ongoing: '#ffaa00',
    live: '#ff4444',
    completed: '#22c55e',
    cancelled: '#666666',
  };
  const LEAGUE_COLORS: Record<string, string> = {
    bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700',
    platinum: '#00bcd4', diamond: '#b9f2ff', master: '#aa44ff',
    grandmaster: '#ff44ff', legend: '#ff6600',
  };

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">📊 Analytics Dashboard</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1,2,3,4,5,6].map(i => <div key={i} className="bg-arena-card border border-arena-border rounded-xl p-4"><Skeleton className="h-4 w-16 mb-2" /><Skeleton className="h-6 w-24" /></div>)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">📊 Analytics Dashboard</h1>
        <span className="text-[10px] bg-arena-accent/20 text-arena-accent font-medium px-2 py-0.5 rounded-full">Live</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Players', value: d?.totalPlayers?.toLocaleString(), icon: Users, color: 'text-arena-accent', bg: 'bg-arena-accent/10' },
          { label: 'Total Revenue', value: `₹${((d?.totalRevenue || 0) / 100).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-arena-success', bg: 'bg-arena-success/10' },
          { label: 'Active Tours', value: String(d?.activeTournaments || 0), icon: Trophy, color: 'text-arena-warning', bg: 'bg-arena-warning/10' },
          { label: 'Registrations', value: `${d?.todayRegistrations || 0} today`, sub: `${d?.weekRegistrations || 0}/wk ${d?.monthRegistrations || 0}/mo`, icon: User, color: 'text-arena-info', bg: 'bg-arena-info/10' },
          { label: 'Avg. Value', value: paiseToRupee(d?.avgRegistrationValue || 0), icon: TrendingUp, color: 'text-arena-purple', bg: 'bg-arena-purple/10' },
          { label: 'Live Streams', value: String(d?.liveStreams || 0), icon: Tv, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-arena-card border border-arena-border rounded-xl p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', kpi.bg)}>
              <kpi.icon className={cn('w-4 h-4', kpi.color)} />
            </div>
            <p className="text-lg font-bold">{kpi.value}</p>
            <p className="text-[10px] text-arena-text-muted">{kpi.label}</p>
            {kpi.sub && <p className="text-[9px] text-arena-text-muted mt-0.5">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-arena-card border border-arena-border rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4">Revenue & Registrations (12 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenueByMonth || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v: number) => `₹${(v / 100).toLocaleString('en-IN')}`} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                formatter={(value: number) => [`₹${(value / 100).toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#00ff88" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two columns: Games + Status */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Registrations by Game */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Registrations by Game</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.registrationsByGame || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: '#666', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis dataKey="game" type="category" tick={{ fill: '#999', fontSize: 11 }} width={80} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="registrations" fill="#00ff88" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tournaments by Status */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Tournaments by Status</h3>
          <div className="h-52 flex items-center justify-center">
            {(data?.tournamentsByStatus || []).length === 0 ? (
              <p className="text-sm text-arena-text-muted">No tournament data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={(data?.tournamentsByStatus || []).map((s: any) => ({ ...s, name: s.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }))} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" paddingAngle={2}>
                    {(data?.tournamentsByStatus || []).map((s: any, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[s.status] || '#666'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {(data?.tournamentsByStatus || []).map((s: any) => (
              <span key={s.status} className="flex items-center gap-1.5 text-[10px] text-arena-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[s.status] || '#666' }} />
                {s.status.replace(/_/g, ' ')} ({s.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Three columns: Top Players + League + Activity */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Top Players */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">🏆 Top Players</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(data?.topPlayers || []).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-arena-surface/50 transition-colors duration-200">
                <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-amber-700/20 text-amber-500' : 'bg-arena-surface text-arena-text-muted'
                )}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.player?.displayName || p.player?.username}</p>
                  <p className="text-[10px] text-arena-text-muted">{p.totalWins}W / {p.totalMatches}M • KD: {p.kdRatio}</p>
                </div>
                <span className="text-xs font-semibold text-arena-accent">{p.totalPoints.toLocaleString()}</span>
              </div>
            ))}
            {(!data?.topPlayers || data.topPlayers.length === 0) && <p className="text-xs text-arena-text-muted text-center py-4">No data yet</p>}
          </div>
        </div>

        {/* League Distribution */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">League Distribution</h3>
          <div className="h-48 flex items-center justify-center">
            {(data?.leagueDistribution || []).length === 0 ? (
              <p className="text-sm text-arena-text-muted">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.leagueDistribution || []} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="count" paddingAngle={2}>
                    {(data?.leagueDistribution || []).map((l: any, i: number) => (
                      <Cell key={i} fill={LEAGUE_COLORS[l.league] || '#666'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {(data?.leagueDistribution || []).slice(0, 6).map((l: any) => (
              <span key={l.league} className="flex items-center gap-1.5 text-[10px] text-arena-text-secondary">
                <span className="w-2 h-2 rounded-full" style={{ background: LEAGUE_COLORS[l.league] || '#666' }} />
                {l.league} ({l.count})
              </span>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">📋 Recent Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(data?.recentActivity || []).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-arena-surface/30">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                  a.paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' : a.paymentStatus === 'pending' ? 'bg-arena-warning/20 text-arena-warning' : 'bg-red-400/20 text-red-400'
                )}>
                  {a.paymentStatus === 'verified' ? '✓' : a.paymentStatus === 'pending' ? '⏳' : '✗'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{a.player?.displayName || a.player?.username}</p>
                  <p className="text-[10px] text-arena-text-muted truncate">{a.tournament?.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold">{paiseToRupee(a.paidAmount)}</p>
                  <p className="text-[10px] text-arena-text-muted">{timeAgo(a.createdAt)}</p>
                </div>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && <p className="text-xs text-arena-text-muted text-center py-4">No activity yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== LEGAL PAGES ====================

function LegalPageWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  const { navigate } = useAppStore();
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-arena-text-muted hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{title}</h1>
      <div className="bg-arena-card border border-arena-border rounded-2xl p-6 md:p-8 prose-sm text-arena-text-secondary leading-relaxed space-y-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-arena-text-primary [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-arena-text-primary [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_li]:text-sm [&_strong]:text-arena-text-primary [&_strong]:font-medium [&_a]:text-arena-accent [&_a]:hover:underline">
        {children}
      </div>
      <p className="text-xs text-arena-text-muted mt-4 text-center">Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  );
}

function PrivacyPolicyView() {
  return (
    <LegalPageWrapper title="🔒 Privacy Policy">
      <p>Welcome to Aether Arena (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.</p>

      <h2>1. Information We Collect</h2>
      <h3>1.1 Personal Information</h3>
      <ul>
        <li><strong>Account Details:</strong> Username, display name, email address, and password when you register.</li>
        <li><strong>Discord Data:</strong> Discord ID, username, and avatar when you sign in via Discord OAuth.</li>
        <li><strong>Profile Information:</strong> Avatar URL, bio, and any information you choose to share on your public profile.</li>
      </ul>
      <h3>1.2 Gaming Data</h3>
      <ul>
        <li><strong>Tournament Participation:</strong> Tournament registrations, match results, kills, deaths, placements, and scores.</li>
        <li><strong>Leaderboard Data:</strong> Points, ranks, win rates, and K/D ratios displayed on public leaderboards.</li>
        <li><strong>Payment Information:</strong> Transaction references and payment screenshots for tournament fee verification. <strong>We do NOT store credit card numbers, UPI IDs, or bank details.</strong></li>
      </ul>
      <h3>1.3 Automatically Collected Data</h3>
      <ul>
        <li>Device type, browser type, IP address (anonymized), and usage patterns.</li>
        <li>Cookies and local storage for session management and preferences.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and operate the Aether Arena tournament platform.</li>
        <li>To process tournament registrations and verify payments.</li>
        <li>To maintain leaderboards, rankings, and player statistics.</li>
        <li>To send notifications about tournaments, results, and platform updates.</li>
        <li>To improve our platform, fix bugs, and enhance user experience.</li>
        <li>To enforce our Terms and Conditions and prevent fraud.</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do <strong>NOT</strong> sell, rent, or trade your personal information. We may share data only with:</p>
      <ul>
        <li><strong>Tournament Organizers:</strong> Registration details (username, payment status) for tournaments you&apos;ve joined.</li>
        <li><strong>Public Leaderboards:</strong> Your username, stats, and rank are publicly visible.</li>
        <li><strong>Legal Requirements:</strong> If required by Indian law or court order.</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We implement industry-standard security measures including encrypted passwords (bcrypt), secure session tokens, and HTTPS encryption. However, no system is 100% secure. We recommend using unique passwords and enabling 2FA on your Discord account.</p>

      <h2>5. Data Retention</h2>
      <ul>
        <li><strong>Active Accounts:</strong> Data is retained while your account is active.</li>
        <li><strong>Deleted Accounts:</strong> Personal data is removed within 30 days of account deletion request.</li>
        <li><strong>Leaderboard History:</strong> Anonymized statistics may be retained for historical purposes.</li>
      </ul>

      <h2>6. Your Rights</h2>
      <ul>
        <li><strong>Access:</strong> You can view all your data through your profile.</li>
        <li><strong>Correction:</strong> You can update your profile information at any time.</li>
        <li><strong>Deletion:</strong> You can request account deletion via Discord support.</li>
        <li><strong>Opt-out:</strong> You can disable notifications in your profile settings.</li>
      </ul>

      <h2>7. Children&apos;s Privacy</h2>
      <p>Aether Arena is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the data immediately.</p>

      <h2>8. Third-Party Services</h2>
      <ul>
        <li><strong>Discord:</strong> OAuth authentication provider. Subject to Discord&apos;s Privacy Policy.</li>
        <li><strong>Codashop:</strong> Top-up affiliate links. We receive no personal data from Codashop transactions.</li>
        <li><strong>Vercel:</strong> Hosting provider. Subject to Vercel&apos;s Privacy Policy.</li>
      </ul>

      <h2>9. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will notify users of significant changes via platform announcements or email.</p>

      <h2>10. Contact Us</h2>
      <p>For privacy-related questions or requests, contact us at our Discord server or via the Contact page.</p>
    </LegalPageWrapper>
  );
}

function TermsConditionsView() {
  return (
    <LegalPageWrapper title="📜 Terms &amp; Conditions">
      <p>Welcome to Aether Arena. By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By creating an account, participating in tournaments, or using any feature of Aether Arena, you acknowledge that you have read, understood, and agree to these Terms.</p>

      <h2>2. Eligibility</h2>
      <ul>
        <li>You must be at least <strong>13 years old</strong> to use this platform.</li>
        <li>If you are under 18, you must have parental or guardian consent.</li>
        <li>You must not be legally prohibited from participating in online gaming tournaments.</li>
        <li>You must reside in a jurisdiction where online gaming tournaments with prize pools are legal.</li>
      </ul>

      <h2>3. Account Registration</h2>
      <ul>
        <li>You must provide accurate and complete registration information.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You must not create multiple accounts. One person = one account.</li>
        <li>You must not use offensive, misleading, or impersonating usernames.</li>
        <li>We reserve the right to suspend or ban accounts that violate these rules.</li>
      </ul>

      <h2>4. Tournament Participation</h2>
      <h3>4.1 Registration</h3>
      <ul>
        <li>By registering for a tournament, you agree to follow all tournament rules and the host&apos;s room settings.</li>
        <li>Registration is confirmed only after payment verification (for paid tournaments).</li>
        <li>We reserve the right to refuse or cancel registrations at our discretion.</li>
      </ul>
      <h3>4.2 Entry Fees &amp; Prizes</h3>
      <ul>
        <li>Entry fees are non-refundable once the tournament begins, except as outlined in our Refund Policy.</li>
        <li>Prize pools are distributed as per the tournament&apos;s prize breakdown.</li>
        <li>Prize distribution may take up to <strong>48 hours</strong> after tournament completion.</li>
        <li>All prize amounts are in Indian Rupees (INR) and subject to applicable taxes.</li>
      </ul>
      <h3>4.3 Fair Play</h3>
      <ul>
        <li><strong>No Cheating:</strong> Use of hacks, mods, exploits, or any unfair advantage is strictly prohibited.</li>
        <li><strong>No Team Killing:</strong> Intentional team kills will result in disqualification.</li>
        <li><strong>No Collusion:</strong> Players must not conspire with opponents to manipulate match outcomes.</li>
        <li><strong>No Smurfing:</strong> Playing on another person&apos;s account is prohibited.</li>
        <li>Violations may result in disqualification, prize forfeiture, and permanent ban.</li>
      </ul>

      <h2>5. Payment &amp; Transactions</h2>
      <ul>
        <li>Payments are processed via UPI transfer. Aether Arena does not directly process payments.</li>
        <li>Users must upload payment screenshots/proof for verification.</li>
        <li>Fake or manipulated payment proofs will result in permanent ban.</li>
        <li>Aether Arena is not liable for payment failures, delays, or disputes with payment providers.</li>
      </ul>

      <h2>6. User Conduct</h2>
      <ul>
        <li>Be respectful to all players, admins, and staff.</li>
        <li>No harassment, hate speech, discrimination, or abusive behavior.</li>
        <li>No spamming, advertising, or self-promotion without permission.</li>
        <li>No sharing of personal information of other users without consent.</li>
        <li>No impersonation of Aether Arena staff or administrators.</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <ul>
        <li>The Aether Arena name, logo, and branding are our intellectual property.</li>
        <li>Game assets, logos, and trademarks belong to their respective owners (Krafton, Garena, Activision, etc.).</li>
        <li>User-generated content (clips, screenshots) may be used by Aether Arena for promotional purposes with credit.</li>
      </ul>

      <h2>8. Limitation of Liability</h2>
      <p>Aether Arena provides the platform &quot;as is&quot; without warranties. We are not liable for:</p>
      <ul>
        <li>Server downtime, connectivity issues, or technical glitches during matches.</li>
        <li>Actions of players, tournament organizers, or third parties.</li>
        <li>Loss of in-game items, currency, or rankings.</li>
        <li>Any indirect, incidental, or consequential damages.</li>
      </ul>

      <h2>9. Dispute Resolution</h2>
      <ul>
        <li>All disputes will be resolved through our internal review process.</li>
        <li>Final decisions on disputes rest with Aether Arena administration.</li>
        <li>For unresolved disputes, the matter falls under the jurisdiction of courts in India.</li>
      </ul>

      <h2>10. Modifications</h2>
      <p>We may modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>

      <h2>11. Termination</h2>
      <p>We may suspend or terminate your account for violation of these Terms. You may delete your account at any time through our Discord support.</p>
    </LegalPageWrapper>
  );
}

function RefundPolicyView() {
  return (
    <LegalPageWrapper title="💰 Refund Policy">
      <p>At Aether Arena, we strive to provide a fair and transparent refund process. This policy outlines when refunds are available and how to request one.</p>

      <h2>1. Refund Eligibility</h2>
      <h3>1.1 Full Refund</h3>
      <p>You are eligible for a <strong>full refund</strong> if:</p>
      <ul>
        <li>The tournament is <strong>cancelled by Aether Arena</strong> or the organizer before it begins.</li>
        <li>You were <strong>incorrectly charged</strong> (duplicate payment, wrong amount).</li>
        <li>The tournament <strong>did not start within 30 minutes</strong> of the scheduled start time without communication.</li>
        <li>Technical issues on Aether Arena&apos;s end prevented your participation.</li>
      </ul>

      <h3>1.2 Partial Refund (50%)</h3>
      <p>You may be eligible for a <strong>partial refund</strong> if:</p>
      <ul>
        <li>You request cancellation <strong>more than 2 hours before</strong> the tournament starts.</li>
        <li>You were disconnected due to a server-side issue during the match (partial, based on rounds completed).</li>
      </ul>

      <h3>1.3 No Refund</h3>
      <p>Refunds are <strong>NOT available</strong> if:</p>
      <ul>
        <li>The tournament has already started.</li>
        <li>You request cancellation <strong>less than 2 hours before</strong> the tournament starts.</li>
        <li>You were disqualified for rule violations (cheating, team killing, etc.).</li>
        <li>You failed to join the match room on time.</li>
        <li>You experienced internet connectivity issues on your end.</li>
        <li>Your account was banned at the time of the tournament.</li>
      </ul>

      <h2>2. Free Tournaments</h2>
      <p>Free tournaments (₹0 entry fee) have no refund applicable. However, if the tournament is cancelled, any bonus credits or rewards will still be distributed as applicable.</p>

      <h2>3. Refund Process</h2>
      <ol>
        <li><strong>Submit a Request:</strong> Contact us via Discord or the Contact page with your username, tournament name, and reason for refund.</li>
        <li><strong>Review:</strong> Our team will review your request within <strong>24-48 hours</strong>.</li>
        <li><strong>Decision:</strong> You will be notified of the decision via in-app notification or Discord DM.</li>
        <li><strong>Processing:</strong> Approved refunds will be processed within <strong>5-7 business days</strong> via the original payment method.</li>
      </ol>

      <h2>4. Prize Distribution Issues</h2>
      <p>If you won a prize but did not receive it:</p>
      <ul>
        <li>Report within <strong>7 days</strong> of tournament completion.</li>
        <li>Provide your tournament registration details and payment proof.</li>
        <li>Prizes will be re-issued after verification.</li>
      </ul>

      <h2>5. Affiliate Purchases (Top Up)</h2>
      <p>Purchases made through our Codashop affiliate links are processed by Codashop directly. Aether Arena does not handle these transactions. For refund requests on top-up purchases, contact Codashop support directly.</p>

      <h2>6. Contact</h2>
      <p>For refund requests, contact us on Discord or via our Contact page. Include your username and tournament details for faster processing.</p>
    </LegalPageWrapper>
  );
}

function ContactView() {
  const { navigate } = useAppStore();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Message sent! We\'ll get back to you soon.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Try Discord instead.');
      }
    } catch {
      toast.error('Failed to send message. Try Discord instead.');
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-arena-text-muted hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">📩 Contact Us</h1>
      <p className="text-arena-text-secondary text-sm mb-8">Have a question, issue, or suggestion? We&apos;d love to hear from you.</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: MessageSquare, title: 'Discord', desc: 'Join our Discord server for instant support', value: 'Join Server', color: 'text-[#5865F2]', bg: 'bg-[#5865F2]/10' },
          { icon: Mail, title: 'Email', desc: 'For business inquiries only', value: 'support@aetherarena.gg', color: 'text-arena-accent', bg: 'bg-arena-accent/10' },
          { icon: Clock, title: 'Response Time', desc: 'We typically reply within', value: '24-48 hours', color: 'text-arena-warning', bg: 'bg-arena-warning/10' },
        ].map(item => (
          <div key={item.title} className="bg-arena-card border border-arena-border rounded-xl p-4 text-center">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3', item.bg)}>
              <item.icon className={cn('w-5 h-5', item.color)} />
            </div>
            <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-arena-text-muted mb-2">{item.desc}</p>
            <p className={cn('text-xs font-medium', item.color)}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-arena-card border border-arena-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Send us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-arena-text-secondary mb-1 block">Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors" placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs text-arena-text-secondary mb-1 block">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors" placeholder="your@email.com" />
            </div>
          </div>
          <div>
            <label className="text-xs text-arena-text-secondary mb-1 block">Subject</label>
            <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors" placeholder="What's this about?" />
          </div>
          <div>
            <label className="text-xs text-arena-text-secondary mb-1 block">Message *</label>
            <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors resize-none" placeholder="Tell us what's on your mind..." />
          </div>
          <button type="submit" disabled={sending} className="px-6 py-2.5 h-11 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==================== SEARCH BAR INPUT ====================

function SearchBarInput() {
  const { currentView } = useAppStore();
  const { query, setQuery } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => { setLocalQuery(query); }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    setQuery(val);
  };

  const placeholder =
    currentView === 'home' ? 'Search tournaments, players...':
    currentView === 'tournaments' ? 'Search tournaments...':
    currentView === 'leaderboard' ? 'Search players...':
    'Search streams...';

  return (
    <div className="relative">
      <input type="text" value={localQuery} onChange={handleChange} placeholder={placeholder}
        className="w-full bg-arena-card border border-arena-border rounded-xl pl-10 pr-9 py-2.5 h-10 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" />
      {localQuery && (
        <button onClick={() => { setLocalQuery(''); setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-text-muted hover:text-white transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function Page() {
  const { currentView, navigate, mobileMenuOpen, setMobileMenuOpen, rightPanelCollapsed, setRightPanelCollapsed } = useAppStore();
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();
  const isLanding = currentView === 'landing';
  const isAdmin = user?.isAdmin;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    navigate('landing');
  };

  const navItems = [
    { view: 'home' as ViewName, icon: Home, label: 'Home' },
    { view: 'tournaments' as ViewName, icon: Trophy, label: 'Tournaments' },
    { view: 'leaderboard' as ViewName, icon: BarChart3, label: 'Leaderboard' },
    { view: 'streams' as ViewName, icon: Tv, label: 'Streams' },
    { view: 'profile' as ViewName, icon: User, label: 'Profile' },
    ...(isAdmin ? [{ view: 'admin-dashboard' as ViewName, icon: Shield, label: 'Admin' }] : []),
  ];

  // Redirect to home if authenticated and on landing
  useEffect(() => {
    if (isAuthenticated && currentView === 'landing') {
      navigate('home');
    }
  }, [isAuthenticated, currentView, navigate]);

  return (
    <div className="min-h-screen bg-arena-dark">
      {/* Landing page - full width */}
      {isLanding ? (
        <ViewRenderer />
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Left Sidebar - Desktop */}
          <aside className="hidden md:flex flex-col items-center w-[72px] h-screen bg-arena-surface border-r border-arena-border flex-shrink-0 py-5 z-50">
            <img onClick={() => navigate('home')} src="/logo-lg.webp" alt="Aether Arena" className="w-14 h-14 rounded-2xl mb-10 logo-energy hover:opacity-90 transition-opacity cursor-pointer" />
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map(item => (
                <button key={item.view} onClick={() => navigate(item.view)} aria-label={item.label} title={item.label}
                  className={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative group',
                    currentView === item.view ? 'bg-arena-accent text-white shadow-lg shadow-arena-accent/25' : 'text-arena-text-secondary hover:bg-arena-card hover:text-white')}>
                  {currentView === item.view && <div className="absolute left-[-14px] w-[3px] h-5 bg-arena-accent rounded-r" />}
                  <item.icon className="w-5 h-5" />
                </button>
              ))}
            </nav>
            <div className="flex flex-col gap-2 items-center">
              <button onClick={() => navigate('notifications')} aria-label="Notifications" className="w-11 h-11 rounded-xl flex items-center justify-center text-arena-text-secondary hover:bg-arena-card hover:text-white transition-all duration-200 relative">
                <Bell className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('profile')} aria-label="Profile" className="w-9 h-9 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold border-2 border-arena-accent/50 overflow-hidden">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt={`${user.username}'s avatar`} className="w-full h-full object-cover" /> : (user?.username || '?')[0].toUpperCase()}
              </button>
              <button onClick={handleLogout} aria-label="Logout" title="Logout" className="w-11 h-11 rounded-xl flex items-center justify-center text-arena-text-muted hover:bg-arena-accent/10 hover:text-arena-accent transition-all duration-200">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </aside>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[100] animate-fade-in">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-arena-surface border-r border-arena-border p-5 animate-slide-in-left">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <img src="/logo-md.webp" alt="Aether Arena" className="w-10 h-10 rounded-xl logo-energy" />
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <nav className="space-y-1">
                  {navItems.map(item => (
                    <button key={item.view} onClick={() => navigate(item.view)}
                      className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                        currentView === item.view ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:bg-arena-card hover:text-white')}>
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="mt-8 pt-4 border-t border-arena-border space-y-1">
                  <button onClick={() => { navigate('notifications'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arena-text-secondary hover:bg-arena-card hover:text-white transition-all duration-200">
                    <Bell className="w-5 h-5" /> Notifications
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arena-text-muted hover:bg-arena-accent/10 hover:text-arena-accent transition-all duration-200">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
                {user && (
                  <div className="mt-6 flex items-center gap-3 px-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt={`${user.username}'s avatar`} className="w-full h-full object-cover" /> : (user?.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.displayName || user.username}</div>
                      <div className="text-xs text-arena-text-muted">@{user.username}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Bar - only on main content views */}
            {(['home', 'tournaments', 'leaderboard', 'streams'] as ViewName[]).includes(currentView) && (
              <header className="h-14 flex items-center justify-between px-3 md:px-6 border-b border-arena-border flex-shrink-0 bg-arena-dark/80 backdrop-blur-xl gap-3">
                {/* Hamburger menu (mobile) */}
                <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="md:hidden w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center flex-shrink-0">
                  <Menu className="w-5 h-5" />
                </button>
                {/* Contextual search bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-text-muted pointer-events-none" />
                  <SearchBarInput />
                </div>
                {/* Right icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => navigate('notifications')} aria-label="Notifications" className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-white hover:border-arena-accent/30 transition-all duration-200 relative">
                    <Bell className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate('profile')} className="w-9 h-9 rounded-xl overflow-hidden border-2 border-arena-accent/50 hover:border-arena-accent transition-colors duration-150 cursor-pointer">
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt={`${user.username}'s avatar`} className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-xs font-bold">{(user?.username || '?')[0].toUpperCase()}</div>
                    )}
                  </button>
                </div>
              </header>
            )}
            {/* Minimal header for non-search views (mobile still needs hamburger) */}
            {!['home', 'tournaments', 'leaderboard', 'streams'].includes(currentView) && (
              <div className="md:hidden h-12 flex items-center px-3 border-b border-arena-border flex-shrink-0 bg-arena-dark/80 backdrop-blur-xl">
                <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center">
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content + Right Panel */}
            <div className="flex flex-1 overflow-hidden">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <ViewRenderer />
              </div>

              {/* Right Panel - Desktop */}
              {!rightPanelCollapsed && (
                <aside className="hidden lg:flex flex-col w-[280px] border-l border-arena-border bg-arena-surface overflow-y-auto p-4 flex-shrink-0">
                  <RightPanelContent />
                </aside>
              )}
            </div>
          </main>

          {/* Right Panel Toggle */}
          <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)} aria-label={rightPanelCollapsed ? 'Open right panel' : 'Close right panel'}
            className="hidden lg:flex fixed top-1/2 -translate-y-1/2 z-50 w-5 h-12 bg-arena-surface border border-arena-border rounded-l-lg items-center justify-center hover:bg-arena-card transition-colors duration-150"
            style={{ right: rightPanelCollapsed ? '0' : '280px' }}>
            <ChevronRight className={cn('w-3 h-3 text-arena-text-muted transition-transform', !rightPanelCollapsed && 'rotate-180')} />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== RIGHT PANEL CONTENT ====================

function RightPanelContent() {
  const { currentView, navigate } = useAppStore();
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats-mini'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
    enabled: user?.isAdmin,
  });

  if (currentView === 'profile' || currentView === 'notifications') return null;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="bg-arena-card border border-arena-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-arena-text-muted uppercase tracking-wider mb-3">Platform Stats</h3>
        <div className="space-y-3">
          {[
            { label: 'Players', value: stats?.totalUsers || '—', color: 'text-arena-info' },
            { label: 'Tournaments', value: stats?.activeTournaments || '—', color: 'text-arena-success' },
            { label: 'Pending', value: stats?.pendingVerifications || '—', color: 'text-arena-warning' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-xs text-arena-text-muted">{s.label}</span>
              <span className={cn('text-sm font-bold', s.color)}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Quick Info */}
      {user && (
        <div className="bg-arena-card border border-arena-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-arena-text-muted uppercase tracking-wider mb-3">Your Profile</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={`${user.username}'s avatar`} className="w-full h-full object-cover" /> : (user?.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">{user.displayName || user.username}</div>
              <div className="text-xs" style={{ color: (LEAGUE_CONFIG[user.league] || LEAGUE_CONFIG.bronze).color }}>
                {(LEAGUE_CONFIG[user.league] || LEAGUE_CONFIG.bronze).icon} {(LEAGUE_CONFIG[user.league] || LEAGUE_CONFIG.bronze).label}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center bg-arena-surface rounded-lg py-2">
              <div className="text-sm font-bold">{(user as any).totalWins || 0}</div>
              <div className="text-[10px] text-arena-text-muted">Wins</div>
            </div>
            <div className="text-center bg-arena-surface rounded-lg py-2">
              <div className="text-sm font-bold">{user.leaguePoints || 0}</div>
              <div className="text-[10px] text-arena-text-muted">LP</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-arena-card border border-arena-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-arena-text-muted uppercase tracking-wider mb-3">Quick Links</h3>
        <div className="space-y-1">
          {[
            { label: 'Browse Tournaments', view: 'tournaments' as ViewName, icon: Trophy },
            { label: 'Leaderboard', view: 'leaderboard' as ViewName, icon: BarChart3 },
            { label: 'Watch Streams', view: 'streams' as ViewName, icon: Tv },
          ].map(link => (
            <button key={link.view} onClick={() => navigate(link.view)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-arena-text-secondary hover:bg-arena-surface hover:text-white transition-all duration-200">
              <link.icon className="w-4 h-4" /> {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* League Info */}
      <div className="bg-arena-card border border-arena-border rounded-xl p-4">
        <h3 className="text-xs font-semibold text-arena-text-muted uppercase tracking-wider mb-3">League Thresholds</h3>
        <div className="space-y-1.5">
          {Object.entries(LEAGUE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span style={{ color: config.color }}>{config.icon} {config.label}</span>
              <span className="text-arena-text-muted">{config.minPoints} LP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
