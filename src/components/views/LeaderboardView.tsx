'use client';

import { useSearchStore } from '@/lib/store';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { BarChart3 } from 'lucide-react';
import { cn, LEAGUE_CONFIG } from '@/lib/utils';
import { LeagueBadge } from '@/components/ui/league-badge';
import { LeaderboardSkeleton } from './Skeletons';
import { apiFetch } from '@/lib/api';

/* ── League filter options ── */
const LEAGUE_FILTER_OPTIONS = [
  { key: 'all', label: 'All Leagues' },
  { key: 'bronze', label: 'Bronze' },
  { key: 'silver', label: 'Silver' },
  { key: 'gold', label: 'Gold' },
  { key: 'platinum', label: 'Platinum' },
  { key: 'diamond', label: 'Diamond' },
  { key: 'master', label: 'Master' },
  { key: 'grandmaster', label: 'Grandmaster' },
  { key: 'legend', label: 'Legend' },
];

/* ── Top‑3 styled rank badge ── */
function RankBadge({ rank }: { rank: number }) {
  const configs: Record<number, { bg: string; border: string; text: string; shadow: string }> = {
    1: {
      bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      border: '#FFD700',
      text: '#7A5800',
      shadow: '0 0 12px rgba(255,215,0,0.5), 0 0 24px rgba(255,215,0,0.2)',
    },
    2: {
      bg: 'linear-gradient(135deg, #E0E0E0 0%, #A0A0A0 100%)',
      border: '#C0C0C0',
      text: '#505050',
      shadow: '0 0 10px rgba(192,192,192,0.4)',
    },
    3: {
      bg: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
      border: '#CD7F32',
      text: '#4A2800',
      shadow: '0 0 10px rgba(205,127,50,0.4)',
    },
  };

  const c = configs[rank];
  if (!c) return null;

  return (
    <div
      className="inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-sm"
      style={{
        background: c.bg,
        border: `2px solid ${c.border}`,
        color: c.text,
        boxShadow: c.shadow,
      }}
    >
      {rank}
    </div>
  );
}

/* ── Empty state SVG illustration: trophy on podium ── */
function EmptyLeaderboardIllustration() {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-4 opacity-40"
    >
      {/* Podium */}
      <rect x="10" y="65" width="30" height="30" rx="3" fill="currentColor" className="text-arena-accent" opacity="0.25" />
      <rect x="45" y="45" width="30" height="50" rx="3" fill="currentColor" className="text-arena-accent" opacity="0.4" />
      <rect x="80" y="58" width="30" height="37" rx="3" fill="currentColor" className="text-arena-accent" opacity="0.3" />
      {/* Podium numbers */}
      <text x="25" y="84" textAnchor="middle" className="fill-arena-accent" opacity="0.5" fontSize="12" fontWeight="bold">2</text>
      <text x="60" y="75" textAnchor="middle" className="fill-arena-accent" opacity="0.7" fontSize="14" fontWeight="bold">1</text>
      <text x="95" y="80" textAnchor="middle" className="fill-arena-accent" opacity="0.5" fontSize="12" fontWeight="bold">3</text>
      {/* Trophy on #1 podium */}
      <path
        d="M54 42C54 42 52 38 52 35C52 32 54 30 54 30H66C66 30 68 32 68 35C68 38 66 42 66 42"
        stroke="currentColor"
        className="text-arena-accent"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <rect x="56" y="42" width="8" height="3" rx="1" fill="currentColor" className="text-arena-accent" opacity="0.5" />
      {/* Trophy handles */}
      <path d="M52 33C49 33 47 35 47 38C47 40 49 41 52 40" stroke="currentColor" className="text-arena-accent" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M68 33C71 33 73 35 73 38C73 40 71 41 68 40" stroke="currentColor" className="text-arena-accent" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Star above trophy */}
      <path
        d="M60 22L61.5 26.5L66 27L62.8 30L63.8 34.5L60 32L56.2 34.5L57.2 30L54 27L58.5 26.5Z"
        fill="currentColor"
        className="text-arena-accent"
        opacity="0.35"
      />
    </svg>
  );
}

export function LeaderboardView() {
  const [gameFilter, setGameFilter] = useState('all');
  const [period, setPeriod] = useState('all_time');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const { query: searchQuery } = useSearchStore();

  const { data: games } = useQuery({
    queryKey: ['lb-games'],
    queryFn: () => apiFetch<any>('/api/games').then(d => Array.isArray(d.games) ? d.games : Array.isArray(d) ? d : []),
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['leaderboard', gameFilter, period, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (gameFilter !== 'all') params.set('gameId', gameFilter);
      params.set('period', period);
      if (searchQuery) params.set('search', searchQuery);
      return apiFetch<any>(`/api/leaderboard?${params}`).then(d => Array.isArray(d.leaderboard) ? d.leaderboard : Array.isArray(d) ? d : []);
    },
  });

  // Dedup: if "All Games", group by player (server handles this, but safety net)
  const dedupedEntries = gameFilter === 'all'
    ? entries?.reduce((acc: any[], e: any) => {
        if (!acc.find((a: any) => a.playerId === e.playerId)) acc.push(e);
        return acc;
      }, []) || []
    : entries || [];

  // Apply league filter client-side
  const filteredEntries = leagueFilter === 'all'
    ? dedupedEntries
    : dedupedEntries.filter((e: any) => (e.player?.league || 'bronze') === leagueFilter);

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
        {/* League filter */}
        <div className="flex gap-1 bg-arena-card rounded-xl p-1 border border-arena-border overflow-x-auto">
          {LEAGUE_FILTER_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setLeagueFilter(opt.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap',
                leagueFilter === opt.key
                  ? 'bg-arena-accent text-white'
                  : 'text-arena-text-secondary hover:text-arena-text-primary',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LeaderboardSkeleton />
      ) : filteredEntries.length > 0 ? (
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
                {filteredEntries.map((entry: any, idx: number) => {
                  const league = entry.player?.league || 'bronze';
                  const leagueConfig = LEAGUE_CONFIG[league] || LEAGUE_CONFIG.bronze;
                  return (
                    <tr key={entry.id || idx} className="border-b border-arena-border/50 hover:bg-arena-card-hover transition-colors duration-150">
                      <td className="px-4 py-3">
                        {idx < 3 ? (
                          <RankBadge rank={idx + 1} />
                        ) : (
                          <span className="text-sm font-bold text-arena-text-secondary">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arena-accent/20 to-arena-purple/20 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {entry.player?.avatarUrl ? <Image src={entry.player.avatarUrl} alt={`${entry.player.username}'s avatar`} width={32} height={32} className="w-full h-full object-cover" loading="lazy" /> : (entry.player?.username || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{entry.player?.username || 'Unknown'}</div>
                            <div className="flex items-center gap-1.5">
                              <LeagueBadge league={league} size="sm" animated={false} />
                              <span className="text-xs font-medium" style={{ color: leagueConfig.color }}>{leagueConfig.label}</span>
                            </div>
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
        <div className="text-center py-16 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
          <EmptyLeaderboardIllustration />
          <p className="text-base font-semibold text-arena-text-secondary mb-2">
            {searchQuery || leagueFilter !== 'all' ? 'No players found' : 'The leaderboard is empty'}
          </p>
          <p className="text-xs text-arena-text-muted max-w-sm mx-auto">
            {searchQuery
              ? 'Try a different name or check the spelling'
              : leagueFilter !== 'all'
                ? `No ${LEAGUE_CONFIG[leagueFilter]?.label || ''} players found. Try a different league filter.`
                : 'Be the first to compete! Join tournaments and climb the ranks to claim your spot at the top.'}
          </p>
        </div>
      )}
    </div>
  );
}
