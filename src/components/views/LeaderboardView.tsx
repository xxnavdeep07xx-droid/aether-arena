'use client';

import { useSearchStore } from '@/lib/store';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { BarChart3, Award } from 'lucide-react';
import { cn, LEAGUE_CONFIG } from '@/lib/utils';
import { LeaderboardSkeleton } from './Skeletons';

export function LeaderboardView() {
  const [gameFilter, setGameFilter] = useState('all');
  const [period, setPeriod] = useState('all_time');
  const { query: searchQuery } = useSearchStore();

  const { data: games } = useQuery({
    queryKey: ['lb-games'],
    queryFn: () => fetch('/api/games').then(r => r.json()).then(d => Array.isArray(d.games) ? d.games : Array.isArray(d) ? d : []),
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard', gameFilter, period, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (gameFilter !== 'all') params.set('gameId', gameFilter);
      params.set('period', period);
      if (searchQuery) params.set('search', searchQuery);
      return fetch(`/api/leaderboard?${params}`).then(r => r.json()).then(d => Array.isArray(d.leaderboard) ? d.leaderboard : Array.isArray(d) ? d : []);
    },
  });

  // Dedup: if "All Games", group by player (server handles this, but safety net)
  const dedupedEntries = gameFilter === 'all'
    ? entries?.reduce((acc: any[], e: any) => {
        if (!acc.find((a: any) => a.playerId === e.playerId)) acc.push(e);
        return acc;
      }, []) || []
    : entries || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-arena-accent" /> Leaderboard
      </h1>

      {/* Search hint */}
      {searchQuery && (
        <div className="mb-4 text-xs text-arena-text-muted">Showing results for &quot;<span className="text-arena-accent">{searchQuery}</span>&quot;</div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-1 bg-arena-card rounded-xl p-1 border border-arena-border overflow-x-auto">
          <button onClick={() => setGameFilter('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap', gameFilter === 'all' ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-arena-text-primary')}>All Games</button>
          {games?.map((g: any) => (
            <button key={g.id} onClick={() => setGameFilter(g.id)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap', gameFilter === g.id ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-arena-text-primary')}>{g.name}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-arena-card rounded-xl p-1 border border-arena-border">
          {['all_time', 'monthly', 'weekly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200', period === p ? 'bg-arena-accent text-white' : 'text-arena-text-secondary hover:text-arena-text-primary')}>
              {p.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LeaderboardSkeleton />
      ) : dedupedEntries.length > 0 ? (
        <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-arena-border">
                  <th className="text-left px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider">Rank</th>
                  <th className="text-left px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider">Player</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider">Points</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider hidden md:table-cell">Wins</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider hidden md:table-cell">Matches</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider hidden lg:table-cell">K/D</th>
                  <th className="text-right px-4 py-3 text-xs text-arena-text-muted font-medium uppercase tracking-wider hidden lg:table-cell">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {dedupedEntries.map((entry: any, idx: number) => {
                  const league = LEAGUE_CONFIG[entry.player?.league] || LEAGUE_CONFIG.bronze;
                  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                  return (
                    <tr key={entry.id || idx} className="border-b border-arena-border/50 hover:bg-arena-card-hover transition-colors duration-150">
                      <td className="px-4 py-3">
                        <span className={cn('font-bold', idx < 3 ? 'text-lg' : 'text-sm')} style={{ color: idx < 3 ? rankColors[idx] : undefined }}>
                          {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx + 1}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arena-accent/20 to-arena-purple/20 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {entry.player?.avatarUrl ? <Image src={entry.player.avatarUrl} alt={`${entry.player.username}'s avatar`} width={32} height={32} className="w-full h-full object-cover" unoptimized loading="lazy" /> : (entry.player?.username || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{entry.player?.username || 'Unknown'}</div>
                            <div className="text-xs font-medium" style={{ color: league.color }}>{league.icon} {league.label}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{entry.totalPoints || 0}</td>
                      <td className="px-4 py-3 text-right text-sm text-arena-text-secondary hidden md:table-cell">{entry.totalWins || 0}</td>
                      <td className="px-4 py-3 text-right text-sm text-arena-text-secondary hidden md:table-cell">{entry.totalMatches || 0}</td>
                      <td className="px-4 py-3 text-right text-sm text-arena-text-secondary hidden lg:table-cell">{(entry.kdRatio || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm hidden lg:table-cell">
                        <span className={cn((entry.winRate || 0) >= 50 ? 'text-arena-success' : 'text-arena-text-secondary')}>
                          {(entry.winRate || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
            <Award className="w-10 h-10 text-arena-accent/40" />
          </div>
          <p className="text-base font-semibold text-arena-text-secondary mb-2">
            {searchQuery ? `No players found for "${searchQuery}"` : 'The leaderboard is empty'}
          </p>
          <p className="text-xs text-arena-text-muted max-w-sm mx-auto">
            {searchQuery ? 'Try a different name or check the spelling' : 'Be the first to compete! Join tournaments and climb the ranks to claim your spot at the top.'}
          </p>
        </div>
      )}
    </div>
  );
}
