'use client';

import { cn } from '@/lib/utils';
import { LEAGUE_CONFIG } from '@/lib/utils';
import { LeagueBadge } from '@/components/leaderboard/LeagueBadge';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Swords, Percent } from 'lucide-react';

interface ProfileCardProps {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string;
    league: string;
    leaguePoints: number;
    totalTournamentsPlayed: number;
    totalWins: number;
    totalKills: number;
    totalDeaths: number;
    isAdmin?: boolean;
  };
  className?: string;
}

export function ProfileCard({ user, className }: ProfileCardProps) {
  const kdRatio = user.totalDeaths > 0 ? (user.totalKills / user.totalDeaths).toFixed(2) : user.totalKills.toFixed(2);
  const winRate = user.totalTournamentsPlayed > 0
    ? ((user.totalWins / user.totalTournamentsPlayed) * 100).toFixed(1)
    : '0.0';

  const leagueConfig = LEAGUE_CONFIG[user.league] || LEAGUE_CONFIG.bronze;

  return (
    <div className={cn('rounded-2xl bg-arena-card border border-arena-border overflow-hidden', className)}>
      {/* Banner */}
      <div className="h-24 relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${leagueConfig.color}30, ${leagueConfig.color}10, transparent)`,
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      </div>

      {/* Avatar section */}
      <div className="px-6 -mt-10 relative">
        <div className="flex items-end gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-arena-card bg-arena-surface shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: leagueConfig.color }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div className="pb-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-arena-text-primary truncate">
                {user.displayName || user.username}
              </h2>
              {user.isAdmin && (
                <Badge className="bg-arena-purple/20 text-arena-purple text-[10px] border-0 rounded-md px-1.5">
                  ADMIN
                </Badge>
              )}
            </div>
            <p className="text-sm text-arena-text-muted mt-0.5">@{user.username}</p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-arena-text-secondary mt-3 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* League */}
        <div className="mt-4 flex items-center gap-3">
          <LeagueBadge league={user.league} size="lg" />
          <div>
            <p className="text-xs text-arena-text-muted">
              {user.leaguePoints.toLocaleString()} League Points
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <StatItem
            icon={Trophy}
            label="Tournaments"
            value={user.totalTournamentsPlayed}
            color="text-arena-accent"
          />
          <StatItem
            icon={Target}
            label="Wins"
            value={user.totalWins}
            color="text-arena-success"
          />
          <StatItem
            icon={Swords}
            label="K/D"
            value={kdRatio}
            color="text-arena-warning"
          />
          <StatItem
            icon={Percent}
            label="Win Rate"
            value={`${winRate}%`}
            color="text-arena-info"
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="text-center p-2 rounded-xl bg-arena-surface border border-arena-border/50">
      <Icon className={cn('w-4 h-4 mx-auto', color)} />
      <p className={cn('text-base font-bold mt-1', color)}>{value}</p>
      <p className="text-[10px] text-arena-text-muted mt-0.5">{label}</p>
    </div>
  );
}
