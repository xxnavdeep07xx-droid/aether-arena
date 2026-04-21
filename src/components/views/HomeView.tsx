'use client';

import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Crown, ChevronRight, Swords, Star, CircleDot, Clock,
  Gamepad2, Trophy, ShoppingBag, ExternalLink, Zap,
  ChevronLeft, Play, Eye
} from 'lucide-react';
import { cn, paiseToRupee, formatDate, LEAGUE_CONFIG, getStatusBg, getFormatLabel } from '@/lib/utils';

export function HomeView() {
  return (
    <div className="space-y-6">
      <StreamBannerSection />
      <TopPlayersSection />
      <AffiliateCarouselSection />
      <TopupCarouselSection />
      <HomeTournamentsSection />
    </div>
  );
}

function StreamBannerSection() {
  const { navigate } = useAppStore();
  const [current, setCurrent] = useState(0);

  const { data: streams } = useQuery({
    queryKey: ['featured-streams'],
    queryFn: () => fetch('/api/streams').then(r => r.json()).then(d => d.streams || d || []),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!streams || streams.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % streams.length), 6000);
    return () => clearInterval(timer);
  }, [streams]);

  if (!streams || streams.length === 0) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-dashed border-arena-border h-48 md:h-56 bg-arena-card/50">
        <div className="absolute inset-0 bg-gradient-to-br from-arena-accent/5 via-arena-purple/5 to-arena-dark" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-arena-accent/10 flex items-center justify-center mb-3">
            <Play className="w-6 h-6 text-arena-accent/50" />
          </div>
          <h2 className="text-lg font-semibold mb-1">No streams right now</h2>
          <p className="text-xs text-arena-text-muted max-w-sm">Tune in later for live tournament broadcasts, gameplay streams, and community events.</p>
        </div>
      </div>
    );
  }

  const stream = streams[current];

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
            <button className="flex items-center gap-2 px-5 py-2 h-10 border border-arena-border hover:border-arena-accent/50 text-white font-medium rounded-xl transition-all duration-200 text-sm"
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

function TopPlayersSection() {
  const { navigate } = useAppStore();

  const { data: entries } = useQuery({
    queryKey: ['top-players'],
    queryFn: () => fetch('/api/leaderboard?period=all_time&limit=50').then(r => r.json()).then(d => {
      const all = d.leaderboard || d || [];
      // Deduplicate: keep highest points per player
      const best = new Map<string, any>();
      for (const e of all) {
        const pid = e.playerId || e.player?.id;
        if (!pid) continue;
        const existing = best.get(pid);
        if (!existing || (e.points || 0) > (existing.points || 0)) {
          best.set(pid, e);
        }
      }
      return Array.from(best.values()).sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10);
    }),
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
                    <img src={entry.player.avatarUrl} alt={`${entry.player.username}'s avatar`} className="w-full h-full object-cover" />
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

function AffiliateCarouselSection() {
  const [current, setCurrent] = useState(0);

  const { data: affiliates } = useQuery({
    queryKey: ['affiliates'],
    queryFn: () => fetch('/api/affiliates').then(r => r.json()).then(d => d.affiliates || d || []),
  });

  useEffect(() => {
    if (!affiliates || affiliates.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % affiliates.length), 10000);
    return () => clearInterval(timer);
  }, [affiliates]);

  const handleClick = async (affiliate: any) => {
    try { await fetch(`/api/affiliates/${affiliate.id}/click`, { method: 'POST' }); } catch {}
  };

  if (!affiliates || affiliates.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-arena-accent" /> Recommended Gear
          </h2>
        </div>
        <div className="bg-arena-card/50 border border-dashed border-arena-border rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-arena-accent/10 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-arena-accent/50" />
          </div>
          <p className="text-sm font-medium text-arena-text-secondary mb-1">No gear recommendations yet</p>
          <p className="text-xs text-arena-text-muted">We are partnering with top gaming brands. Stay tuned for exclusive deals!</p>
        </div>
      </div>
    );
  }

  const visible = affiliates.slice(current, current + 3).concat(
    affiliates.length - current < 3 ? affiliates.slice(0, 3 - (affiliates.length - current)) : []
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-arena-accent" /> Recommended Gear
        </h2>
        <div className="flex gap-1">
          {affiliates.map((_: any, i: number) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={cn('w-2 h-2 rounded-full transition-all', i === current ? 'w-4 bg-arena-accent' : 'bg-arena-text-muted')} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((a: any) => (
          <a key={a.id} href={a.url || '#'} target="_blank" rel="noopener noreferrer" onClick={() => handleClick(a)}
            className="group bg-arena-surface border border-arena-border rounded-2xl p-4 md:p-5 flex gap-4 hover:border-arena-accent/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/5 block">
            <div className="w-16 h-16 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0">
              <Gamepad2 className="w-8 h-8 text-arena-accent/60" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate group-hover:text-arena-accent transition-colors duration-150">{a.name}</h3>
              <p className="text-xs text-arena-text-muted mt-1 line-clamp-2">{a.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-bold text-arena-success">{a.priceDisplay || 'Free'}</span>
                {a.originalPrice > 0 && <span className="text-xs text-arena-text-muted line-through">{a.originalPriceDisplay}</span>}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-arena-text-muted group-hover:text-arena-accent flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-all duration-200" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ==================== QUICK TOP UP CAROUSEL ====================

function TopupCarouselSection() {
  const [current, setCurrent] = useState(0);
  const [filterGame] = useState('all');

  const { data: packsData } = useQuery({
    queryKey: ['topup-packs', filterGame],
    queryFn: () => fetch(`/api/topup-packs${filterGame !== 'all' ? `?game=${filterGame}` : ''}`).then(r => r.json()).then(d => d.packs || []),
    refetchInterval: 60000,
  });

  const packs = (packsData || []) as any[];
  const filtered = filterGame === 'all' ? packs : packs.filter((p: any) => p.gameSlug === filterGame);
  const itemsPerPage = 3;
  const maxIndex = Math.max(0, filtered.length - itemsPerPage);

  useEffect(() => {
    if (filtered.length <= itemsPerPage) return;
    const timer = setInterval(() => setCurrent(c => {
      const idx = Math.max(0, filtered.length - itemsPerPage);
      return c >= idx ? 0 : c + 1;
    }), 4000);
    return () => clearInterval(timer);
  }, [filtered, itemsPerPage]);

  const prev = () => setCurrent(c => c <= 0 ? maxIndex : c - 1);
  const next = () => setCurrent(c => c >= maxIndex ? 0 : c + 1);

  if (packs.length === 0) return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-arena-accent" />
          <h2 className="text-lg font-bold">Quick Top Up</h2>
          <span className="text-[10px] bg-arena-accent/15 text-arena-accent font-medium px-2 py-0.5 rounded-full">Codashop</span>
        </div>
        <button onClick={() => useAppStore.getState().navigate('topup')} className="text-xs text-arena-accent hover:text-arena-accent-light font-medium flex items-center gap-1 transition-colors duration-150">
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="bg-arena-card/50 border border-dashed border-arena-border rounded-2xl p-5 text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-arena-accent/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-arena-accent/50" />
        </div>
        <p className="text-sm font-medium text-arena-text-secondary mb-1">Top-up packs coming soon</p>
        <p className="text-xs text-arena-text-muted">Get game currency at the best prices. Stay tuned!</p>
      </div>
    </div>
  );
  const visible = filtered.slice(current, current + itemsPerPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-arena-accent" />
          <h2 className="text-lg font-bold">Quick Top Up</h2>
          <span className="text-[10px] bg-arena-accent/15 text-arena-accent font-medium px-2 py-0.5 rounded-full">Codashop</span>
        </div>
        <button onClick={() => useAppStore.getState().navigate('topup')} className="text-xs text-arena-accent hover:text-arena-accent-light font-medium flex items-center gap-1 transition-colors duration-150">
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="relative">
        {filtered.length > itemsPerPage && (
          <>
            <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-8 h-8 rounded-full bg-arena-dark/90 border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-white hover:border-arena-accent/50 transition-all duration-150 shadow-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-8 h-8 rounded-full bg-arena-dark/90 border border-arena-border flex items-center justify-center text-arena-text-secondary hover:text-white hover:border-arena-accent/50 transition-all duration-150 shadow-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((pack: any) => (
            <a key={pack.id} href={pack.affiliateUrl} target="_blank" rel="noopener noreferrer"
              className="group relative bg-arena-surface border border-arena-border rounded-2xl p-4 hover:border-arena-accent/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/5 block overflow-hidden">
              {pack.isPopular && (
                <div className="absolute top-0 right-0 bg-arena-accent text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-lg">🔥 POPULAR</div>
              )}
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-arena-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-medium text-arena-text-muted">{pack.gameName}</div>
                  <h3 className="font-semibold text-sm truncate group-hover:text-arena-accent transition-colors duration-150">{pack.packName}</h3>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-arena-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 ml-auto" />
              </div>
              {pack.description && (
                <p className="text-[11px] text-arena-text-muted mb-3 line-clamp-1">{pack.description}</p>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-arena-border">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-white">{paiseToRupee(pack.price)}</span>
                  {pack.originalPrice > pack.price && (
                    <span className="text-[11px] text-arena-text-muted line-through">{paiseToRupee(pack.originalPrice)}</span>
                  )}
                </div>
                <span className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-arena-accent text-white group-hover:bg-arena-accent-light transition-all duration-200">Buy Now</span>
              </div>
            </a>
          ))}
        </div>
        {filtered.length > itemsPerPage && (
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={cn('w-1.5 h-1.5 rounded-full transition-all', i === current ? 'w-4 bg-arena-accent' : 'bg-arena-text-muted/40 hover:bg-arena-text-muted')} />
            ))}
          </div>
        )}
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
      return fetch(`/api/tournaments?${params}`).then(r => r.json()).then(d => d.tournaments || d || []);
    },
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
              filter === s.k ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20' : 'bg-arena-card border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/30')}>
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

// ==================== TOURNAMENT CARD ====================

export function TournamentCard({ tournament: t, onClick }: { tournament: any; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-arena-card border border-arena-border rounded-xl overflow-hidden hover:border-arena-accent/30 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <div className="h-28 bg-gradient-to-br from-arena-accent/15 via-arena-purple/10 to-arena-surface flex items-center justify-center relative">
        <Gamepad2 className="w-10 h-10 text-arena-text-muted/50" />
        <div className="absolute top-3 left-3 flex gap-2">
          {t.isFeatured && <span className="bg-arena-gold/20 text-arena-gold text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3" /> Featured</span>}
          {t.status === 'in_progress' && <span className="bg-arena-accent text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><CircleDot className="w-3 h-3 animate-pulse" /> LIVE</span>}
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getStatusBg(t.status))}>
            {t.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
        <div className="w-full bg-arena-dark rounded-full h-1.5">
          <div className="bg-arena-accent rounded-full h-1.5 transition-all duration-300" style={{ width: `${Math.min(100, ((t.registeredPlayers || 0) / t.maxPlayers) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
