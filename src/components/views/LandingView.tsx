'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Trophy, Gamepad2, Users, Coins, ChevronRight,
  CircleDot, Search, User
} from 'lucide-react';
import { ArenaModal } from '@/components/ui/ArenaModal';
import { cn, paiseToRupee, getStatusBg, getFormatLabel } from '@/lib/utils';
import { toast } from 'sonner';

export function DiscordIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
  );
}

export function LandingView() {
  const { setUser } = useAuthStore();
  const { navigate: nav } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', username: '', displayName: '' });
  const [loading, setLoading] = useState(false);

  // Handle OAuth error params from Discord callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      const errorMessages: Record<string, string> = {
        'discord_oauth_cancelled': 'Discord login was cancelled.',
        'no_code': 'No authorization code received. Please try again.',
        'discord_oauth_failed': 'Discord login failed. Please try again.',
        'account_banned': 'This account has been banned.',
      };
      toast.error(errorMessages[error] || `Login error: ${error}`);
      // Clean URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
    if (signupForm.password.length < 8 || !/[A-Z]/.test(signupForm.password) || !/[a-z]/.test(signupForm.password) || !/[0-9]/.test(signupForm.password)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase, and a number');
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
            <Image src="/logo-md.webp" alt="Aether Arena" width={36} height={36} className="w-9 h-9 rounded-xl logo-energy" />
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowLogin(true)} className="px-3 py-1.5 text-xs font-medium border border-arena-border text-arena-text-secondary hover:text-arena-text-primary hover:border-arena-accent/50 rounded-lg transition-all duration-200">Log In</button>
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
                <button onClick={() => setShowLogin(true)} className="px-8 py-3 border border-arena-border hover:border-arena-accent/50 text-arena-text-primary font-semibold rounded-xl transition-all duration-200">
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
            { step: '02', title: 'Register & Pay', desc: 'Sign up instantly. Free tournaments need no payment. Paid ones use secure Razorpay checkout.', icon: User },
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
                <Image src="/logo-md.webp" alt="Aether Arena" width={32} height={32} className="w-8 h-8 rounded-xl" />
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
                <li><a href="https://discord.gg/aetherarena" target="_blank" rel="noopener noreferrer" className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">Discord</a></li>
                <li><button onClick={() => nav('terms-conditions')} className="text-sm text-arena-text-secondary hover:text-arena-accent transition-colors duration-150">FAQ</button></li>
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
              <Image src="/logo-md.webp" alt="Aether Arena" width={24} height={24} className="w-6 h-6 rounded-lg" />
              <span className="text-xs text-arena-text-muted">© {new Date().getFullYear()} Aether Arena. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              {[
                { name: 'Twitter', url: 'https://twitter.com/aetherarena' },
                { name: 'Discord', url: 'https://discord.gg/aetherarena' },
                { name: 'YouTube', url: 'https://youtube.com/@aetherarena' },
                { name: 'Instagram', url: 'https://instagram.com/aetherarena' },
              ].map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-arena-text-muted hover:text-arena-accent transition-colors duration-150">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <ArenaModal open={showLogin} onClose={() => setShowLogin(false)} title="Welcome Back" description="Sign in to your Aether Arena account" icon={<User className="w-5 h-5" />}>
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
            <DiscordIcon />
            Discord
          </button>
          <p className="text-center text-sm text-arena-text-muted">
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => { setShowLogin(false); setShowSignup(true); }} className="text-arena-accent hover:underline transition-colors duration-150">Sign Up</button>
          </p>
        </form>
      </ArenaModal>

      {/* Signup Modal */}
      <ArenaModal open={showSignup} onClose={() => setShowSignup(false)} title="Create Account" description="Join Aether Arena and start competing" icon={<User className="w-5 h-5" />}>
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
            <input type="password" required minLength={8} value={signupForm.password} onChange={e => setSignupForm({ ...signupForm, password: e.target.value })} className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 h-11 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150" placeholder="Min 8 chars, upper+lower+digit" />
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
            <DiscordIcon />
            Continue with Discord
          </button>
          <p className="text-center text-sm text-arena-text-muted">
            Already have an account?{' '}
            <button type="button" onClick={() => { setShowSignup(false); setShowLogin(true); }} className="text-arena-accent hover:underline transition-colors duration-150">Log In</button>
          </p>
        </form>
      </ArenaModal>
    </div>
  );
}
