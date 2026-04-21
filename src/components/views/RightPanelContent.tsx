'use client';

import { useAppStore, useAuthStore, ViewName } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { Trophy, BarChart3, Tv } from 'lucide-react';
import { cn, LEAGUE_CONFIG } from '@/lib/utils';

export function RightPanelContent() {
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
              <div className="text-sm font-bold">{user.leaguePoints > 0 ? Math.floor(user.leaguePoints * 0.3) : 0}</div>
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
