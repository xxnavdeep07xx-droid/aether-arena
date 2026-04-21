'use client';

import { useAppStore, useAuthStore, ViewName } from '@/lib/store';
import { useEffect } from 'react';
import {
  Trophy, Zap, Shield, ChevronRight,
  Tv, BarChart3, User, Home, LogOut,
  Bell, Menu, X, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

// View imports
import { LandingSkeleton, HomeSkeleton, TournamentsSkeleton, LeaderboardSkeleton, StreamsSkeleton, ProfileSkeleton, NotificationsSkeleton } from '@/components/views/Skeletons';
import { LandingView } from '@/components/views/LandingView';
import { HomeView } from '@/components/views/HomeView';
import { TournamentsView } from '@/components/views/TournamentsView';
import { TournamentDetailView } from '@/components/views/TournamentDetailView';
import { LeaderboardView } from '@/components/views/LeaderboardView';
import { StreamsView } from '@/components/views/StreamsView';
import { ProfileView } from '@/components/views/ProfileView';
import { NotificationsView } from '@/components/views/NotificationsView';
import { TopupFullView } from '@/components/views/TopupView';
import {
  AdminDashboardView, AdminTournamentsView, AdminTournamentCreateView,
  AdminRegistrationsView, AdminGamesView, AdminStreamsView,
  AdminAffiliatesView, AdminTopupView, AdminAnalyticsView, AdminSettingsView
} from '@/components/views/AdminViews';
import { PrivacyPolicyView, TermsConditionsView, RefundPolicyView, ContactView } from '@/components/views/StaticPages';
import { SubViewHeader } from '@/components/views/SubViewHeader';
import { RightPanelContent } from '@/components/views/RightPanelContent';
import { SearchBarInput } from '@/components/views/SearchBarInput';

// ==================== VIEW RENDERER ====================

function ViewRenderer() {
  const { currentView } = useAppStore();
  const { isLoading } = useAuthStore();

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
    'topup': <TopupFullView />,
  };

  return (
    <div key={currentView} className="animate-fade-in">
      {viewMap[currentView] || <HomeView />}
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function Page() {
  const { currentView, navigate, mobileMenuOpen, setMobileMenuOpen, rightPanelCollapsed, setRightPanelCollapsed } = useAppStore();
  const { isAuthenticated, user, logout } = useAuthStore();
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
    { view: 'topup' as ViewName, icon: Zap, label: 'Quick Top Up' },
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

  // Auto-setup: ensure DB tables exist on first load
  useEffect(() => {
    fetch('/api/setup').catch(() => {});
  }, []);

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
                  {navItems.filter(item => !['home', 'tournaments', 'leaderboard', 'streams', 'topup', 'profile'].includes(item.view)).map(item => (
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
            {(['home', 'tournaments', 'leaderboard', 'streams', 'topup', 'profile', 'notifications'] as ViewName[]).includes(currentView) && (
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
            {/* Minimal header for sub-views with back button + title */}
            {!['home', 'tournaments', 'leaderboard', 'streams', 'topup', 'profile', 'notifications'].includes(currentView) && (
              <>
                <div className="h-12 flex items-center px-3 md:px-6 border-b border-arena-border flex-shrink-0 bg-arena-dark/80 backdrop-blur-xl gap-3">
                  <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="md:hidden w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center flex-shrink-0">
                    <Menu className="w-5 h-5" />
                  </button>
                  <SubViewHeader currentView={currentView} />
                </div>
              </>
            )}

            {/* Content + Right Panel */}
            <div className="flex flex-1 overflow-hidden">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
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

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
}

// ==================== MOBILE BOTTOM NAV ====================

function MobileBottomNav() {
  const { currentView, navigate } = useAppStore();

  const tabs = [
    { view: 'home' as ViewName, icon: Home, label: 'Home' },
    { view: 'tournaments' as ViewName, icon: Trophy, label: 'Tourneys' },
    { view: 'leaderboard' as ViewName, icon: BarChart3, label: 'Ranks' },
    { view: 'topup' as ViewName, icon: Zap, label: 'Top Up' },
    { view: 'streams' as ViewName, icon: Tv, label: 'Streams' },
    { view: 'profile' as ViewName, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-arena-surface/95 backdrop-blur-xl border-t border-arena-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map(tab => {
          const isActive = currentView === tab.view;
          return (
            <button key={tab.view} onClick={() => navigate(tab.view)} aria-label={tab.label}
              className={cn('flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-xl transition-all duration-200 relative',
                isActive ? 'text-arena-accent' : 'text-arena-text-muted')}>
              {isActive && <div className="absolute -top-[1px] w-5 h-0.5 bg-arena-accent rounded-full" />}
              <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
