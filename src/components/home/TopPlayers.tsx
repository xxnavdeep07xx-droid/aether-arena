'use client';

import { useState, useEffect } from 'react';
import { LEAGUE_CONFIG } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  league: string;
  leaguePoints: number;
}

export function TopPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/leaderboard?limit=10');
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.entries || []);
        }
      } catch {
        // Fallback to demo data
        setPlayers([]);
      }
      setIsLoading(false);
    };
    fetchPlayers();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef) return;
    const amount = dir === 'left' ? -260 : 260;
    scrollRef.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-64 shrink-0 h-20 rounded-xl bg-arena-card border border-arena-border animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-muted hover:text-arena-text-primary z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable list */}
      <div
        ref={setScrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {players.map((player, index) => {
          const leagueConfig = LEAGUE_CONFIG[player.league] || LEAGUE_CONFIG.bronze;
          return (
            <div
              key={player.id}
              className="w-60 shrink-0 flex items-center gap-3 p-3 rounded-xl bg-arena-card border border-arena-border hover:border-arena-accent/30 transition-all cursor-pointer"
            >
              {/* Rank number */}
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{
                    background: index === 0 ? 'rgba(255,215,0,0.15)' : index === 1 ? 'rgba(192,192,192,0.15)' : index === 2 ? 'rgba(205,127,50,0.15)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : (
                    <span className="text-sm text-arena-text-muted">#{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-arena-text-primary truncate">
                  {player.displayName || player.username}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs">{leagueConfig.icon}</span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: leagueConfig.color }}
                  >
                    {leagueConfig.label}
                  </span>
                </div>
                <p className="text-[10px] text-arena-text-muted mt-0.5">
                  {player.leaguePoints.toLocaleString()} LP
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-arena-card border border-arena-border flex items-center justify-center text-arena-text-muted hover:text-arena-text-primary z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
