'use client';

import { useAppStore, useAuthStore, type ViewName } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Home,
  Trophy,
  BarChart3,
  Tv,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  icon: typeof Home;
  label: string;
  view: ViewName;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', view: 'home' },
  { icon: Trophy, label: 'Tournaments', view: 'tournaments' },
  { icon: BarChart3, label: 'Leaderboard', view: 'leaderboard' },
  { icon: Tv, label: 'Streams', view: 'streams' },
  { icon: User, label: 'Profile', view: 'profile' },
];

export function LeftSidebar() {
  const { currentView, navigate } = useAppStore();
  const { user, logout } = useAuthStore();

  if (currentView === 'landing') return null;

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-arena-surface border-r border-arena-border flex flex-col items-center py-4 z-50">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="w-11 h-11 rounded-xl overflow-hidden mb-6 hover:opacity-80 transition-opacity"
        >
          <img src="/logo-md.webp" alt="AA" className="w-full h-full object-cover" />
        </button>

        {/* Nav Icons */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.view || (item.view === 'tournaments' && currentView === 'tournament-detail');
            return (
              <Tooltip key={item.view}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(item.view)}
                    className={cn(
                      'relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200',
                      isActive
                        ? 'bg-arena-accent text-white shadow-[0_0_20px_rgba(255,75,92,0.4)]'
                        : 'text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card'
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
                    )}
                    <item.icon className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <p className="text-xs font-medium">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('admin-dashboard')}
                className={cn(
                  'relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200',
                  currentView.startsWith('admin')
                    ? 'bg-arena-accent text-white shadow-[0_0_20px_rgba(255,75,92,0.4)]'
                    : 'text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card'
                )}
              >
                {currentView.startsWith('admin') && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
                )}
                <Settings className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p className="text-xs font-medium">Settings</p>
            </TooltipContent>
          </Tooltip>
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-2">
          {user?.avatarUrl ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('profile')}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-arena-border hover:border-arena-accent transition-colors"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="text-xs font-medium">{user.displayName || user.username}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('profile')}
                  className="w-10 h-10 rounded-full bg-arena-card border-2 border-arena-border hover:border-arena-accent transition-colors flex items-center justify-center text-sm font-semibold text-arena-text-secondary"
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <p className="text-xs font-medium">Profile</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-arena-text-muted hover:text-arena-accent hover:bg-arena-card transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p className="text-xs font-medium">Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
