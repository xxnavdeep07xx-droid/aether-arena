'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Trophy, Gamepad2, Users, Coins, ChevronRight,
  CircleDot, Search, User, Eye, EyeOff, Check, X, Phone,
  AtSign, Mail, Lock, Shield, Gift, Loader2, Sparkles,
  ArrowLeft, ArrowRight
} from 'lucide-react';
import { ArenaModal } from '@/components/ui/ArenaModal';
import { cn, paiseToRupee, getStatusBg, getFormatLabel } from '@/lib/utils';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { AetherIcon } from '@/components/ui/aether-icon';
import { PASSWORD_RULES } from '@/lib/theme';

export function DiscordIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
  );
}

// Password strength indicator — enhanced with label and color-coded checks
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: `${PASSWORD_RULES.minLength}+ characters`, met: password.length >= PASSWORD_RULES.minLength },
    { label: 'Uppercase (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
  ];

  const metCount = checks.filter(c => c.met).length;
  const strengthLabel = metCount === 0 ? '' : metCount <= 1 ? 'Weak' : metCount <= 2 ? 'Fair' : metCount <= 3 ? 'Good' : 'Strong';
  const strengthColor = metCount <= 1 ? 'text-red-400' : metCount <= 2 ? 'text-orange-400' : metCount <= 3 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-2 mt-2.5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i <= metCount ? (metCount <= 1 ? 'bg-red-500' : metCount <= 2 ? 'bg-orange-500' : metCount <= 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-arena-border/50'
            )} />
          ))}
        </div>
        {strengthLabel && (
          <span className={cn('text-[11px] font-semibold ml-3 transition-colors duration-300', strengthColor)}>
            {strengthLabel}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map((check) => (
          <div key={check.label} className={cn(
            'flex items-center gap-1.5 text-[11px] transition-all duration-200',
            check.met ? 'text-green-400' : 'text-arena-text-muted/60'
          )}>
            <div className={cn(
              'w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
              check.met ? 'bg-green-500/20' : 'bg-arena-border/30'
            )}>
              {check.met ? <Check className="w-2.5 h-2.5" /> : <div className="w-1 h-1 rounded-full bg-arena-text-muted/30" />}
            </div>
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Reusable input field wrapper with icon support
function FormField({
  label,
  required,
  optional,
  icon,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[13px] font-medium text-arena-text-primary/80 mb-1.5 block">
        {label}
        {required && <span className="text-arena-accent ml-0.5">*</span>}
        {optional && <span className="text-arena-text-muted text-[11px] ml-1.5 font-normal">(optional)</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-arena-text-muted/50 pointer-events-none">
            {icon}
          </div>
        )}
        {children}
      </div>
      {error && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><X className="w-3 h-3" />{error}</p>}
      {hint && !error && <p className="text-[11px] text-arena-text-muted/60 mt-1">{hint}</p>}
    </div>
  );
}

export function LandingView() {
  const { setUser } = useAuthStore();
  const { navigate: nav } = useAppStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form
  const [signupForm, setSignupForm] = useState({
    displayName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [signupStep, setSignupStep] = useState(0); // 0=Identity, 1=Security, 2=Finish

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
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Username availability check (debounced)
  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameChecking(true);
    try {
      const res = await fetch(`/api/profiles/${username}`)
      setUsernameAvailable(!res.ok) // 404 = available
    } catch {
      setUsernameAvailable(null)
    }
    setUsernameChecking(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (signupForm.username) checkUsername(signupForm.username)
    }, 500)
    return () => clearTimeout(timer)
  }, [signupForm.username, checkUsername])

  const { data: featuredTournaments } = useQuery({
    queryKey: ['featured-tournaments'],
    queryFn: () => apiFetch<any>('/api/tournaments?featured=true&limit=4').then(d => Array.isArray(d.tournaments) ? d.tournaments : Array.isArray(d) ? d : []),
  });

  const { data: games } = useQuery({
    queryKey: ['landing-games'],
    queryFn: () => apiFetch<any>('/api/games').then(d => Array.isArray(d.games) ? d.games : Array.isArray(d) ? d : []),
  });

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => apiFetch<{ players?: number; tournaments?: number; prizesWon?: number; games?: number }>('/api/stats'),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginForm.identifier,
          password: loginForm.password,
        }),
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
    setLoginLoading(false);
  };

  const handleSendOtp = async () => {
    if (!signupForm.phone || !/^[6-9]\d{9}$/.test(signupForm.phone.replace(/\D/g, ''))) {
      toast.error('Enter a valid 10-digit Indian phone number');
      return;
    }
    toast.success('OTP sent to your phone! (Demo: use any 6-digit code)');
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 6) {
      setOtpVerified(true);
      toast.success('Phone number verified!');
    } else {
      toast.error('Enter a valid 6-digit OTP');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    // Validate password
    if (signupForm.password.length < 8 || !/[A-Z]/.test(signupForm.password) || !/[a-z]/.test(signupForm.password) || !/[0-9]/.test(signupForm.password)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase, and a number');
      return;
    }

    // Validate confirm password
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate phone if provided
    if (signupForm.phone && !/^[6-9]\d{9}$/.test(signupForm.phone.replace(/\D/g, ''))) {
      toast.error('Enter a valid 10-digit Indian phone number');
      return;
    }

    setSignupLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupForm.email,
          username: signupForm.username,
          displayName: signupForm.displayName,
          phone: signupForm.phone || undefined,
          password: signupForm.password,
          referralCode: signupForm.referralCode || undefined,
        }),
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
    setSignupLoading(false);
  };

  // Enhanced input styles
  const inputBase = "w-full bg-arena-surface/50 border border-arena-border/60 rounded-xl text-sm text-arena-text-primary placeholder:text-arena-text-muted/40 focus:outline-none focus:border-arena-accent/70 focus:ring-2 focus:ring-arena-accent/10 transition-all duration-200";
  const inputDefault = cn(inputBase, "px-4 py-3 h-12");
  const inputWithIcon = cn(inputBase, "pl-10 pr-4 py-3 h-12");
  const inputWithRightAction = cn(inputBase, "pl-10 pr-12 py-3 h-12");

  // Username validation state
  const usernameValid = signupForm.username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(signupForm.username);
  const usernameError = signupForm.username.length > 0 && !usernameValid
    ? 'Only letters, numbers, underscores, and hyphens'
    : usernameValid && usernameAvailable === false
    ? 'This username is already taken'
    : undefined;

  // Step validation
  const isStep0Valid = signupForm.username.length >= 3 && usernameValid && usernameAvailable === true && signupForm.email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email);
  const isStep1Valid = signupForm.password.length >= 8 && /[A-Z]/.test(signupForm.password) && /[a-z]/.test(signupForm.password) && /[0-9]/.test(signupForm.password) && signupForm.password === signupForm.confirmPassword;
  const isStep2Valid = agreedToTerms;

  const goNextStep = () => {
    if (signupStep === 0 && !isStep0Valid) {
      if (!signupForm.username || !usernameValid) toast.error('Please enter a valid username');
      else if (usernameAvailable !== true) toast.error('Username must be available');
      else if (!signupForm.email) toast.error('Email is required');
      else toast.error('Please fill all required fields');
      return;
    }
    if (signupStep === 1 && !isStep1Valid) {
      if (signupForm.password.length < 8 || !/[A-Z]/.test(signupForm.password) || !/[a-z]/.test(signupForm.password) || !/[0-9]/.test(signupForm.password)) toast.error('Password must be 8+ chars with uppercase, lowercase, and number');
      else if (signupForm.password !== signupForm.confirmPassword) toast.error('Passwords do not match');
      return;
    }
    setSignupStep(s => Math.min(s + 1, 2));
  };

  const goPrevStep = () => setSignupStep(s => Math.max(s - 1, 0));

  // Reset step when modal opens/closes
  const openSignup = () => { setSignupStep(0); setShowSignup(true); };
  const closeSignup = () => { setShowSignup(false); setSignupStep(0); };

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
            <button onClick={openSignup} className="px-3 py-1.5 text-xs font-medium bg-arena-accent hover:bg-arena-accent-light text-white rounded-lg transition-all duration-200">Sign Up</button>
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
                <button onClick={openSignup} className="px-8 py-3 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-arena-accent/25 hover:-translate-y-0.5">
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
                <div className="energy-aura" />
                <div className="energy-swirl" />
                <div className="energy-swirl energy-swirl-2" />
                <div className="energy-ring energy-ring-1" />
                <div className="energy-ring energy-ring-2" />
                <div className="energy-ring energy-ring-3" />
                <div className="energy-particle energy-particle-1" />
                <div className="energy-particle energy-particle-2" />
                <div className="energy-particle energy-particle-3" />
                <div className="energy-particle energy-particle-4" />
                <div className="energy-particle energy-particle-5" />
                <div className="energy-particle energy-particle-6" />
                <div className="energy-streak energy-streak-1" />
                <div className="energy-streak energy-streak-2" />
                <div className="energy-streak energy-streak-3" />
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
            { icon: Coins, label: 'Prizes Won', value: stats?.prizesWon != null ? `₹${(stats.prizesWon / 100).toLocaleString('en-IN')}` : '...' },
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
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getStatusBg(t?.status))}>{t?.status ? t.status.replace(/_/g, ' ') : ''}</span>
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
              <span className="text-xs text-arena-text-muted">&copy; {new Date().getFullYear()} Aether Arena. All rights reserved.</span>
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

      {/* ===== LOGIN MODAL ===== */}
      <ArenaModal open={showLogin} onClose={() => setShowLogin(false)} title="Welcome Back" description="Sign in to your Aether Arena account" icon={<User className="w-5 h-5" />}>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-arena-text-primary/80 mb-1.5 block">Username, Email, or Phone</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-arena-text-muted/50"><User className="w-4.5 h-4.5" /></div>
              <input type="text" required value={loginForm.identifier} onChange={e => setLoginForm({ ...loginForm, identifier: e.target.value })} className={inputWithIcon} placeholder="username / your@email.com / 9876543210" />
            </div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-arena-text-primary/80 mb-1.5 block">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-arena-text-muted/50"><Lock className="w-4.5 h-4.5" /></div>
              <input type={showPassword ? "text" : "password"} required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className={cn(inputBase, "pl-10 pr-12 py-3 h-12")} placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-text-muted hover:text-arena-text-primary transition-colors p-1 rounded-md hover:bg-arena-surface">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loginLoading} className="w-full py-3 h-12 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {loginLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : 'Log In'}
          </button>
          {/* Discord OAuth */}
          <div className="relative flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-arena-border/50" />
            <span className="text-[11px] text-arena-text-muted/60">or continue with</span>
            <div className="flex-1 h-px bg-arena-border/50" />
          </div>
          <button type="button" onClick={() => { window.location.href = '/api/auth/discord'; }}
            className="w-full py-3 h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5">
            <DiscordIcon />
            Continue with Discord
          </button>
          <p className="text-center text-[13px] text-arena-text-muted mt-1">
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => { setShowLogin(false); openSignup(); }} className="text-arena-accent hover:underline font-medium transition-colors duration-150">Sign Up</button>
          </p>
        </form>
      </ArenaModal>

      {/* ===== SIGNUP MODAL — MULTI-STEP WIZARD ===== */}
      <ArenaModal open={showSignup} onClose={closeSignup} title="Create Account" description={signupStep === 0 ? 'Tell us who you are' : signupStep === 1 ? 'Secure your account' : 'Almost there!'} icon={<Sparkles className="w-5 h-5" />} size="lg">
        <form onSubmit={handleSignup} className="space-y-0">

          {/* ── Stepper Progress ─────────────────────── */}
          <div className="flex items-center gap-2 mb-5">
            {[
              { icon: User, label: 'Identity' },
              { icon: Lock, label: 'Security' },
              { icon: Sparkles, label: 'Finish' },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300',
                    i < signupStep ? 'bg-green-500/20 text-green-400' :
                    i === signupStep ? 'bg-arena-accent/20 text-arena-accent' :
                    'bg-arena-border/30 text-arena-text-muted/40'
                  )}>
                    {i < signupStep ? <Check className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className={cn(
                    'text-[11px] font-medium hidden sm:inline transition-colors duration-300',
                    i <= signupStep ? 'text-arena-text-primary' : 'text-arena-text-muted/40'
                  )}>{step.label}</span>
                </div>
                {i < 2 && (
                  <div className={cn(
                    'h-0.5 flex-1 mx-1 rounded-full transition-all duration-300',
                    i < signupStep ? 'bg-green-500/40' : 'bg-arena-border/30'
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 0: Identity ─────────────────────── */}
          {signupStep === 0 && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Display Name */}
              <FormField label="Display Name" optional icon={<User className="w-4.5 h-4.5" />}>
                <input
                  type="text"
                  value={signupForm.displayName}
                  onChange={e => setSignupForm({ ...signupForm, displayName: e.target.value })}
                  className={inputWithIcon}
                  placeholder="What should we call you?"
                  autoFocus
                />
              </FormField>

              {/* Username with availability check */}
              <FormField
                label="Username"
                required
                icon={<AtSign className="w-4.5 h-4.5" />}
                error={usernameError}
                hint={!signupForm.username ? '3-20 characters. Letters, numbers, _ and - only.' : undefined}
              >
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signupForm.username}
                    onChange={e => setSignupForm({ ...signupForm, username: e.target.value.replace(/\s/g, '').toLowerCase() })}
                    className={cn(inputBase, "pl-10 pr-10 py-3 h-12", usernameValid && usernameAvailable === true && "border-green-500/40 focus:border-green-500/60", usernameValid && usernameAvailable === false && "border-red-500/40 focus:border-red-500/60")}
                    placeholder="unique_username"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameChecking && <Loader2 className="w-4 h-4 text-arena-text-muted animate-spin" />}
                    {!usernameChecking && usernameValid && usernameAvailable === true && <Check className="w-4 h-4 text-green-400" />}
                    {!usernameChecking && usernameValid && usernameAvailable === false && <X className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
              </FormField>

              {/* Email */}
              <FormField label="Email Address" required icon={<Mail className="w-4.5 h-4.5" />}>
                <input
                  type="email"
                  required
                  value={signupForm.email}
                  onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                  className={inputWithIcon}
                  placeholder="your@email.com"
                />
              </FormField>

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={goNextStep} disabled={!isStep0Valid}
                  className="w-full py-3 h-12 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Discord OAuth */}
              <div className="relative flex items-center gap-3 my-0.5">
                <div className="flex-1 h-px bg-arena-border/50" />
                <span className="text-[11px] text-arena-text-muted/60">or sign up with</span>
                <div className="flex-1 h-px bg-arena-border/50" />
              </div>
              <button type="button" onClick={() => { window.location.href = '/api/auth/discord'; }}
                className="w-full py-3 h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98]">
                <DiscordIcon />
                Continue with Discord
              </button>
            </div>
          )}

          {/* ── Step 1: Security ─────────────────────── */}
          {signupStep === 1 && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Password */}
              <FormField label="Create Password" required icon={<Lock className="w-4.5 h-4.5" />}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={signupForm.password}
                    onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                    className={cn(inputBase, "pl-10 pr-12 py-3 h-12")}
                    placeholder="Create a strong password"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-arena-text-muted hover:text-arena-text-primary transition-colors p-1 rounded-md hover:bg-arena-surface">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupForm.password && <PasswordStrength password={signupForm.password} />}
              </FormField>

              {/* Confirm Password */}
              <FormField
                label="Confirm Password"
                required
                icon={<Shield className="w-4.5 h-4.5" />}
                error={signupForm.confirmPassword.length > 0 && signupForm.password !== signupForm.confirmPassword ? 'Passwords do not match' : undefined}
              >
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={signupForm.confirmPassword}
                    onChange={e => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className={cn(inputBase, "pl-10 pr-10 py-3 h-12", signupForm.confirmPassword.length > 0 && signupForm.password === signupForm.confirmPassword && "border-green-500/40 focus:border-green-500/60")}
                    placeholder="Re-enter your password"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {signupForm.confirmPassword.length > 0 && signupForm.password === signupForm.confirmPassword && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-arena-text-muted hover:text-arena-text-primary transition-colors p-0.5 rounded-md hover:bg-arena-surface">
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </FormField>

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={goPrevStep}
                  className="px-5 h-12 border border-arena-border hover:border-arena-accent/40 text-arena-text-secondary hover:text-arena-text-primary font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="button" onClick={goNextStep} disabled={!isStep1Valid}
                  className="flex-1 py-3 h-12 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Finish ─────────────────────── */}
          {signupStep === 2 && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Phone with OTP */}
              <FormField label="Phone Number" optional icon={<Phone className="w-4.5 h-4.5" />}>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-arena-text-muted/60 font-medium">+91</div>
                    <input
                      type="tel"
                      value={signupForm.phone}
                      onChange={e => setSignupForm({ ...signupForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      className={cn(inputBase, "pl-12 pr-4 py-3 h-12")}
                      placeholder="9876543210"
                      autoFocus
                    />
                  </div>
                  {!otpVerified && (
                    <button type="button" onClick={handleSendOtp} disabled={!signupForm.phone || signupForm.phone.length !== 10}
                      className="px-4 h-12 bg-arena-accent/15 text-arena-accent text-[12px] font-semibold rounded-xl hover:bg-arena-accent/25 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap border border-arena-accent/20">
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                  {otpVerified && (
                    <div className="flex items-center gap-1.5 px-4 h-12 bg-green-500/10 border border-green-500/20 text-green-400 text-[12px] font-semibold rounded-xl">
                      <Check className="w-4 h-4" /> Verified
                    </div>
                  )}
                </div>
                {/* OTP Input */}
                {otpSent && !otpVerified && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={cn(inputBase, "h-10 text-center tracking-[0.4em] font-mono text-base px-3 py-2")}
                      placeholder="000000"
                      maxLength={6}
                    />
                    <button type="button" onClick={handleVerifyOtp} disabled={otp.length !== 6}
                      className="px-4 h-10 bg-green-500/15 border border-green-500/20 text-green-400 text-[12px] font-semibold rounded-xl hover:bg-green-500/25 active:scale-95 transition-all disabled:opacity-30">
                      Verify
                    </button>
                  </div>
                )}
              </FormField>

              {/* Referral Code — collapsible */}
              {!showReferral ? (
                <button type="button" onClick={() => setShowReferral(true)} className="flex items-center gap-1.5 text-[12px] text-arena-accent/70 hover:text-arena-accent transition-colors">
                  <Gift className="w-3.5 h-3.5" />
                  Have a referral code?
                </button>
              ) : (
                <FormField label="Referral Code" optional icon={<Gift className="w-4.5 h-4.5" />}>
                  <input
                    type="text"
                    value={signupForm.referralCode}
                    onChange={e => setSignupForm({ ...signupForm, referralCode: e.target.value })}
                    className={inputWithIcon}
                    placeholder="Enter referral code"
                  />
                </FormField>
              )}

              {/* Terms & Conditions */}
              <label className="flex items-start gap-3 mt-1 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                    agreedToTerms
                      ? 'bg-arena-accent border-arena-accent'
                      : 'border-arena-border/60 group-hover:border-arena-accent/40'
                  )}>
                    {agreedToTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </div>
                <span className="text-[12px] text-arena-text-muted leading-relaxed">
                  I agree to the{' '}
                  <button type="button" onClick={() => nav('terms-conditions')} className="text-arena-accent hover:underline">Terms &amp; Conditions</button>
                  {' '}and{' '}
                  <button type="button" onClick={() => nav('privacy-policy')} className="text-arena-accent hover:underline">Privacy Policy</button>
                </span>
              </label>

              {/* Navigation */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={goPrevStep}
                  className="px-5 h-12 border border-arena-border hover:border-arena-accent/40 text-arena-text-secondary hover:text-arena-text-primary font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98]">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" disabled={signupLoading || !agreedToTerms}
                  className="flex-1 py-3 h-12 bg-arena-accent hover:bg-arena-accent-light text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]">
                  {signupLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Sparkles className="w-4 h-4" /> Create Account</>}
                </button>
              </div>
            </div>
          )}

          {/* Footer — always visible */}
          {signupStep === 0 && (
            <p className="text-center text-[13px] text-arena-text-muted mt-2">
              Already have an account?{' '}
              <button type="button" onClick={() => { closeSignup(); setShowLogin(true); }} className="text-arena-accent hover:underline font-medium transition-colors duration-150">Log In</button>
            </p>
          )}
        </form>
      </ArenaModal>
    </div>
  );
}
