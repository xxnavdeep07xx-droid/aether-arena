'use client';

import { useAppStore, useAuthStore, ViewName } from '@/lib/store';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, Zap, Shield, ChevronRight,
  Tv, BarChart3, User, Home, LogOut,
  Bell, Menu, X, Search, Settings, FileText,
  ShieldCheck, Mail, HelpCircle, Wallet
} from 'lucide-react';
import { AetherIcon } from '@/components/ui/aether-icon';
import { cn } from '@/lib/utils';
import { AETHER_SYMBOL } from '@/lib/aether';
import { useTranslation } from '@/lib/i18n';

// Skeleton fallbacks
import { LandingSkeleton, HomeSkeleton, TournamentsSkeleton, LeaderboardSkeleton, StreamsSkeleton, ProfileSkeleton, NotificationsSkeleton } from '@/components/views/Skeletons';
import Image from 'next/image';

// Keep LandingView static for instant load
import { LandingView } from '@/components/views/LandingView';

// Lazy load ALL other views
const HomeView = lazy(() => import('@/components/views/HomeView').then(m => ({ default: m.HomeView })));
const TournamentsView = lazy(() => import('@/components/views/TournamentsView').then(m => ({ default: m.TournamentsView })));
const TournamentDetailView = lazy(() => import('@/components/views/TournamentDetailView').then(m => ({ default: m.TournamentDetailView })));
const LeaderboardView = lazy(() => import('@/components/views/LeaderboardView').then(m => ({ default: m.LeaderboardView })));
const StreamsView = lazy(() => import('@/components/views/StreamsView').then(m => ({ default: m.StreamsView })));
const ProfileView = lazy(() => import('@/components/views/ProfileView').then(m => ({ default: m.ProfileView })));
const NotificationsView = lazy(() => import('@/components/views/NotificationsView').then(m => ({ default: m.NotificationsView })));
const SettingsView = lazy(() => import('@/components/views/SettingsView').then(m => ({ default: m.SettingsView })));

// Admin views grouped as one lazy chunk
const AdminViewsLazy = lazy(() => import('@/components/views/AdminViews').then(m => ({
  default: function AdminViewsRouter(props: { view: string }) {
    const viewMap: Record<string, any> = {
      'admin-dashboard': m.AdminDashboardView,
      'admin-tournaments': m.AdminTournamentsView,
      'admin-tournament-create': m.AdminTournamentCreateView,
      'admin-registrations': m.AdminRegistrationsView,
      'admin-games': m.AdminGamesView,
      'admin-streams': m.AdminStreamsView,
      'admin-affiliates': m.AdminAffiliatesView,
      'admin-topup': m.AdminTopupView,
      'admin-analytics': m.AdminAnalyticsView,
      'admin-settings': m.AdminSettingsView,
      'admin-redemptions': m.AdminRedemptionsView,
      'admin-aether-manage': m.AdminAetherManageView,
    };
    const Component = viewMap[props.view];
    return Component ? <Component /> : null;
  }
})));

// Aether views grouped as one lazy chunk
const EarnAetherViews = lazy(() => import('@/components/views/EarnAetherView').then(m => ({
  default: function AetherRouter(props: { view: string }) {
    const viewMap: Record<string, any> = {
      'aether': m.AetherView,
      'aether-tasks': m.AetherTasks,
      'aether-redeem': m.AetherRedeem,
      'aether-history': m.AetherHistory,
    };
    const Component = viewMap[props.view];
    return Component ? <Component /> : null;
  }
})));

// Static pages grouped as one lazy chunk
const StaticPagesLazy = lazy(() => import('@/components/views/StaticPages').then(m => ({
  default: function StaticRouter(props: { view: string }) {
    const viewMap: Record<string, any> = {
      'privacy-policy': m.PrivacyPolicyView,
      'terms-conditions': m.TermsConditionsView,
      'refund-policy': m.RefundPolicyView,
      'contact': m.ContactView,
    };
    const Component = viewMap[props.view];
    return Component ? <Component /> : null;
  }
})));

// Static utility imports (small components)
import { SubViewHeader } from '@/components/views/SubViewHeader';
import { RightPanelContent } from '@/components/views/RightPanelContent';
import { SearchBarInput } from '@/components/views/SearchBarInput';

// ==================== NOTIFICATION BADGE ====================

function useUnreadCount() {
  const { isAuthenticated } = useAuthStore();
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => fetch('/api/notifications?limit=1').then(r => r.json()).then(d => d.unreadCount || 0),
    refetchInterval: 30000,
    enabled: isAuthenticated,
  });
  return unreadCount || 0;
}

function BellWithBadge({ className }: { className?: string }) {
  const unread = useUnreadCount();
  return (
    <span className="relative">
      <Bell className={className || 'w-5 h-5'} />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold leading-none">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </span>
  );
}

// ==================== VIEW FALLBACK ====================

function ViewFallback() {
  return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-arena-accent border-t-transparent rounded-full animate-spin" /></div>;
}

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
    'home': <Suspense fallback={<HomeSkeleton />}><HomeView /></Suspense>,
    'tournaments': <Suspense fallback={<TournamentsSkeleton />}><TournamentsView /></Suspense>,
    'tournament-detail': <Suspense fallback={<ViewFallback />}><TournamentDetailView /></Suspense>,
    'leaderboard': <Suspense fallback={<LeaderboardSkeleton />}><LeaderboardView /></Suspense>,
    'streams': <Suspense fallback={<StreamsSkeleton />}><StreamsView /></Suspense>,
    'profile': <Suspense fallback={<ProfileSkeleton />}><ProfileView /></Suspense>,
    'notifications': <Suspense fallback={<NotificationsSkeleton />}><NotificationsView /></Suspense>,
    'settings': <Suspense fallback={<ViewFallback />}><SettingsView /></Suspense>,
    // Admin views routed through grouped lazy chunk
    'admin-dashboard': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-dashboard" /></Suspense>,
    'admin-tournaments': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-tournaments" /></Suspense>,
    'admin-tournament-create': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-tournament-create" /></Suspense>,
    'admin-registrations': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-registrations" /></Suspense>,
    'admin-games': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-games" /></Suspense>,
    'admin-streams': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-streams" /></Suspense>,
    'admin-affiliates': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-affiliates" /></Suspense>,
    'admin-topup': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-topup" /></Suspense>,
    'admin-analytics': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-analytics" /></Suspense>,
    'admin-settings': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-settings" /></Suspense>,
    'admin-redemptions': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-redemptions" /></Suspense>,
    'admin-aether-manage': <Suspense fallback={<ViewFallback />}><AdminViewsLazy view="admin-aether-manage" /></Suspense>,
    // Aether views routed through grouped lazy chunk
    'aether': <Suspense fallback={<ViewFallback />}><EarnAetherViews view="aether" /></Suspense>,
    'aether-tasks': <Suspense fallback={<ViewFallback />}><EarnAetherViews view="aether-tasks" /></Suspense>,
    'aether-redeem': <Suspense fallback={<ViewFallback />}><EarnAetherViews view="aether-redeem" /></Suspense>,
    'aether-history': <Suspense fallback={<ViewFallback />}><EarnAetherViews view="aether-history" /></Suspense>,
    // Static pages routed through grouped lazy chunk
    'privacy-policy': <Suspense fallback={<ViewFallback />}><StaticPagesLazy view="privacy-policy" /></Suspense>,
    'terms-conditions': <Suspense fallback={<ViewFallback />}><StaticPagesLazy view="terms-conditions" /></Suspense>,
    'refund-policy': <Suspense fallback={<ViewFallback />}><StaticPagesLazy view="refund-policy" /></Suspense>,
    'contact': <Suspense fallback={<ViewFallback />}><StaticPagesLazy view="contact" /></Suspense>,
  };

  return (
    <div key={currentView} className="animate-fade-in">
      {viewMap[currentView] || <Suspense fallback={<HomeSkeleton />}><HomeView /></Suspense>}
    </div>
  );
}

// ==================== MAIN PAGE ====================

export default function Page() {
  const { currentView, navigate, mobileMenuOpen, setMobileMenuOpen, rightPanelCollapsed, setRightPanelCollapsed } = useAppStore();
  const { isAuthenticated, user, logout, aetherBalance, setAetherBalance } = useAuthStore();
  const isLanding = currentView === 'landing';
  const isAdmin = user?.isAdmin;
  const [searchFocused, setSearchFocused] = useState(false);

  // Fetch aether balance for header display
  useQuery({
    queryKey: ['aether-balance-header'],
    queryFn: () => fetch('/api/aether/balance').then(r => r.json()).then(d => {
      if (d.balance !== undefined) setAetherBalance(d.balance);
      return d;
    }),
    enabled: isAuthenticated && aetherBalance === null,
    refetchInterval: 60000,
  });

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    navigate('landing');
  };

  // Desktop sidebar items — main navigation
  const { t } = useTranslation();
  const sidebarItems = [
    { view: 'home' as ViewName, icon: Home, label: t('nav.home') },
    { view: 'tournaments' as ViewName, icon: Trophy, label: t('nav.tournaments') },
    { view: 'leaderboard' as ViewName, icon: BarChart3, label: t('nav.leaderboard') },
    { view: 'streams' as ViewName, icon: Tv, label: t('nav.streams') },
    { view: 'aether' as ViewName, icon: Wallet, label: t('nav.aether') },
    { view: 'profile' as ViewName, icon: User, label: t('nav.profile') },
    ...(isAdmin ? [{ view: 'admin-dashboard' as ViewName, icon: Shield, label: t('nav.admin') }] : []),
  ];

  // Mobile hamburger menu items — excludes bottom nav items
  const mobileMenuItems = [
    { view: 'notifications' as ViewName, icon: Bell, label: t('nav.notifications') },
    { view: 'settings' as ViewName, icon: Settings, label: t('nav.settings') },
    { view: 'aether' as ViewName, icon: Wallet, label: t('nav.aether') },
    { view: 'contact' as ViewName, icon: Mail, label: t('nav.contact') },
    ...(isAdmin ? [
      { view: 'admin-dashboard' as ViewName, icon: Shield, label: t('nav.admin') },
    ] : []),
  ];

  const mobileMenuLinks = [
    { view: 'privacy-policy' as ViewName, icon: ShieldCheck, label: t('nav.privacyPolicy') },
    { view: 'terms-conditions' as ViewName, icon: FileText, label: t('nav.termsConditions') },
    { view: 'refund-policy' as ViewName, icon: HelpCircle, label: t('nav.refundPolicy') },
  ];

  // Views that show the main top bar (with hamburger on mobile)
  const mainViews: ViewName[] = ['home', 'tournaments', 'leaderboard', 'streams', 'profile', 'notifications', 'settings', 'admin-dashboard', 'contact', 'aether'];

  // Views where the search bar is useful and functional
  const searchableViews: ViewName[] = ['home', 'tournaments', 'leaderboard', 'streams'];

  // Section titles for views that are main sections but not in sidebar (shown in top bar)
  const sectionTitles: Record<string, { title: string; icon: typeof Shield }> = {
    'admin-dashboard': { title: t('section.adminPanel'), icon: Shield },
    'contact': { title: t('section.contactUs'), icon: Mail },
    'aether': { title: t('nav.aether'), icon: Wallet },
  };

  const currentSection = sectionTitles[currentView];

  // Redirect to home if authenticated and on landing
  useEffect(() => {
    if (isAuthenticated && currentView === 'landing') {
      navigate('home');
    }
  }, [isAuthenticated, currentView, navigate]);

  // Daily checkin: call once on mount when authenticated
  const checkinDone = useState(false);
  useEffect(() => {
    if (isAuthenticated && !checkinDone[0]) {
      fetch('/api/aether/checkin', { method: 'POST' }).catch(() => {});
      checkinDone[1](true);
    }
  }, [isAuthenticated, checkinDone]);

  return (
    <div className="min-h-screen bg-arena-dark">
      {/* Landing page - full width */}
      {isLanding ? (
        <ViewRenderer />
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Left Sidebar - Desktop */}
          <aside className="hidden md:flex flex-col items-center w-[72px] h-screen bg-arena-surface border-r border-arena-border flex-shrink-0 py-5 z-50">
            <Image onClick={() => navigate('home')} src="/logo-lg.webp" alt="Aether Arena" width={56} height={56} className="w-14 h-14 rounded-2xl mb-10 logo-energy hover:opacity-90 transition-opacity cursor-pointer" />
            <nav className="flex flex-col gap-2 flex-1">
              {sidebarItems.map(item => (
                <button key={item.view} onClick={() => navigate(item.view)} aria-label={item.label} title={item.label}
                  className={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 relative group',
                    currentView === item.view ? 'bg-arena-accent text-white shadow-lg shadow-arena-accent/25' : 'text-arena-text-secondary hover:bg-arena-card hover:text-white')}>
                  {currentView === item.view && <div className="absolute left-[-14px] w-[3px] h-5 bg-arena-accent rounded-r" />}
                  {item.view === 'aether' ? <AetherIcon size="md" /> : <item.icon className="w-5 h-5" />}
                </button>
              ))}
            </nav>
            <div className="flex flex-col gap-2 items-center">
              <button onClick={() => navigate('notifications')} aria-label="Notifications" title="Notifications" className="w-11 h-11 rounded-xl flex items-center justify-center text-arena-text-secondary hover:bg-arena-card hover:text-white transition-all duration-200">
                <BellWithBadge />
              </button>
              <button onClick={() => navigate('settings')} aria-label="Settings" title="Settings" className="w-11 h-11 rounded-xl flex items-center justify-center text-arena-text-secondary hover:bg-arena-card hover:text-white transition-all duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('profile')} aria-label="Profile" className="w-9 h-9 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold border-2 border-arena-accent/50 overflow-hidden">
                {user?.avatarUrl ? <Image src={user.avatarUrl} alt={`${user.username}'s avatar`} width={36} height={36} className="w-full h-full object-cover" unoptimized /> : (user?.username || '?')[0].toUpperCase()}
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
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-arena-surface border-r border-arena-border p-5 animate-slide-in-left overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Image src="/logo-md.webp" alt="Aether Arena" width={40} height={40} className="w-10 h-10 rounded-xl logo-energy" />
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="text-arena-text-muted hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                {/* User card */}
                {user && (
                  <div className="mb-4 flex items-center gap-3 px-3 py-2 bg-arena-card rounded-xl border border-arena-border">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0">
                      {user.avatarUrl ? <Image src={user.avatarUrl} alt={`${user.username}'s avatar`} width={40} height={40} className="w-full h-full object-cover" unoptimized /> : (user?.username || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{user.displayName || user.username}</div>
                      <div className="text-xs text-arena-text-muted truncate">@{user.username}</div>
                    </div>
                  </div>
                )}

                {/* Navigation items */}
                <nav className="space-y-1 mb-4">
                  {mobileMenuItems.map(item => (
                    <button key={item.view} onClick={() => navigate(item.view)}
                      className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                        currentView === item.view ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:bg-arena-card hover:text-white')}>
                      {item.view === 'aether' ? <AetherIcon size="md" /> : <item.icon className="w-5 h-5" />}
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Legal links */}
                {mobileMenuLinks.length > 0 && (
                  <div className="pt-3 border-t border-arena-border space-y-1 mb-4">
                    <div className="px-4 py-1 text-[10px] font-semibold text-arena-text-muted uppercase tracking-wider">Legal</div>
                    {mobileMenuLinks.map(item => (
                      <button key={item.view} onClick={() => navigate(item.view)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-arena-text-muted hover:bg-arena-card hover:text-white transition-all duration-200">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Logout */}
                <div className="pt-3 border-t border-arena-border">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-arena-text-muted hover:bg-arena-accent/10 hover:text-arena-accent transition-all duration-200">
                    <LogOut className="w-5 h-5" /> Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Bar - only on main content views */}
            {mainViews.includes(currentView) && (
              <header className="h-14 flex items-center justify-between px-3 md:px-6 border-b border-arena-border flex-shrink-0 bg-arena-dark/80 backdrop-blur-xl gap-3">
                {/* Hamburger menu (mobile) — only on main views */}
                <button onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="md:hidden w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center flex-shrink-0">
                  <Menu className="w-5 h-5" />
                </button>
                {/* Section title or search bar */}
                {currentSection ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {currentView === 'aether' ? <AetherIcon size="md" /> : <currentSection.icon className="w-5 h-5 text-arena-accent flex-shrink-0" />}
                    <h1 className="text-base font-semibold truncate">{currentSection.title}</h1>
                  </div>
                ) : searchableViews.includes(currentView) ? (
                  <div className={cn(
                    'relative transition-all duration-300 ease-in-out',
                    searchFocused ? 'flex-1 max-w-full' : 'flex-1 max-w-md'
                  )}>
                    <SearchBarInput onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
                  </div>
                ) : null}
                {/* Aether Balance in header - for authenticated users on main views (always visible) */}
                {isAuthenticated && !searchFocused && (
                  <a onClick={(e) => { e.preventDefault(); navigate('aether'); }}
                    className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-arena-card border border-arena-border hover:border-arena-accent/30 transition-all duration-200 flex-shrink-0 cursor-pointer">
                    <AetherIcon size="sm" animated />
                    <span className="text-sm font-bold text-arena-accent">{aetherBalance ?? '...'}</span>
                    <span className="hidden sm:inline text-xs text-arena-text-muted">{AETHER_SYMBOL}</span>
                  </a>
                )}
                {/* Right icons (hidden when search is focused) */}
                {!searchFocused && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => navigate('notifications')} aria-label="Notifications" className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-white hover:border-arena-accent/30 transition-all duration-200">
                      <BellWithBadge className="w-4 h-4" />
                    </button>
                    <button onClick={() => navigate('profile')} className="w-9 h-9 rounded-xl overflow-hidden border-2 border-arena-accent/50 hover:border-arena-accent transition-colors duration-150 cursor-pointer">
                      {user?.avatarUrl ? <Image src={user.avatarUrl} alt={`${user.username}'s avatar`} width={36} height={36} className="w-full h-full object-cover" unoptimized /> : (
                        <div className="w-full h-full bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-xs font-bold">{(user?.username || '?')[0].toUpperCase()}</div>
                      )}
                    </button>
                  </div>
                )}
              </header>
            )}
            {/* Minimal header for sub-views — back arrow + title */}
            {!mainViews.includes(currentView) && (
              <div className="h-12 flex items-center px-3 md:px-6 border-b border-arena-border flex-shrink-0 bg-arena-dark/80 backdrop-blur-xl">
                <SubViewHeader currentView={currentView} />
              </div>
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

          {/* Mobile Bottom Navigation — Top Up moved to hamburger menu */}
          <MobileBottomNav />
        </div>
      )}
    </div>
  );
}

// ==================== MOBILE BOTTOM NAV ====================
// 5 tabs: Home, Tourneys, Ranks, Streams, Profile
// Top Up is now in the hamburger menu

function MobileBottomNav() {
  const { currentView, navigate } = useAppStore();

  const { t: tMobile } = useTranslation();
  const tabs = [
    { view: 'home' as ViewName, icon: Home, label: tMobile('mobile.home') },
    { view: 'tournaments' as ViewName, icon: Trophy, label: tMobile('mobile.tourneys') },
    { view: 'leaderboard' as ViewName, icon: BarChart3, label: tMobile('mobile.ranks') },
    { view: 'streams' as ViewName, icon: Tv, label: tMobile('mobile.streams') },
    { view: 'profile' as ViewName, icon: User, label: tMobile('mobile.profile') },
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
