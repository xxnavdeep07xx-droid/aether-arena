'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { LEAGUE_CONFIG } from '@/lib/utils';
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Trophy,
  Calendar,
  Crown,
  Gamepad2,
  Zap,
  Edit,
  Shield,
  Store,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

export function RightPanel() {
  const { currentView, rightPanelCollapsed, setRightPanelCollapsed } = useAppStore();
  const toggleCollapse = () => setRightPanelCollapsed(!rightPanelCollapsed);

  if (currentView === 'landing') return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleCollapse}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-arena-card border border-arena-border border-r-0 rounded-l-lg flex items-center justify-center text-arena-text-muted hover:text-arena-text-primary hover:bg-arena-surface transition-colors hidden md:flex"
      >
        {rightPanelCollapsed ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Panel */}
      <aside
        className={cn(
          'fixed right-0 top-16 bottom-0 bg-arena-surface border-l border-arena-border z-30 transition-all duration-300 hidden md:block overflow-hidden',
          rightPanelCollapsed ? 'w-0 border-l-0' : 'w-[280px]'
        )}
      >
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {currentView === 'home' && <HomePanel />}
            {currentView === 'tournaments' && <TournamentsPanel />}
            {currentView === 'tournament-detail' && <TournamentDetailPanel />}
            {currentView === 'leaderboard' && <LeaderboardPanel />}
            {currentView === 'profile' && <ProfilePanel />}
            {currentView === 'streams' && <StreamsPanel />}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-arena-card border border-arena-border">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color || 'bg-arena-accent/20')}>
        <Icon className="w-4 h-4 text-arena-accent" />
      </div>
      <div>
        <p className="text-xs text-arena-text-muted">{label}</p>
        <p className="text-sm font-semibold text-arena-text-primary">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-arena-text-muted mb-2">
      {children}
    </h3>
  );
}

function HomePanel() {
  const { navigate } = useAppStore();

  const { data: stats } = useQuery({
    queryKey: ['home-panel-stats'],
    queryFn: () => fetch('/api/stats').then(r => r.json()),
    refetchInterval: 60000,
  });

  return (
    <>
      <div className="space-y-3">
        <SectionTitle>Platform Stats</SectionTitle>
        <StatCard icon={Users} label="Total Players" value={stats?.players?.toLocaleString() || '...'} />
        <StatCard icon={Trophy} label="Active Tournaments" value={String(stats?.activeTournaments ?? '...')} />
        <StatCard icon={Calendar} label="Games" value={String(stats?.games ?? '...')} />
        <StatCard icon={Zap} label="Live Now" value={String(stats?.liveStreams ?? '...')} />
      </div>

      <div className="border-t border-arena-border pt-4">
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card rounded-xl"
          >
            <Store className="w-4 h-4 text-arena-warning" />
            <span className="text-sm">⚡ Quick Top Up</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('tournaments')}
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card rounded-xl"
          >
            <Trophy className="w-4 h-4 text-arena-accent" />
            <span className="text-sm">Browse Tournaments</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('leaderboard')}
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card rounded-xl"
          >
            <Crown className="w-4 h-4 text-arena-warning" />
            <span className="text-sm">Leaderboard</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('streams')}
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card rounded-xl"
          >
            <Gamepad2 className="w-4 h-4 text-arena-info" />
            <span className="text-sm">Watch Streams</span>
          </Button>
        </div>
      </div>

      <div className="border-t border-arena-border pt-4">
        <SectionTitle>Announcements</SectionTitle>
        <div className="space-y-2">
          {[
            { title: 'New BGMI Tournament', desc: 'Squad format, ₹500 prize pool', time: '2h ago' },
            { title: 'Maintenance Notice', desc: 'Scheduled downtime tonight', time: '5h ago' },
            { title: 'Season 2 Rankings', desc: 'Leaderboard reset incoming', time: '1d ago' },
          ].map((a, i) => (
            <button key={i} className="w-full text-left p-3 rounded-xl bg-arena-card border border-arena-border hover:border-arena-accent/30 transition-colors">
              <p className="text-sm font-medium text-arena-text-primary">{a.title}</p>
              <p className="text-xs text-arena-text-secondary mt-0.5">{a.desc}</p>
              <p className="text-[10px] text-arena-text-muted mt-1">{a.time}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function TournamentsPanel() {
  return (
    <>
      <div className="space-y-3">
        <SectionTitle>Games</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {['All', 'FF', 'BGMI', 'COD', 'MC', 'Pokemon Go'].map((game) => (
            <Badge
              key={game}
              variant="outline"
              className="cursor-pointer border-arena-border text-arena-text-secondary hover:border-arena-accent hover:text-arena-accent transition-colors rounded-lg px-3 py-1"
            >
              {game}
            </Badge>
          ))}
        </div>
      </div>

      <div className="border-t border-arena-border pt-4 space-y-3">
        <SectionTitle>Status Overview</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-arena-card border border-arena-border text-center">
            <p className="text-lg font-bold text-arena-success">8</p>
            <p className="text-[10px] text-arena-text-muted mt-0.5">Registration Open</p>
          </div>
          <div className="p-3 rounded-xl bg-arena-card border border-arena-border text-center">
            <p className="text-lg font-bold text-arena-accent">3</p>
            <p className="text-[10px] text-arena-text-muted mt-0.5">Live Now</p>
          </div>
          <div className="p-3 rounded-xl bg-arena-card border border-arena-border text-center">
            <p className="text-lg font-bold text-arena-info">5</p>
            <p className="text-[10px] text-arena-text-muted mt-0.5">Upcoming</p>
          </div>
          <div className="p-3 rounded-xl bg-arena-card border border-arena-border text-center">
            <p className="text-lg font-bold text-arena-text-muted">24</p>
            <p className="text-[10px] text-arena-text-muted mt-0.5">Completed</p>
          </div>
        </div>
      </div>
    </>
  );
}

function TournamentDetailPanel() {
  return (
    <>
      <div className="space-y-3">
        <SectionTitle>Registration</SectionTitle>
        <div className="p-3 rounded-xl bg-arena-card border border-arena-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-arena-text-muted">Registered</span>
            <span className="text-sm font-semibold text-arena-text-primary">45 / 100</span>
          </div>
          <div className="w-full h-2 bg-arena-dark rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-arena-accent to-arena-warning rounded-full" style={{ width: '45%' }} />
          </div>
          <p className="text-xs text-arena-text-muted mt-1.5">55 spots remaining</p>
        </div>
      </div>

      <div className="border-t border-arena-border pt-4 space-y-3">
        <SectionTitle>Prize Breakdown</SectionTitle>
        <div className="space-y-2">
          {[
            { place: '🥇 1st Place', prize: '₹1,000' },
            { place: '🥈 2nd Place', prize: '₹500' },
            { place: '🥉 3rd Place', prize: '₹250' },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-arena-card border border-arena-border">
              <span className="text-sm text-arena-text-secondary">{p.place}</span>
              <span className="text-sm font-semibold text-arena-success">{p.prize}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-arena-border pt-4 space-y-2">
        <SectionTitle>Details</SectionTitle>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-arena-text-muted">Format</span>
            <span className="text-arena-text-primary font-medium">Squad</span>
          </div>
          <div className="flex justify-between">
            <span className="text-arena-text-muted">Entry Fee</span>
            <span className="text-arena-accent font-medium">₹50</span>
          </div>
          <div className="flex justify-between">
            <span className="text-arena-text-muted">Prize Pool</span>
            <span className="text-arena-success font-medium">₹2,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-arena-text-muted">Map</span>
            <span className="text-arena-text-primary font-medium">Erangel</span>
          </div>
        </div>
      </div>
    </>
  );
}

function LeaderboardPanel() {
  return (
    <>
      <div className="space-y-3">
        <SectionTitle>Top 3 Players</SectionTitle>
        <div className="space-y-2">
          {[
            { rank: 1, name: 'ShadowKing', points: 3200, league: 'legend', emoji: '👑' },
            { rank: 2, name: 'NightWolf', points: 2850, league: 'grandmaster', emoji: '⚡' },
            { rank: 3, name: 'PhoenixRise', points: 2400, league: 'master', emoji: '🔥' },
          ].map((p) => (
            <div key={p.rank} className="flex items-center gap-3 p-3 rounded-xl bg-arena-card border border-arena-border">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{
                background: p.rank === 1 ? 'rgba(255,215,0,0.15)' : p.rank === 2 ? 'rgba(192,192,192,0.15)' : 'rgba(205,127,50,0.15)'
              }}>
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-arena-text-primary truncate">{p.name}</p>
                <p className="text-[10px] text-arena-text-muted">{p.points} pts</p>
              </div>
              <span className="text-xs font-medium" style={{ color: LEAGUE_CONFIG[p.league]?.color }}>
                {LEAGUE_CONFIG[p.league]?.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-arena-border pt-4">
        <SectionTitle>Season Info</SectionTitle>
        <div className="p-3 rounded-xl bg-arena-card border border-arena-border">
          <p className="text-sm text-arena-text-primary font-medium">Season 1</p>
          <p className="text-xs text-arena-text-secondary mt-1">Started Jan 1, 2025</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-arena-dark rounded-full overflow-hidden">
              <div className="h-full bg-arena-accent rounded-full" style={{ width: '65%' }} />
            </div>
            <span className="text-[10px] text-arena-text-muted">65%</span>
          </div>
        </div>
      </div>
    </>
  );
}

function ProfilePanel() {
  const { user } = useAuthStore();
  const { navigate } = useAppStore();

  return (
    <>
      <div className="space-y-3">
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card rounded-xl"
          >
            <Edit className="w-4 h-4 text-arena-info" />
            <span className="text-sm">Edit Profile</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card rounded-xl"
          >
            <Shield className="w-4 h-4 text-arena-success" />
            <span className="text-sm">My Tournaments</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card rounded-xl"
          >
            <Trophy className="w-4 h-4 text-arena-warning" />
            <span className="text-sm">Match History</span>
          </Button>
        </div>
      </div>

      {user?.isAdmin && (
        <div className="border-t border-arena-border pt-4">
          <SectionTitle>Admin</SectionTitle>
          <Button
            variant="ghost"
            onClick={() => navigate('admin-dashboard')}
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-arena-text-secondary hover:text-arena-text-primary hover:bg-arena-card rounded-xl"
          >
            <Shield className="w-4 h-4 text-arena-purple" />
            <span className="text-sm">Admin Dashboard</span>
          </Button>
        </div>
      )}

      <div className="border-t border-arena-border pt-4">
        <SectionTitle>League Progress</SectionTitle>
        <div className="p-3 rounded-xl bg-arena-card border border-arena-border">
          <div className="flex items-center gap-2">
            <span className="text-lg">{LEAGUE_CONFIG[user?.league || 'bronze']?.icon}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: LEAGUE_CONFIG[user?.league || 'bronze']?.color }}>
                {LEAGUE_CONFIG[user?.league || 'bronze']?.label}
              </p>
              <p className="text-[10px] text-arena-text-muted">{user?.leaguePoints || 0} LP</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-arena-dark rounded-full overflow-hidden">
              <div className="h-full bg-arena-accent rounded-full" style={{ width: '40%' }} />
            </div>
            <span className="text-[10px] text-arena-text-muted">
              {user?.leaguePoints || 0}/{(Object.values(LEAGUE_CONFIG).find((_, i, arr) => arr[i + 1]?.minPoints > (user?.leaguePoints || 0))?.minPoints || 100)} LP
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function StreamsPanel() {
  return (
    <>
      <div className="space-y-3">
        <SectionTitle>Streaming Info</SectionTitle>
        <div className="p-4 rounded-xl bg-arena-card border border-arena-border text-center">
          <div className="w-12 h-12 rounded-full bg-arena-accent/20 flex items-center justify-center mx-auto mb-2">
            <Gamepad2 className="w-6 h-6 text-arena-accent" />
          </div>
          <p className="text-sm font-medium text-arena-text-primary">Watch Live Tournaments</p>
          <p className="text-xs text-arena-text-secondary mt-1">Catch all the action live on our streams</p>
        </div>
      </div>

      <div className="border-t border-arena-border pt-4">
        <SectionTitle>Platforms</SectionTitle>
        <div className="space-y-2">
          {[
            { name: 'YouTube', color: 'text-red-500', viewers: '2.4K' },
            { name: 'Twitch', color: 'text-purple-500', viewers: '1.8K' },
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-arena-card border border-arena-border">
              <span className={`text-sm font-medium ${p.color}`}>{p.name}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-arena-accent animate-pulse-dot" />
                <span className="text-xs text-arena-text-secondary">{p.viewers} watching</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
