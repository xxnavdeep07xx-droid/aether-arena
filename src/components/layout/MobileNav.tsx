'use client';

import { useAppStore, useAuthStore, type ViewName } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Menu, X, Home, Trophy, BarChart3, Tv, User, LogOut, Settings } from 'lucide-react';

interface MobileNavItem {
  icon: typeof Home;
  label: string;
  view: ViewName;
}

const mobileNavItems: MobileNavItem[] = [
  { icon: Home, label: 'Home', view: 'home' },
  { icon: Trophy, label: 'Tournaments', view: 'tournaments' },
  { icon: BarChart3, label: 'Leaderboard', view: 'leaderboard' },
  { icon: Tv, label: 'Streams', view: 'streams' },
  { icon: User, label: 'Profile', view: 'profile' },
];

export function MobileNav() {
  const { currentView, mobileMenuOpen, setMobileMenuOpen, navigate } = useAppStore();
  const { user, logout } = useAuthStore();

  if (currentView === 'landing') return null;

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-3.5 left-4 z-[60] w-10 h-10 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-arena-text-primary md:hidden"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[70] md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Slide-in menu */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-72 bg-arena-surface border-r border-arena-border z-[80] flex flex-col md:hidden transition-transform duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-arena-border">
          <button
            onClick={() => {
              navigate('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5"
          >
            <img src="/logo-md.webp" alt="AA" className="w-9 h-9 rounded-xl" />
            <span className="text-lg font-bold text-arena-text-primary">Aether Arena</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-arena-text-muted hover:text-arena-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="p-4 border-b border-arena-border">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-arena-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-arena-accent/20 flex items-center justify-center text-sm font-bold text-arena-accent">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-arena-text-primary">
                  {user.displayName || user.username}
                </p>
                <p className="text-xs text-arena-text-muted">@{user.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {mobileNavItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  navigate(item.view);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-arena-accent text-white'
                    : 'text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}

          {user?.isAdmin && (
            <button
              onClick={() => {
                navigate('admin-dashboard');
                setMobileMenuOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                currentView.startsWith('admin')
                  ? 'bg-arena-accent text-white'
                  : 'text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card'
              )}
            >
              <Settings className="w-5 h-5" />
              Admin Panel
            </button>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-arena-border">
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-arena-text-muted hover:text-arena-accent hover:bg-arena-card transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
