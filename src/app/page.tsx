'use client';

import { useAppStore, useAuthStore, useSearchStore, ViewName } from '@/lib/store';
import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, Gamepad2, Users, Zap, Shield, ChevronRight,
  Tv, BarChart3, User, Home, Settings, LogOut,
  Crown, Target, Clock, Coins, Plus, Eye, Pencil,
  CheckCircle2, XCircle, Search, Bell, ChevronLeft,
  Menu, X, Swords, Star, TrendingUp, DollarSign,
  Calendar, Hash, Copy, ExternalLink, Upload,
  ArrowLeft, Play, CircleDot, Medal, Award, Link2,
  Trash2, RefreshCw, MonitorPlay, ShoppingBag, Store
} from 'lucide-react';
import { cn, paiseToRupee, formatDateTime, formatDate, timeAgo, LEAGUE_CONFIG, getStatusBg, getFormatLabel } from '@/lib/utils';
import { toast } from 'sonner';

// ==================== VIEW RENDERER ====================

function ViewRenderer() {
  const { currentView, viewParams, navigate } = useAppStore();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-arena-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  // If not authenticated and not on landing, go to landing
  if (!isAuthenticated && currentView !== 'landing') {
    // Still show the view but they'll see login prompts
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
    'admin-settings': <AdminSettingsView />,
  };

  return (
    <div key={currentView} className="animate-fade-in">
      {viewMap[currentView] || <HomeView />}
    </div>
  );
}

// ==================== LANDING VIEW ====================

function LandingView() {
  const { navigate, setUser } = useAuthStore();
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-arena-accent rounded-lg flex items-center justify-center font-bold text-sm">AE</div>
            <span className="font-bold text-lg tracking-wider">AETHER ARENA</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowLogin(true)} className="px-4 py-2 text-sm font-medium text-arena-text-secondary hover:text-white transition-colors">Log In</button>
            <button onClick={() => setShowSignup(true)} className="px-4 py-2 text-sm font-medium bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl transition-all hover:shadow-lg hover:shadow-arena-accent/20">Sign Up</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-arena-accent/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-arena-accent/10 border border-arena-accent/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in-up">
              <CircleDot className="w-3 h-3 text-arena-accent animate-pulse" />
              <span className="text-sm text-arena-accent font-medium">Live Tournaments Now</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Compete. Win.<br />
              <span className="text-arena-accent"> Rise Through the Ranks.</span>
            </h1>
            <p className="text-lg md:text-xl text-arena-text-secondary mb-8 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Join India&apos;s fastest-growing mobile esports tournament platform. Free Fire, BGMI, COD Mobile &amp; more. Register, compete, and win real prizes.
            </p>
            <div className="flex gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <button onClick={() => setShowSignup(true)} className="px-8 py-3 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-arena-accent/25 hover:-translate-y-0.5">
                Get Started Free
              </button>
              <button onClick={() => setShowLogin(true)} className="px-8 py-3 border border-arena-border hover:border-arena-accent/50 text-white font-semibold rounded-xl transition-all">
                Log In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-arena-border bg-arena-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Users, label: 'Players', value: '500+' },
            { icon: Trophy, label: 'Tournaments', value: '100+' },
            { icon: Coins, label: 'Prizes Won', value: '₹50K+' },
            { icon: Gamepad2, label: 'Games', value: '5' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 text-arena-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-arena-text-muted">{stat.label}</div>
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
            <div key={item.step} className="bg-arena-card border border-arena-border rounded-2xl p-6 hover:border-arena-accent/30 transition-all hover:-translate-y-1">
              <div className="text-4xl font-black text-arena-accent/20 mb-4">{item.step}</div>
              <item.icon className="w-8 h-8 text-arena-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-arena-text-secondary text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tournaments */}
      {featuredTournaments && featuredTournaments.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Tournaments</h2>
            <button onClick={() => { const { setUser } = useAuthStore.getState(); if (useAuthStore.getState().isAuthenticated) { nav('tournaments'); } else { setShowLogin(true); }}} className="text-arena-accent text-sm font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTournaments.slice(0, 3).map((t: any) => (
              <div key={t.id} className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden hover:border-arena-accent/30 transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => { if (useAuthStore.getState().isAuthenticated) { nav('tournament-detail', { id: t.id }); } else { setShowLogin(true); }}}>
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
              <div key={g.id} className="bg-arena-card border border-arena-border rounded-2xl p-4 flex items-center gap-3 hover:border-arena-accent/30 transition-all">
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
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-arena-accent rounded-md flex items-center justify-center font-bold text-xs">AE</div>
            <span className="text-sm font-medium">Aether Arena</span>
          </div>
          <p className="text-xs text-arena-text-muted">© 2025 Aether Arena. All rights reserved.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-arena-card border border-arena-border rounded-2xl p-8 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <button onClick={() => setShowLogin(false)} className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Email</label>
                <input type="email" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Password</label>
                <input type="password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                {loading ? 'Logging in...' : 'Log In'}
              </button>
              <p className="text-center text-sm text-arena-text-muted">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => { setShowLogin(false); setShowSignup(true); }} className="text-arena-accent hover:underline">Sign Up</button>
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
              <button onClick={() => setShowSignup(false)} className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Email</label>
                <input type="email" required value={signupForm.email} onChange={e => setSignupForm({ ...signupForm, email: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Username</label>
                <input type="text" required value={signupForm.username} onChange={e => setSignupForm({ ...signupForm, username: e.target.value.replace(/\s/g, '').toLowerCase() })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="gamer_tag" />
              </div>
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Display Name</label>
                <input type="text" value={signupForm.displayName} onChange={e => setSignupForm({ ...signupForm, displayName: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="Your Name (optional)" />
              </div>
              <div>
                <label className="text-sm text-arena-text-secondary mb-1 block">Password</label>
                <input type="password" required minLength={6} value={signupForm.password} onChange={e => setSignupForm({ ...signupForm, password: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-arena-accent transition-colors" placeholder="Min 6 characters" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p className="text-center text-sm text-arena-text-muted">
                Already have an account?{' '}
                <button type="button" onClick={() => { setShowSignup(false); setShowLogin(true); }} className="text-arena-accent hover:underline">Log In</button>
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
  return (
    <div className="space-y-6">
      <StreamBannerSection />
      <TopPlayersSection />
      <AffiliateCarouselSection />
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
    <div className="relative rounded-2xl overflow-hidden border border-arena-border h-64 md:h-72 bg-arena-card cursor-pointer group"
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
        <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-arena-accent transition-colors">{stream.title}</h2>
        <p className="text-arena-text-secondary text-sm mb-4 max-w-lg">{stream.description}</p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2 bg-arena-accent hover:bg-arena-accent-light text-white font-medium rounded-xl transition-all text-sm"
            onClick={e => { e.stopPropagation(); if (stream.streamUrl) window.open(stream.streamUrl, '_blank'); }}>
            <Play className="w-4 h-4" /> Watch Now
          </button>
          {stream.tournamentId && (
            <button className="flex items-center gap-2 px-5 py-2 border border-arena-border hover:border-arena-accent/50 text-white font-medium rounded-xl transition-all text-sm"
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
    queryFn: () => fetch('/api/leaderboard?period=all_time&limit=10').then(r => r.json()).then(d => d.entries || d || []),
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
              className="flex-shrink-0 w-44 bg-arena-card border border-arena-border rounded-xl p-3 flex items-center gap-3 hover:border-arena-accent/30 transition-all cursor-pointer hover:-translate-y-0.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden">
                  {entry.player?.avatarUrl ? (
                    <img src={entry.player.avatarUrl} alt="" className="w-full h-full object-cover" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {affiliates.slice(current, current + 3).concat(
          affiliates.length - current < 3 ? affiliates.slice(0, 3 - (affiliates.length - current)) : []
        ).map((a: any) => (
          <div key={a.id} onClick={() => handleClick(a)}
            className="bg-arena-card border border-arena-border rounded-xl p-4 flex gap-4 hover:border-arena-accent/30 transition-all cursor-pointer hover:-translate-y-0.5">
            <div className="w-16 h-16 rounded-lg bg-arena-surface flex items-center justify-center flex-shrink-0">
              <Gamepad2 className="w-8 h-8 text-arena-text-muted" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate">{a.name}</h3>
              <p className="text-xs text-arena-text-muted mt-1 line-clamp-2">{a.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-bold text-arena-success">₹{a.price}</span>
                {a.originalPrice > 0 && <span className="text-xs text-arena-text-muted line-through">₹{a.originalPrice}</span>}
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
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
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
        <div className="text-center py-12 text-arena-text-muted">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tournaments found</p>
        </div>
      )}
    </div>
  );
}

// ==================== TOURNAMENT CARD ====================

function TournamentCard({ tournament: t, onClick }: { tournament: any; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-arena-card border border-arena-border rounded-xl overflow-hidden hover:border-arena-accent/30 transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="h-28 bg-gradient-to-br from-arena-accent/15 via-arena-purple/10 to-arena-surface flex items-center justify-center relative">
        <Gamepad2 className="w-10 h-10 text-arena-text-muted/50" />
        <div className="absolute top-3 left-3 flex gap-2">
          {t.isFeatured && <span className="bg-arena-gold/20 text-arena-gold text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
          {t.status === 'in_progress' && <span className="bg-arena-accent text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><CircleDot className="w-3 h-3 animate-pulse" /> LIVE</span>}
        </div>
      </div>
      <div className="p-4">
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
          <div className="bg-arena-accent rounded-full h-1.5 transition-all" style={{ width: `${Math.min(100, ((t.registeredPlayers || 0) / t.maxPlayers) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

// ==================== TOURNAMENTS VIEW ====================

function TournamentsView() {
  const { navigate } = useAppStore();
  const [filters, setFilters] = useState({ game: '', status: '', format: '', fee: '', search: '' });

  const { data: games } = useQuery({
    queryKey: ['games-filter'],
    queryFn: () => fetch('/api/games').then(r => r.json()).then(d => d.games || d || []),
  });

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.game) params.set('game', filters.game);
      if (filters.status) params.set('status', filters.status);
      if (filters.format) params.set('format', filters.format);
      if (filters.fee) params.set('fee', filters.fee);
      if (filters.search) params.set('search', filters.search);
      return fetch(`/api/tournaments?${params}`).then(r => r.json()).then(d => d.tournaments || d || []);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tournaments</h1>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-text-muted" />
          <input type="text" placeholder="Search tournaments..." value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full bg-arena-card border border-arena-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent transition-colors" />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filters.game} onChange={e => setFilters(f => ({ ...f, game: e.target.value }))}
            className="bg-arena-card border border-arena-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-arena-accent">
            <option value="">All Games</option>
            {games?.map((g: any) => <option key={g.id} value={g.slug}>{g.name}</option>)}
          </select>
          {['', 'upcoming', 'registration_open', 'in_progress', 'completed'].map(s => (
            <button key={s} onClick={() => setFilters(f => ({ ...f, status: s }))}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filters.status === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-white')}>
              {s === '' ? 'All Status' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
          {['', 'solo', 'duo', 'squad'].map(f => (
            <button key={f} onClick={() => setFilters(fs => ({ ...fs, format: f }))}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filters.format === f ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-white')}>
              {f === '' ? 'All Formats' : getFormatLabel(f)}
            </button>
          ))}
          {['', 'free', 'paid'].map(f => (
            <button key={f} onClick={() => setFilters(fs => ({ ...fs, fee: f }))}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filters.fee === f ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-white')}>
              {f === '' ? 'All' : f === 'free' ? 'Free' : 'Paid'}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-arena-card border border-arena-border rounded-xl overflow-hidden animate-pulse">
              <div className="h-28 bg-arena-surface" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-arena-surface rounded w-1/2" />
                <div className="h-4 bg-arena-surface rounded w-3/4" />
                <div className="h-3 bg-arena-surface rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t: any) => (
            <TournamentCard key={t.id} tournament={t} onClick={() => navigate('tournament-detail', { id: t.id })} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-arena-text-muted/30" />
          <p className="text-arena-text-muted">No tournaments match your filters</p>
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

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-arena-accent border-t-transparent rounded-full" /></div>;
  if (!tournament) return <div className="text-center py-20 text-arena-text-muted">Tournament not found</div>;

  const t = tournament;
  const canRegister = isAuthenticated && t.status === 'registration_open' && (t.registeredPlayers || 0) < t.maxPlayers && !registered;

  return (
    <div>
      <button onClick={() => navigate('tournaments')} className="flex items-center gap-2 text-arena-text-secondary hover:text-white mb-4 text-sm transition-colors">
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
              <button onClick={() => setShowRegister(true)} className="px-6 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-arena-accent/20 text-sm whitespace-nowrap">
                Register Now
              </button>
            ) : registered ? (
              <span className={cn('px-4 py-2 rounded-xl text-sm font-medium', paymentStatus === 'verified' ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-warning/20 text-arena-warning')}>
                {paymentStatus === 'verified' ? '✓ Registered' : '⏳ Payment Pending'}
              </span>
            ) : !isAuthenticated ? (
              <button onClick={() => { const { setUser } = useAuthStore.getState(); }} className="px-6 py-2.5 border border-arena-accent text-arena-accent font-semibold rounded-xl transition-all text-sm">
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
              <div className="bg-arena-accent rounded-full h-2 transition-all" style={{ width: `${Math.min(100, ((t.registeredPlayers || 0) / t.maxPlayers) * 100)}%` }} />
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
            <button onClick={onClose} className="flex-1 py-2.5 border border-arena-border rounded-xl text-sm font-medium hover:border-white transition-colors">Cancel</button>
            <button onClick={() => onRegister({})} className="flex-1 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl text-sm font-semibold transition-all">Confirm</button>
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
          <button onClick={onClose} className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
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
          <button onClick={() => setPaymentMethod('upi_id')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-all', paymentMethod === 'upi_id' ? 'bg-arena-accent text-white' : 'bg-arena-surface text-arena-text-secondary')}>Enter Transaction ID</button>
          <button onClick={() => setPaymentMethod('screenshot')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-all', paymentMethod === 'screenshot' ? 'bg-arena-accent text-white' : 'bg-arena-surface text-arena-text-secondary')}>Upload Screenshot</button>
        </div>
        {paymentMethod === 'upi_id' ? (
          <input type="text" placeholder="Enter UPI Transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value)}
            className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-arena-accent mb-4" />
        ) : (
          <div className="bg-arena-dark border border-arena-border border-dashed rounded-xl p-6 text-center mb-4 cursor-pointer hover:border-arena-accent/50 transition-colors">
            <Upload className="w-8 h-8 text-arena-text-muted mx-auto mb-2" />
            <p className="text-xs text-arena-text-muted">Screenshot upload coming soon</p>
            <p className="text-[10px] text-arena-text-muted mt-1">Use Transaction ID for now</p>
          </div>
        )}
        <button onClick={() => { if (!transactionId && paymentMethod === 'upi_id') { toast.error('Please enter transaction ID'); return; } onRegister({ paymentMethod, paymentReference: transactionId }); }}
          className="w-full py-3 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all text-sm">
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
    queryFn: () => fetch(`/api/leaderboard?gameId=${gameFilter}&period=${period}`).then(r => r.json()).then(d => d.entries || d || []),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-arena-accent" /> Leaderboard
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-1 bg-arena-card rounded-xl p-1 border border-arena-border">
          <button onClick={() => setGameFilter('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', gameFilter === 'all' ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-white')}>All Games</button>
          {games?.map((g: any) => (
            <button key={g.id} onClick={() => setGameFilter(g.id)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap', gameFilter === g.id ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-white')}>{g.name}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-arena-card rounded-xl p-1 border border-arena-border">
          {['all_time', 'monthly', 'weekly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', period === p ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-white')}>
              {p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="bg-arena-card border border-arena-border rounded-xl h-14 animate-pulse" />)}
        </div>
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
                    <tr key={entry.id || idx} className="border-b border-arena-border/50 hover:bg-arena-card-hover transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn('font-bold', idx < 3 ? 'text-lg' : 'text-sm')} style={{ color: idx < 3 ? rankColors[idx] : undefined }}>
                          {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx + 1}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arena-accent/20 to-arena-purple/20 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {entry.player?.avatarUrl ? <img src={entry.player.avatarUrl} alt="" className="w-full h-full object-cover" /> : (entry.player?.username || '?')[0].toUpperCase()}
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
  const { data: streams } = useQuery({
    queryKey: ['all-streams'],
    queryFn: () => fetch('/api/streams').then(r => r.json()).then(d => d.streams || d || []),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Tv className="w-6 h-6 text-arena-accent" /> Live Streams
      </h1>
      {streams && streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streams.map((s: any) => (
            <div key={s.id} onClick={() => s.streamUrl && window.open(s.streamUrl, '_blank')} className="bg-arena-card border border-arena-border rounded-xl p-5 hover:border-arena-accent/30 transition-all cursor-pointer hover:-translate-y-0.5">
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
  const { user, isAuthenticated, setUser } = useAuthStore();
  const { navigate } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => fetch('/api/profiles/me').then(r => r.json()),
    enabled: isAuthenticated,
  });

  const { data: registrations } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => fetch('/api/registrations').then(r => r.json()).then(d => d.registrations || d || []),
    enabled: isAuthenticated,
  });

  const [profileFormInit, setProfileFormInit] = React.useState(false);
  React.useEffect(() => {
    if (profile && !profileFormInit) {
      setProfileFormInit(true);
      setForm({ displayName: profile.displayName || '', bio: profile.bio || '' });
    }
  }, [profile, profileFormInit]);

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
      }
    } catch {
      toast.error('Failed to update profile');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    navigate('landing');
  };

  if (!isAuthenticated) return null;

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
              {p?.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" /> : (p?.username || '?')[0].toUpperCase()}
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
            <button onClick={() => setEditing(!editing)} className="p-2 rounded-xl border border-arena-border hover:border-arena-accent/50 transition-colors">
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
                <button onClick={() => setEditing(false)} className="px-4 py-2 border border-arena-border text-xs font-medium rounded-lg hover:border-white transition-colors">Cancel</button>
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
                className="flex items-center justify-between bg-arena-surface rounded-xl p-3 cursor-pointer hover:bg-arena-card-hover transition-colors">
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
      <button onClick={handleLogout} className="flex items-center gap-2 text-arena-text-muted hover:text-arena-accent text-sm transition-colors">
        <LogOut className="w-4 h-4" /> Log Out
      </button>
    </div>
  );
}

// ==================== NOTIFICATIONS VIEW ====================

function NotificationsView() {
  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()).then(d => d.notifications || d || []),
  });

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    refetch();
    toast.success('All notifications marked as read');
  };

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
            <div key={n.id} className={cn('bg-arena-card border rounded-xl p-4 transition-all', !n.isRead ? 'border-arena-accent/30 bg-arena-accent/5' : 'border-arena-border')}>
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
          { label: 'Platform Settings', icon: Settings, view: 'admin-settings' as ViewName },
        ].map(action => (
          <button key={action.label} onClick={() => navigate(action.view)}
            className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center gap-3 hover:border-arena-accent/30 transition-all hover:-translate-y-0.5 text-left">
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
    await fetch(`/api/admin/tournaments/${id}`, { method: 'DELETE' });
    refetch();
    toast.success('Tournament deleted');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">Tournaments</h1>
        </div>
        <button onClick={() => navigate('admin-tournament-create')} className="flex items-center gap-2 px-4 py-2 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['', 'registration_open', 'in_progress', 'upcoming', 'completed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              statusFilter === s ? 'bg-arena-accent text-white' : 'bg-arena-card border border-arena-border text-arena-text-secondary')}>
            {s === '' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {tournaments?.map((t: any) => (
          <div key={t.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between hover:border-arena-accent/30 transition-all">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{t.title}</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', getStatusBg(t.status))}>{t.status.replace(/_/g, ' ')}</span>
              </div>
              <div className="text-xs text-arena-text-muted">{t.game?.name} • {paiseToRupee(t.entryFee)} • {t.registeredPlayers}/{t.maxPlayers} players</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button onClick={() => navigate('tournament-detail', { id: t.id })} className="p-1.5 rounded-lg hover:bg-arena-surface transition-colors"><Eye className="w-4 h-4 text-arena-text-muted" /></button>
              <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-arena-accent/10 transition-colors"><Trash2 className="w-4 h-4 text-arena-text-muted hover:text-arena-accent" /></button>
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
  const [form, setForm] = useState({ title: '', description: '', gameId: '', format: 'solo', entryFee: '0', prizePool: '0', maxPlayers: '100', startTime: '', customRules: '', isFeatured: false, roomId: '', roomPassword: '', map: '', matchMode: '' });
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

  const inputClass = "w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent transition-colors";
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
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Room ID</label><input type="text" value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} className={inputClass} /></div>
          <div><label className={labelClass}>Room Password</label><input type="text" value={form.roomPassword} onChange={e => setForm({ ...form, roomPassword: e.target.value })} className={inputClass} /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-arena-accent" />
          <span className="text-sm">Mark as Featured</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50">{saving ? 'Creating...' : 'Create Tournament'}</button>
          <button type="button" onClick={() => navigate('admin-tournaments')} className="px-6 py-2.5 border border-arena-border rounded-xl text-sm font-medium hover:border-white transition-colors">Cancel</button>
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
    await fetch(`/api/admin/registrations/${id}/verify`, { method: 'POST' });
    refetch();
    toast.success('Payment verified!');
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/registrations/${id}/reject`, { method: 'POST' });
    refetch();
    toast.success('Payment rejected');
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
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
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
                  <button onClick={() => handleVerify(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-arena-success/20 text-arena-success text-xs font-medium rounded-lg hover:bg-arena-success/30 transition-colors"><CheckCircle2 className="w-3 h-3" /> Verify</button>
                  <button onClick={() => handleReject(r.id)} className="flex items-center gap-1 px-3 py-1.5 bg-arena-accent/20 text-arena-accent text-xs font-medium rounded-lg hover:bg-arena-accent/30 transition-colors"><XCircle className="w-3 h-3" /> Reject</button>
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
    queryFn: () => fetch('/api/games').then(r => r.json()).then(d => d.games || d || []),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Games</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {games?.map((g: any) => (
          <div key={g.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center gap-4 hover:border-arena-accent/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-arena-accent/10 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-arena-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{g.name}</h3>
              <p className="text-xs text-arena-text-muted">{g.slug} • Max Team: {g.maxTeamSize} • Sort: {g.sortOrder}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN STREAMS VIEW ====================

function AdminStreamsView() {
  const { navigate } = useAppStore();
  const { data: streams, refetch } = useQuery({
    queryKey: ['admin-streams-list'],
    queryFn: () => fetch('/api/streams').then(r => r.json()).then(d => d.streams || d || []),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Stream Management</h1>
      </div>
      <div className="space-y-3">
        {streams?.map((s: any) => (
          <div key={s.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm">{s.title}</h3>
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', s.status === 'live' ? 'bg-arena-accent text-white' : 'bg-arena-info/20 text-arena-info')}>{s.status.toUpperCase()}</span>
                {s.isFeatured && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-arena-gold/20 text-arena-gold">Featured</span>}
              </div>
              <p className="text-xs text-arena-text-muted">{s.platform} • {formatDateTime(s.scheduledStart)} • {s.peakViewers} peak viewers</p>
            </div>
            {s.streamUrl && <a href={s.streamUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-arena-surface transition-colors"><ExternalLink className="w-4 h-4 text-arena-text-muted" /></a>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN AFFILIATES VIEW ====================

function AdminAffiliatesView() {
  const { navigate } = useAppStore();
  const { data: affiliates } = useQuery({
    queryKey: ['admin-affiliates-list'],
    queryFn: () => fetch('/api/affiliates').then(r => r.json()).then(d => d.affiliates || d || []),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('admin-dashboard')} className="text-arena-text-muted hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">Affiliate Links</h1>
      </div>
      <div className="space-y-2">
        {affiliates?.map((a: any) => (
          <div key={a.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm">{a.name}</h3>
              <p className="text-xs text-arena-text-muted">{a.platform} • ₹{a.price} • {a.clicks} clicks</p>
            </div>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', a.isActive ? 'bg-arena-success/20 text-arena-success' : 'bg-arena-text-muted/20 text-arena-text-muted')}>{a.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN SETTINGS VIEW ====================

function AdminSettingsView() {
  const { navigate } = useAppStore();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => fetch('/api/admin/settings').then(r => r.json()).then(d => {
      const map: Record<string, string> = {};
      (d.settings || d || []).forEach((s: any) => { map[s.key] = s.value; });
      return map;
    }),
  });

  const [settingsInit, setSettingsInit] = React.useState(false);
  React.useEffect(() => {
    if (fetchedSettings && !settingsInit) {
      setSettingsInit(true);
      setSettings(fetchedSettings);
    }
  }, [fetchedSettings, settingsInit]);

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
              <input type="text" value={value} onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent transition-colors" />
            </div>
          ))}
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
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
            <button onClick={() => navigate('home')} className="text-sm font-extrabold tracking-widest text-arena-accent mb-10 hover:opacity-80 transition-opacity">AE</button>
            <nav className="flex flex-col gap-2 flex-1">
              {navItems.map(item => (
                <button key={item.view} onClick={() => navigate(item.view)} title={item.label}
                  className={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-all relative group',
                    currentView === item.view ? 'bg-arena-accent text-white shadow-lg shadow-arena-accent/25' : 'text-arena-text-secondary hover:bg-arena-card hover:text-white')}>
                  {currentView === item.view && <div className="absolute left-[-14px] w-[3px] h-5 bg-arena-accent rounded-r" />}
                  <item.icon className="w-5 h-5" />
                </button>
              ))}
            </nav>
            <div className="flex flex-col gap-2 items-center">
              <button onClick={() => navigate('notifications')} className="w-11 h-11 rounded-xl flex items-center justify-center text-arena-text-secondary hover:bg-arena-card hover:text-white transition-all relative">
                <Bell className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('profile')} className="w-9 h-9 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold border-2 border-arena-accent/50 overflow-hidden">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user?.username || '?')[0].toUpperCase()}
              </button>
              <button onClick={handleLogout} title="Logout" className="w-11 h-11 rounded-xl flex items-center justify-center text-arena-text-muted hover:bg-arena-accent/10 hover:text-arena-accent transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </aside>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden fixed top-4 left-4 z-[60] w-10 h-10 bg-arena-surface border border-arena-border rounded-xl flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[100] animate-fade-in">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-arena-surface border-r border-arena-border p-5 animate-slide-in-left">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-extrabold tracking-widest text-arena-accent">AETHER ARENA</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <nav className="space-y-1">
                  {navItems.map(item => (
                    <button key={item.view} onClick={() => navigate(item.view)}
                      className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        currentView === item.view ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:bg-arena-card hover:text-white')}>
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="mt-8 pt-4 border-t border-arena-border space-y-1">
                  <button onClick={() => { navigate('notifications'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arena-text-secondary hover:bg-arena-card hover:text-white transition-all">
                    <Bell className="w-5 h-5" /> Notifications
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arena-text-muted hover:bg-arena-accent/10 hover:text-arena-accent transition-all">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
                {user && (
                  <div className="mt-6 flex items-center gap-3 px-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
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
            {/* Top Bar */}
            <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-arena-border flex-shrink-0 bg-arena-dark/80 backdrop-blur-xl">
              <div className="pl-10 md:pl-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-arena-text-muted" />
                  <input type="text" placeholder="Search tournaments..." className="w-48 md:w-72 bg-arena-card border border-arena-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-arena-accent transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('notifications')} className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-white hover:border-arena-accent/30 transition-all relative">
                  <Bell className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('profile')} className="w-9 h-9 rounded-xl overflow-hidden border-2 border-arena-accent/50">
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-xs font-bold">{(user?.username || '?')[0].toUpperCase()}</div>
                  )}
                </button>
              </div>
            </header>

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
          <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="hidden lg:flex fixed right-[280px] top-1/2 -translate-y-1/2 z-50 w-5 h-12 bg-arena-surface border border-arena-border rounded-l-lg items-center justify-center hover:bg-arena-card transition-colors"
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
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : user.username[0].toUpperCase()}
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
              <div className="text-sm font-bold">{user.totalWins || 0}</div>
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
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-arena-text-secondary hover:bg-arena-surface hover:text-white transition-all">
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
