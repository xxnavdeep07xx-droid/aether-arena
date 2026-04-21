'use client';

import { useAppStore, useSearchStore } from '@/lib/store';
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, SlidersHorizontal, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TournamentCard } from './HomeView';
import { TournamentsSkeleton } from './Skeletons';

export function TournamentsView() {
  const { navigate } = useAppStore();
  const { query: searchQuery } = useSearchStore();
  const [filters, setFilters] = useState({ game: '', status: '', format: '', fee: '' });
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const { data: games } = useQuery({
    queryKey: ['games-filter'],
    queryFn: () => fetch('/api/games').then(r => r.json()).then(d => d.games || d || []),
  });

  // Close filter popup on outside click
  useEffect(() => {
    if (!showFilters) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilters]);

  const activeFilterCount = [filters.game, filters.status, filters.format, filters.fee].filter(Boolean).length;

  const clearFilters = () => setFilters({ game: '', status: '', format: '', fee: '' });

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['tournaments', filters, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.game) params.set('game', filters.game);
      if (filters.status) params.set('status', filters.status);
      if (filters.format) params.set('format', filters.format);
      if (filters.fee) params.set('fee', filters.fee);
      if (searchQuery) params.set('search', searchQuery);
      return fetch(`/api/tournaments?${params}`).then(r => r.json()).then(d => d.tournaments || d || []);
    },
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'registration_open', label: 'Registration Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];
  const formatOptions = [
    { value: '', label: 'All Formats' },
    { value: 'solo', label: 'Solo' },
    { value: 'duo', label: 'Duo' },
    { value: 'squad', label: 'Squad' },
  ];
  const feeOptions = [
    { value: '', label: 'All' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <div className="flex items-center gap-2">
          {searchQuery && (
            <span className="text-xs text-arena-text-muted hidden sm:inline">Results for &quot;<span className="text-arena-accent">{searchQuery}</span>&quot;</span>
          )}
          {/* Filter toggle button */}
          <div className="relative" ref={filterRef}>
            <button onClick={() => setShowFilters(!showFilters)}
              className={cn('flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200',
                showFilters || activeFilterCount > 0
                  ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20'
                  : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/30')}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className={cn('w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full text-[9px] font-bold',
                  showFilters ? 'bg-white/20 text-white' : 'bg-arena-accent text-white')}>
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', showFilters && 'rotate-180')} />
            </button>

            {/* Filter popup */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-arena-surface border border-arena-border rounded-2xl p-4 shadow-2xl shadow-black/40 z-50 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white">Filters</span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-[10px] text-arena-accent hover:text-arena-accent-light font-medium transition-colors">Clear all</button>
                  )}
                </div>

                {/* Game filter */}
                <div className="mb-3">
                  <label className="text-[10px] font-medium text-arena-text-muted mb-1.5 block uppercase tracking-wider">Game</label>
                  <select value={filters.game} onChange={e => setFilters(f => ({ ...f, game: e.target.value }))}
                    className="w-full bg-arena-dark border border-arena-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-arena-accent transition-colors">
                    <option value="">All Games</option>
                    {games?.map((g: any) => <option key={g.id} value={g.slug}>{g.name}</option>)}
                  </select>
                </div>

                {/* Status filter */}
                <div className="mb-3">
                  <label className="text-[10px] font-medium text-arena-text-muted mb-1.5 block uppercase tracking-wider">Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {statusOptions.map(s => (
                      <button key={s.value} onClick={() => setFilters(f => ({ ...f, status: s.value }))}
                        className={cn('px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-150',
                          filters.status === s.value ? 'bg-arena-accent text-white' : 'bg-arena-dark border border-arena-border text-arena-text-secondary hover:text-white')}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format filter */}
                <div className="mb-3">
                  <label className="text-[10px] font-medium text-arena-text-muted mb-1.5 block uppercase tracking-wider">Format</label>
                  <div className="flex flex-wrap gap-1.5">
                    {formatOptions.map(f => (
                      <button key={f.value} onClick={() => setFilters(fs => ({ ...fs, format: f.value }))}
                        className={cn('px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-150',
                          filters.format === f.value ? 'bg-arena-accent text-white' : 'bg-arena-dark border border-arena-border text-arena-text-secondary hover:text-white')}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fee filter */}
                <div>
                  <label className="text-[10px] font-medium text-arena-text-muted mb-1.5 block uppercase tracking-wider">Entry Fee</label>
                  <div className="flex flex-wrap gap-1.5">
                    {feeOptions.map(f => (
                      <button key={f.value} onClick={() => setFilters(fs => ({ ...fs, fee: f.value }))}
                        className={cn('px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-150',
                          filters.fee === f.value ? 'bg-arena-accent text-white' : 'bg-arena-dark border border-arena-border text-arena-text-secondary hover:text-white')}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tournament Grid */}
      {isLoading ? (
        <TournamentsSkeleton />
      ) : tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((t: any) => (
            <TournamentCard key={t.id} tournament={t} onClick={() => navigate('tournament-detail', { id: t.id })} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-arena-accent/40" />
          </div>
          <p className="text-base font-semibold text-arena-text-secondary mb-2">
            {searchQuery ? `No tournaments for "${searchQuery}"` : 'No tournaments match your filters'}
          </p>
          <p className="text-xs text-arena-text-muted max-w-sm mx-auto mb-4">
            {searchQuery ? 'Try different keywords or browse all tournaments' : 'Try adjusting your filters or check back later for new events'}
          </p>
          {(searchQuery || activeFilterCount > 0) && (
            <button onClick={() => { clearFilters(); }}
              className="text-xs font-medium px-4 py-2 rounded-xl bg-arena-accent text-white hover:bg-arena-accent-light transition-all duration-200">
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
