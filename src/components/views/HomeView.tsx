'use client';

import { useAppStore, useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Crown, ChevronRight, Swords, Star, CircleDot, Clock,
  Gamepad2, Trophy, ShoppingBag, Zap,
  Play, Eye, Timer, X, Megaphone, Store
} from 'lucide-react';
import { cn, paiseToRupee, formatDate, getCountdown, LEAGUE_CONFIG, getStatusBg, getFormatLabel } from '@/lib/utils';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

export function HomeView() {
  return (
    <div className="space-y-6">
      <AnnouncementBanner />
      <StreamBannerSection />
      <HomeTournamentsSection />
      <QuickStoreSection />
      <TopPlayersSection />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Announcement Banner — dismissible gradient bar
   ────────────────────────────────────────────── */

function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-arena-accent/20 via-arena-purple/15 to-arena-accent/10 border border-arena-accent/20">
      <div className="absolute inset-0 bg-gradient-to-r from-arena-accent/5 to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-3 px-4 py-3 md:px-5 md:py-3.5">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-arena-accent/15 flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-arena-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-arena-text-primary truncate">
            Welcome to Aether Arena! 🎮 Compete in tournaments, climb the ranks, and win big.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-arena-text-muted hover:text-arena-text-primary hover:bg-arena-surface/50 transition-all duration-150"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function StreamBannerSection() {
  const { navigate } = useAppStore();
  const [current, setCurrent] = useState(0);

  const { data: streams } = useQuery({
    queryKey: ['featured-streams'],
    queryFn: () => apiFetch<any>('/api/streams').then(d => Array.isArray(d.streams) ? d.streams : Array.isArray(d) ? d : []),
    placeholderData: [],
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!streams || streams.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % streams.length), 6000);
    return () => clearInterval(timer);
  }, [streams]);

  if (!streams || streams.length === 0) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-arena-border h-56 md:h-64 bg-arena-card group">
        <Image
          src="/images/hero-banner.webp"
          alt="Aether Arena"
          fill
          className="object-cover opacity-20 group-hover:opacity-25 transition-opacity duration-500"
priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-arena-accent/10 via-arena-purple/5 to-arena-dark/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-arena-card/95 via-arena-card/70 to-arena-card/40" />
        <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-arena-accent/15 flex items-center justify-center">
              <Play className="w-5 h-5 text-arena-accent/70" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-arena-accent to-arena-purple bg-clip-text text-transparent">
                Aether Arena
              </h2>
              <p className="text-[10px] text-arena-text-muted uppercase tracking-wider font-medium">Esports Platform</p>
            </div>
          </div>
          <p className="text-sm text-arena-text-secondary max-w-md mb-4">
            No live streams right now. Tune in later for live tournament broadcasts, gameplay streams, and community events.
          </p>
          <button
            onClick={() => navigate('tournaments')}
            className="flex items-center gap-2 px-5 py-2 h-10 bg-arena-accent/80 hover:bg-arena-accent text-white font-medium rounded-xl transition-all duration-200 text-sm w-fit"
          >
            <Swords className="w-4 h-4" /> Browse Tournaments
          </button>
        </div>
      </div>
    );
  }

  const stream = streams[current];

  // Guard against undefined stream (e.g. index out of bounds or bad data)
  if (!stream) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-arena-border h-56 md:h-64 bg-arena-card group">
        <Image
          src="/images/hero-banner.webp"
          alt="Aether Arena"
          fill
          className="object-cover opacity-20 group-hover:opacity-25 transition-opacity duration-500"
priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-arena-accent/10 via-arena-purple/5 to-arena-dark/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-arena-card/95 via-arena-card/70 to-arena-card/40" />
        <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-arena-accent/15 flex items-center justify-center">
              <Play className="w-5 h-5 text-arena-accent/70" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-arena-accent to-arena-purple bg-clip-text text-transparent">
                Aether Arena
              </h2>
              <p className="text-[10px] text-arena-text-muted uppercase tracking-wider font-medium">Esports Platform</p>
            </div>
          </div>
          <p className="text-sm text-arena-text-secondary max-w-md mb-4">
            No live streams right now. Tune in later for live tournament broadcasts, gameplay streams, and community events.
          </p>
          <button
            onClick={() => navigate('tournaments')}
            className="flex items-center gap-2 px-5 py-2 h-10 bg-arena-accent/80 hover:bg-arena-accent text-white font-medium rounded-xl transition-all duration-200 text-sm w-fit"
          >
            <Swords className="w-4 h-4" /> Browse Tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-arena-border h-64 md:h-72 bg-arena-card cursor-pointer group transition-all duration-200 hover:-translate-y-0.5"
      onClick={() => stream.streamUrl && window.open(stream.streamUrl, '_blank')}>
      <div className="absolute inset-0 bg-gradient-to-br from-arena-accent/20 via-arena-purple/10 to-arena-dark" />
      <div className="absolute inset-0 bg-gradient-to-r from-arena-card/90 via-arena-card/50 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-center p-6 md:p-10">
        <div className="flex items-center gap-2 mb-3">
          {stream.status === 'live' ? (
            <span className="flex items-center gap-1.5 bg-arena-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
              <CircleDot className="w-3 h-3 animate-pulse" /> LIVE NOW
            </span>
          ) : (
            <span className="bg-arena-info/20 text-arena-info text-xs font-semibold px-3 py-1 rounded-full">
              UPCOMING
            </span>
          )}
          <span className="bg-arena-surface/80 text-arena-text-secondary text-xs px-2 py-0.5 rounded-full capitalize">
            {stream.platform}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-arena-accent transition-colors duration-150">{stream.title}</h2>
        <p className="text-arena-text-secondary text-sm mb-4 max-w-lg">{stream.description}</p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2 h-10 bg-arena-accent hover:bg-arena-accent-light text-white font-medium rounded-xl transition-all duration-200 text-sm"
            onClick={e => { e.stopPropagation(); if (stream.streamUrl) window.open(stream.streamUrl, '_blank'); }}>
            <Play className="w-4 h-4" /> Watch Now
          </button>
          {stream.tournamentId && (
            <button className="flex items-center gap-2 px-5 py-2 h-10 border border-arena-border hover:border-arena-accent/50 text-arena-text-primary font-medium rounded-xl transition-all duration-200 text-sm"
              onClick={e => { e.stopPropagation(); navigate('tournament-detail', { id: stream.tournamentId }); }}>
              <Eye className="w-4 h-4" /> View Tournament
            </button>
          )}
        </div>
      </div>
      {/* Nav dots */}
      {streams.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
          {streams.map((_: any, i: number) => (
            <button key={i} onClick={e => { e.stopPropagation(); setCurrent(i); }}
              className={cn('w-2 h-2 rounded-full transition-all', i === current ? 'w-5 bg-arena-accent' : 'bg-arena-text-muted hover:bg-white')} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Quick Store — combines topup packs + affiliates
   ────────────────────────────────────────────── */

function QuickStoreSection() {
  const { navigate } = useAppStore();

  const { data: packsData } = useQuery({
    queryKey: ['topup-packs-quick'],
    queryFn: () => apiFetch<any>('/api/topup-packs').then(d => Array.isArray(d.packs) ? d.packs : []),
    placeholderData: [],
    staleTime: 10 * 60 * 1000,
  });

  const { data: affiliates } = useQuery({
    queryKey: ['affiliates-quick'],
    queryFn: () => apiFetch<any>('/api/affiliates').then(d => Array.isArray(d.affiliates) ? d.affiliates : Array.isArray(d) ? d : []),
    placeholderData: [],
    staleTime: 10 * 60 * 1000,
  });

  const packs = (packsData || []) as any[];
  const affiliateList = (affiliates || []) as any[];
  const topPacks = packs.slice(0, 3);
  const topAffiliates = affiliateList.slice(0, 3);
  const hasStoreItems = topPacks.length > 0 || topAffiliates.length > 0;

  const handleAffiliateClick = async (affiliate: any) => {
    try { await fetch(`/api/affiliates/${affiliate.id}/click`, { method: 'POST' }); } catch {}
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Store className="w-5 h-5 text-arena-accent" /> Game Store
        </h2>
        <button onClick={() => navigate('store')} className="text-arena-accent text-xs font-medium hover:underline flex items-center gap-1 transition-colors duration-150">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {!hasStoreItems ? (
        <div className="bg-arena-card/50 border border-dashed border-arena-border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-arena-accent/10 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-arena-accent/50" />
          </div>
          <p className="text-sm font-medium text-arena-text-secondary mb-1">Store coming soon</p>
          <p className="text-xs text-arena-text-muted">Game top-ups and gear deals are on the way!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topup Packs Column */}
          {topPacks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-arena-accent" />
                <h3 className="text-sm font-semibold text-arena-text-secondary">Quick Top Up</h3>
              </div>
              <div className="space-y-2.5">
                {topPacks.map((pack: any) => (
                  <a key={pack.id} href={pack.affiliateUrl} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-arena-surface border border-arena-border rounded-xl p-3 hover:border-arena-accent/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/5">
                    <div className="w-11 h-11 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {pack.imageUrl ? (
                        <Image src={pack.imageUrl} alt={pack.packName} width={44} height={44} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Zap className="w-5 h-5 text-arena-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium text-arena-text-muted">{pack.gameName}</div>
                      <h4 className="font-semibold text-sm truncate group-hover:text-arena-accent transition-colors duration-150">{pack.packName}</h4>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-bold text-arena-text-primary">{paiseToRupee(pack.price)}</div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-arena-accent text-white group-hover:bg-arena-accent-light transition-all duration-200">Buy</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Affiliate Products Column */}
          {topAffiliates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-4 h-4 text-arena-accent" />
                <h3 className="text-sm font-semibold text-arena-text-secondary">Recommended Gear</h3>
              </div>
              <div className="space-y-2.5">
                {topAffiliates.map((a: any) => (
                  <a key={a.id} href={a.url || '#'} target="_blank" rel="noopener noreferrer" onClick={() => handleAffiliateClick(a)}
                    className="group flex items-center gap-3 bg-arena-surface border border-arena-border rounded-xl p-3 hover:border-arena-accent/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/5">
                    <div className="w-11 h-11 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {a.imageUrl ? (
                        <Image src={a.imageUrl} alt={a.name} width={44} height={44} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Gamepad2 className="w-5 h-5 text-arena-accent/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate group-hover:text-arena-accent transition-colors duration-150">{a.name}</h4>
                      <p className="text-[11px] text-arena-text-muted line-clamp-1">{a.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-bold text-arena-success">{a.priceDisplay || 'Free'}</div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-arena-accent/10 text-arena-accent group-hover:bg-arena-accent group-hover:text-white transition-all duration-200">Shop</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TopPlayersSection() {
  const { navigate } = useAppStore();

  const { data: entries } = useQuery({
    queryKey: ['top-players'],
    queryFn: () => apiFetch<any>('/api/leaderboard?period=all_time&limit=50').then(d => {
      const raw = d.leaderboard || d;
      const all = Array.isArray(raw) ? raw : [];
      const best = new Map<string, any>();
      for (const e of all) {
        const pid = e.playerId || e.player?.id;
        if (!pid) continue;
        const existing = best.get(pid);
        if (!existing || (e.points || 0) > (existing.points || 0)) best.set(pid, e);
      }
      return Array.from(best.values()).sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10);
    }),
    placeholderData: [],
    staleTime: 5 * 60 * 1000,
  });

  if (!entries || entries.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-arena-gold" /> Top Players
          </h2>
          <button onClick={() => navigate('leaderboard')} className="text-arena-accent text-xs font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-arena-card/50 border border-dashed border-arena-border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-arena-gold/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-arena-gold/50" />
          </div>
          <p className="text-sm font-medium text-arena-text-secondary mb-1">No ranked players yet</p>
          <p className="text-xs text-arena-text-muted">Be the first to compete and claim the top spot!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Crown className="w-5 h-5 text-arena-gold" /> Top Players
        </h2>
        <button onClick={() => navigate('leaderboard')} className="text-arena-accent text-xs font-medium hover:underline flex items-center gap-1">
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {entries.map((entry: any, idx: number) => {
          const league = LEAGUE_CONFIG[entry.player?.league] || LEAGUE_CONFIG.bronze;
          return (
            <div key={entry.id || idx} onClick={() => navigate('profile', { username: entry.player?.username })}
              className="flex-shrink-0 w-44 bg-arena-card border border-arena-border rounded-xl p-3 flex items-center gap-3 hover:border-arena-accent/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arena-accent/30 to-arena-purple/30 flex items-center justify-center text-sm font-bold overflow-hidden">
                  {entry.player?.avatarUrl ? (
                    <Image src={entry.player.avatarUrl} alt={`${entry.player.username}'s avatar`} width={40} height={40} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    (entry.player?.username || '?')[0].toUpperCase()
                  )}
                </div>
                {idx < 3 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{ backgroundColor: ['#FFD700', '#C0C0C0', '#CD7F32'][idx], color: idx === 0 ? '#000' : '#fff' }}>
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{entry.player?.username || 'Unknown'}</div>
                <div className="text-xs font-medium" style={{ color: league.color }}>
                  {league.icon} {league.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomeTournamentsSection() {
  const { navigate } = useAppStore();
  const [filter, setFilter] = useState('all');

  const { data: tournaments } = useQuery({
    queryKey: ['home-tournaments', filter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filter === 'featured') { params.set('featured', 'true'); }
      else if (filter !== 'all') { params.set('status', filter); }
      params.set('limit', '6');
      return apiFetch<any>(`/api/tournaments?${params}`).then(d => Array.isArray(d.tournaments) ? d.tournaments : Array.isArray(d) ? d : []);
    },
    placeholderData: [],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Swords className="w-5 h-5 text-arena-accent" /> Tournaments
        </h2>
        <button onClick={() => navigate('tournaments')} className="text-arena-accent text-xs font-medium hover:underline flex items-center gap-1">
          Browse All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {[{ k: 'all', l: 'All' }, { k: 'featured', l: '🔥 Featured' }, { k: 'registration_open', l: 'Open' }, { k: 'in_progress', l: '🔴 Live' }, { k: 'upcoming', l: 'Upcoming' }].map(s => (
          <button key={s.k} onClick={() => setFilter(s.k)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0',
              filter === s.k ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-arena-text-primary hover:border-arena-accent/30')}>
            {s.l}
          </button>
        ))}
      </div>
      {tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tournaments.map((t: any) => (
            <TournamentCard key={t.id} tournament={t} onClick={() => navigate('tournament-detail', { id: t.id })} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-arena-accent/50" />
          </div>
          <p className="text-sm font-medium text-arena-text-secondary mb-1">No tournaments yet</p>
          <p className="text-xs text-arena-text-muted max-w-xs mx-auto">The arena is being prepared! Check back soon for exciting battles and epic prize pools.</p>
          <button onClick={() => navigate('tournaments')} className="mt-4 text-xs text-arena-accent hover:text-arena-accent-light font-medium hover:underline transition-colors">Browse All Tournaments</button>
        </div>
      )}
    </div>
  );
}

// ==================== COUNTDOWN HOOK ====================

function useCountdown(targetDate: string | Date | null) {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (!targetDate) return;
    const update = () => setCountdown(getCountdown(targetDate));
    update();
    const timer = setInterval(update, 60000); // update every minute
    return () => clearInterval(timer);
  }, [targetDate]);
  return countdown;
}

// ==================== COUNTDOWN TIMER ====================

function CountdownTimer({ startTime }: { startTime: string | Date }) {
  const countdown = useCountdown(startTime);
  if (!countdown || countdown === 'Started!') return null;
  return (
    <div className="flex items-center gap-1 text-[10px] text-arena-accent font-medium mb-2">
      <Timer className="w-3 h-3" />
      <span>Starts in {countdown}</span>
    </div>
  );
}

// ==================== TOURNAMENT CARD ====================

export function TournamentCard({ tournament: t, onClick }: { tournament: any; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-arena-card border border-arena-border rounded-xl overflow-hidden hover:border-arena-accent/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="h-28 bg-gradient-to-br from-arena-accent/15 via-arena-purple/10 to-arena-surface flex items-center justify-center relative overflow-hidden">
        {t.game?.slug ? (
          <Image src={`/images/games/${t.game.slug}.webp`} alt={t.game?.name || 'Game'} fill className="object-cover opacity-60" loading="lazy" />
        ) : (
          <Gamepad2 className="w-10 h-10 text-arena-text-muted/50" />
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {t.isFeatured && <span className="bg-arena-gold/20 text-arena-gold text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
          {t?.status === 'in_progress' && <span className="bg-arena-accent text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><CircleDot className="w-3 h-3 animate-pulse" /> LIVE</span>}
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getStatusBg(t?.status))}>
            {t?.status ? t.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : ''}
          </span>
          <span className="text-[10px] text-arena-text-muted">{getFormatLabel(t.format)}</span>
          <span className="text-[10px] text-arena-text-muted">{t.game?.name}</span>
        </div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-1">{t.title}</h3>
        <div className="flex items-center justify-between mb-3">
          <span className={cn('font-bold text-sm', t.entryFee === 0 ? 'text-arena-success' : 'text-arena-accent')}>{paiseToRupee(t.entryFee)}</span>
          <span className="text-xs text-arena-text-secondary">Prize: {paiseToRupee(t.prizePool)}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-arena-text-muted mb-2">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.startTime ? formatDate(t.startTime) : 'TBD'}</span>
          <span>{t.registeredPlayers || 0}/{t.maxPlayers} Players</span>
        </div>
        {(t?.status === 'upcoming' || t?.status === 'registration_open') && t.startTime && <CountdownTimer startTime={t.startTime} />}
        <div className="w-full bg-arena-dark rounded-full h-1.5">
          <div className="bg-arena-accent rounded-full h-1.5 transition-all duration-300" style={{ width: `${Math.min(100, ((t.registeredPlayers || 0) / t.maxPlayers) * 100)}%` }} />
        </div>
        {t?.status === 'registration_open' && (
          <div className="mt-3 pt-3 border-t border-arena-border">
            {t.isRegistered ? (
              <span className="block w-full text-center text-xs font-medium text-arena-success bg-arena-success/10 py-2 rounded-lg">Registered</span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!useAuthStore.getState().isAuthenticated) {
                    toast.error('Please log in to register');
                    useAppStore.getState().navigate('landing');
                    return;
                  }
                  useAppStore.getState().navigate('tournament-detail', { id: t.id });
                }}
                className="w-full py-2 bg-arena-accent hover:bg-arena-accent-light text-white text-xs font-semibold rounded-lg transition-all duration-200"
              >
                Register Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
