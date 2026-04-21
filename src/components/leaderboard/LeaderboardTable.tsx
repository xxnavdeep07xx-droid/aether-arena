'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LeagueBadge } from './LeagueBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { BarChart3 } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  playerId: string;
  playerName: string;
  playerDisplayName?: string;
  playerAvatarUrl?: string;
  playerLeague: string;
  totalPoints: number;
  totalWins: number;
  totalMatches: number;
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
  winRate: number;
  rank?: number;
}

const gameTabs = ['All Games', 'Free Fire', 'BGMI', 'COD', 'Minecraft', 'Pokemon Go'];
const periodTabs = ['All Time', 'Monthly', 'Weekly'];

export function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [activeGame, setActiveGame] = useState('All Games');
  const [activePeriod, setActivePeriod] = useState('All Time');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeGame !== 'All Games') params.set('game', activeGame);
        if (activePeriod !== 'All Time') params.set('period', activePeriod.toLowerCase().replace(' ', '_'));
        const res = await fetch(`/api/leaderboard?${params}`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch {
        // Fallback
      }
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, [activeGame, activePeriod]);

  

  return (
    <div className="space-y-4">
      {/* Game tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {gameTabs.map((game) => (
          <button
            key={game}
            onClick={() => setActiveGame(game)}
            className={cn(
              'shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border',
              activeGame === game
                ? 'bg-arena-accent text-white border-arena-accent shadow-md shadow-arena-accent/20'
                : 'bg-arena-card text-arena-text-secondary border-arena-border hover:border-arena-accent/30'
            )}
          >
            {game}
          </button>
        ))}
      </div>

      {/* Period tabs */}
      <div className="flex items-center gap-1.5">
        {periodTabs.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activePeriod === period
                ? 'bg-arena-accent/20 text-arena-accent'
                : 'text-arena-text-muted hover:text-arena-text-secondary'
            )}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-12">
          <LoadingSpinner label="Loading leaderboard..." />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No leaderboard data"
          description="Play tournaments to appear on the leaderboard"
        />
      ) : (
        <div className="rounded-2xl bg-arena-card border border-arena-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[50px_1fr_80px_60px_70px_50px_50px_70px] md:grid-cols-[50px_1fr_80px_60px_80px_60px_50px_70px] gap-2 px-4 py-3 bg-arena-surface border-b border-arena-border">
            <span className="text-[10px] text-arena-text-muted uppercase tracking-wide font-medium">Rank</span>
            <span className="text-[10px] text-arena-text-muted uppercase tracking-wide font-medium">Player</span>
            <span className="text-[10px] text-arena-text-muted uppercase tracking-wide font-medium text-right">Points</span>
            <span className="text-[10px] text-arena-text-muted uppercase tracking-wide font-medium text-right hidden sm:block">Wins</span>
            <span className="text-[10px] text-arena-text-muted uppercase tracking-wide font-medium text-right hidden md:block">Matches</span>
            <span className="text-[10px] text-arena-text-muted uppercase tracking-wide font-medium text-right hidden sm:block">K/D</span>
            <span className="text-[10px] text-arena-text-muted uppercase tracking-wide font-medium text-right hidden lg:block">Kills</span>
            <span className="text-[10px] text-arena-text-muted uppercase tracking-wide font-medium text-right">Win %</span>
          </div>

          {/* Table body */}
          <ScrollArea className="max-h-[500px]">
            <div className="divide-y divide-arena-border">
              {entries.map((entry, index) => {
                const rank = entry.rank || (index + 1);
                const isTop3 = rank <= 3;
                const kdDisplay = entry.kdRatio.toFixed(1);
                const winRateDisplay = entry.winRate.toFixed(0);

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'grid grid-cols-[50px_1fr_80px_60px_70px_50px_50px_70px] md:grid-cols-[50px_1fr_80px_60px_80px_60px_50px_70px] gap-2 px-4 py-3 items-center transition-colors hover:bg-arena-surface/50',
                      isTop3 && 'bg-arena-surface/30'
                    )}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      {rank === 1 ? (
                        <div className="w-7 h-7 rounded-full bg-arena-gold/20 flex items-center justify-center text-sm">
                          👑
                        </div>
                      ) : rank === 2 ? (
                        <div className="w-7 h-7 rounded-full bg-arena-silver/20 flex items-center justify-center text-sm">
                          🥈
                        </div>
                      ) : rank === 3 ? (
                        <div className="w-7 h-7 rounded-full bg-arena-bronze/20 flex items-center justify-center text-sm">
                          🥉
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-arena-text-muted">#{rank}</span>
                      )}
                    </div>

                    {/* Player */}
                    <div className="flex items-center gap-2 min-w-0">
                      {entry.playerAvatarUrl ? (
                        <img
                          src={entry.playerAvatarUrl}
                          alt={entry.playerName}
                          className="w-7 h-7 rounded-full object-cover border border-arena-border shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-arena-accent/20 flex items-center justify-center text-[10px] font-bold text-arena-accent shrink-0">
                          {entry.playerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-arena-text-primary truncate">
                          {entry.playerDisplayName || entry.playerName}
                        </p>
                        <LeagueBadge league={entry.playerLeague} size="sm" />
                      </div>
                    </div>

                    {/* Points */}
                    <p className={cn(
                      'text-sm font-bold text-right',
                      rank === 1 ? 'text-arena-gold' : rank === 2 ? 'text-arena-silver' : rank === 3 ? 'text-arena-bronze' : 'text-arena-text-primary'
                    )}>
                      {entry.totalPoints.toLocaleString()}
                    </p>

                    {/* Wins */}
                    <p className="text-sm text-arena-text-secondary text-right hidden sm:block">
                      {entry.totalWins}
                    </p>

                    {/* Matches */}
                    <p className="text-sm text-arena-text-secondary text-right hidden md:block">
                      {entry.totalMatches}
                    </p>

                    {/* K/D */}
                    <p className="text-sm text-arena-text-secondary text-right hidden sm:block">
                      {kdDisplay}
                    </p>

                    {/* Kills */}
                    <p className="text-sm text-arena-text-secondary text-right hidden lg:block">
                      {entry.totalKills}
                    </p>

                    {/* Win Rate */}
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 h-1.5 bg-arena-dark rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            entry.winRate >= 30 ? 'bg-arena-success' : entry.winRate >= 15 ? 'bg-arena-warning' : 'bg-arena-accent'
                          )}
                          style={{ width: `${Math.min(entry.winRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-arena-text-secondary">{winRateDisplay}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
