'use client';

import { cn } from '@/lib/utils';
import { paiseToRupee, getStatusBg, getFormatLabel, formatDateTime } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Star, Gamepad2 } from 'lucide-react';

interface TournamentCardProps {
  tournament: {
    id: string;
    title: string;
    description?: string;
    gameName?: string;
    gameSlug?: string;
    coverImageUrl?: string;
    format: string;
    entryFee: number;
    prizePool: number;
    maxPlayers: number;
    registeredPlayers: number;
    status: string;
    startTime?: string;
    isFeatured: boolean;
    matchMode?: string;
  };
}

const gameGradients: Record<string, string> = {
  'free-fire': 'from-orange-600/40 to-red-900/40',
  'bgmi': 'from-blue-600/40 to-indigo-900/40',
  'cod': 'from-green-600/40 to-emerald-900/40',
  'minecraft': 'from-green-500/40 to-lime-900/40',
  'pokemon-go': 'from-yellow-500/40 to-red-800/40',
};

const gameIcons: Record<string, string> = {
  'free-fire': '🔥',
  'bgmi': '🔫',
  'cod': '🎯',
  'minecraft': '⛏️',
  'pokemon-go': '🥚',
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const { navigate } = useAppStore();
  const {
    id,
    title,
    gameName,
    gameSlug,
    format,
    entryFee,
    prizePool,
    maxPlayers,
    registeredPlayers,
    status,
    startTime,
    isFeatured,
  } = tournament;

  const isLive = status === 'live' || status === 'in_progress';
  const fillPercent = maxPlayers > 0 ? Math.min((registeredPlayers / maxPlayers) * 100, 100) : 0;
  const spotsLeft = maxPlayers - registeredPlayers;
  const gradient = gameGradients[gameSlug || ''] || 'from-arena-accent/30 to-arena-purple/30';
  const gameIcon = gameIcons[gameSlug || ''] || '🎮';

  return (
    <button
      onClick={() => navigate('tournament-detail', { id })}
      className="w-full text-left rounded-2xl bg-arena-card border border-arena-border overflow-hidden hover:border-arena-accent/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/5 transition-all duration-300 group"
    >
      {/* Cover */}
      <div className={cn('relative h-32 bg-gradient-to-br overflow-hidden', gradient)}>
        {tournament.coverImageUrl ? (
          <img
            src={tournament.coverImageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-40">{gameIcon}</span>
          </div>
        )}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-arena-warning/20 text-arena-warning text-[10px] font-semibold border border-arena-warning/30">
              <Star className="w-3 h-3" />
              FEATURED
            </span>
          )}
          <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold', getStatusBg(status))}>
            {isLive ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-arena-accent animate-pulse-dot" />
                LIVE
              </span>
            ) : status === 'registration_open' ? 'OPEN' : status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>

        {/* Game badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium border border-white/10">
            {gameName || 'Game'}
          </span>
        </div>

        {/* Format badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium border border-white/10">
            <Gamepad2 className="w-3 h-3 inline mr-1" />
            {getFormatLabel(format)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-arena-text-primary leading-tight line-clamp-2 group-hover:text-arena-accent transition-colors">
          {title}
        </h3>

        {/* Info row */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-arena-success" />
            <span className="font-semibold text-arena-success">
              {paiseToRupee(prizePool)}
            </span>
          </div>
          <span className="text-arena-text-muted">|</span>
          <div className="flex items-center gap-1.5">
            {entryFee > 0 ? (
              <span className="font-semibold text-arena-accent">{paiseToRupee(entryFee)}</span>
            ) : (
              <span className="font-semibold text-arena-success">FREE</span>
            )}
          </div>
        </div>

        {/* Time */}
        {startTime && (
          <p className="text-[11px] text-arena-text-muted">
            📅 {formatDateTime(startTime)}
          </p>
        )}

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-arena-text-secondary">
              <Users className="w-3.5 h-3.5" />
              <span>{registeredPlayers}/{maxPlayers} registered</span>
            </div>
            {spotsLeft > 0 && spotsLeft <= 10 && (
              <span className="text-[10px] font-medium text-arena-warning">
                {spotsLeft} spots left
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-arena-dark rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                fillPercent >= 90
                  ? 'bg-arena-accent'
                  : fillPercent >= 60
                    ? 'bg-arena-warning'
                    : 'bg-arena-info'
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
