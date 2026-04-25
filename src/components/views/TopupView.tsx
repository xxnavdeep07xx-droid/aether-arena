'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, ExternalLink, ChevronRight, Tag, TrendingUp, Sparkles } from 'lucide-react';
import { cn, paiseToRupee } from '@/lib/utils';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function TopupFullView() {
  const [filterGame, setFilterGame] = useState('all');

  const { data: packsData, isLoading } = useQuery({
    queryKey: ['topup-packs-all', filterGame],
    queryFn: () => fetch(`/api/topup-packs${filterGame !== 'all' ? `?game=${filterGame}` : ''}`).then(r => r.json()).then(d => d.packs || []),
  });

  const packs = (packsData || []) as any[];
  const gameSlugs = [...new Map(packs.map((p: any) => [p.gameSlug, p.gameName as string])).entries()];
  const gameNames = gameSlugs.map(([, name]) => name) as string[];
  const slugToName = new Map(gameSlugs);
  const nameToSlug = new Map(gameSlugs.map(([slug, name]) => [name, slug]));
  const popularPacks = packs.filter((p: any) => p.isPopular);
  const activeCount = filterGame === 'all' ? packs.length : packs.filter((p: any) => p.gameSlug === filterGame).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arena-accent/20 to-arena-purple/15 flex items-center justify-center">
            <Zap className="w-6 h-6 text-arena-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Quick Top Up</h1>
            <p className="text-[11px] text-arena-text-muted">
              {activeCount > 0 ? `${activeCount} packs available` : 'Powered by Codashop'}
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-arena-accent/10 via-arena-purple/5 to-transparent border border-arena-accent/15 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-arena-accent/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-arena-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-arena-text-secondary">
            Get in-game currency at the best prices. All purchases are handled securely through Codashop.
          </p>
        </div>
      </div>

      {/* Game filter chips */}
      {gameNames.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setFilterGame('all')}
            className={cn('px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              filterGame === 'all' ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20' : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/30')}>
            All Games
          </button>
          {gameNames.map((g: string) => {
            const slug = nameToSlug.get(g) || g.toLowerCase().replace(/\s+/g, '-');
            return (
              <button key={g} onClick={() => setFilterGame(slug)}
                className={cn('px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
                  filterGame === slug ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20' : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/30')}>
                {g}
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : packs.length > 0 ? (
        <>
          {/* Popular packs highlight */}
          {popularPacks.length > 0 && filterGame === 'all' && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-arena-gold" />
                <h2 className="text-sm font-semibold text-arena-gold">Popular Picks</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularPacks.slice(0, 2).map((pack: any) => (
                  <a key={pack.id} href={pack.affiliateUrl} target="_blank" rel="noopener noreferrer"
                    className="group relative bg-gradient-to-br from-arena-accent/10 via-arena-card to-arena-purple/5 border border-arena-accent/25 rounded-2xl p-5 hover:border-arena-accent/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/10 block overflow-hidden">
                    <div className="absolute top-3 right-3 bg-arena-gold/20 text-arena-gold text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" /> BEST VALUE
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-arena-accent/15 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-arena-accent" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium text-arena-text-muted">{pack.gameName}</div>
                        <h3 className="font-bold text-sm truncate group-hover:text-arena-accent transition-colors duration-150">{pack.packName}</h3>
                      </div>
                    </div>
                    {pack.description && (
                      <p className="text-xs text-arena-text-secondary mb-3 line-clamp-2 leading-relaxed">{pack.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-arena-border/50">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-white">{paiseToRupee(pack.price)}</span>
                        {pack.originalPrice > pack.price && (
                          <span className="text-xs text-arena-text-muted line-through">{paiseToRupee(pack.originalPrice)}</span>
                        )}
                      </div>
                      <span className="text-xs font-semibold px-4 py-2 rounded-xl bg-arena-accent text-white group-hover:bg-arena-accent-light transition-all duration-200 flex items-center gap-1.5">
                        Buy Now <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* All packs grid */}
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-arena-text-muted" />
            <h2 className="text-sm font-semibold text-arena-text-secondary">
              {filterGame !== 'all' ? 'Available Packs' : 'All Packs'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packs.map((pack: any) => (
              <a key={pack.id} href={pack.affiliateUrl} target="_blank" rel="noopener noreferrer"
                className="group relative bg-arena-surface border border-arena-border rounded-2xl p-4 hover:border-arena-accent/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/5 block overflow-hidden">
                {pack.isPopular && (
                  <div className="absolute top-0 right-0 bg-arena-accent text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" /> POPULAR
                  </div>
                )}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-arena-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium text-arena-text-muted">{pack.gameName}</div>
                    <h3 className="font-semibold text-sm truncate group-hover:text-arena-accent transition-colors duration-150">{pack.packName}</h3>
                  </div>
                  <ExternalLink className="w-4 h-4 text-arena-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                </div>
                {pack.description && (
                  <p className="text-[11px] text-arena-text-muted mb-3 line-clamp-2 leading-relaxed">{pack.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-arena-border">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-white">{paiseToRupee(pack.price)}</span>
                    {pack.originalPrice > pack.price && (
                      <span className="text-[11px] text-arena-text-muted line-through">{paiseToRupee(pack.originalPrice)}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold px-4 py-2 rounded-xl bg-arena-accent text-white group-hover:bg-arena-accent-light transition-all duration-200">Buy Now</span>
                </div>
              </a>
            ))}
          </div>
        </>
      ) : (
        <EmptyTopUpState />
      )}
    </div>
  );
}

function EmptyTopUpState() {
  return (
    <div className="text-center py-16 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-arena-accent/10 to-arena-purple/10 flex items-center justify-center">
        <Zap className="w-10 h-10 text-arena-accent/40" />
      </div>
      <p className="text-base font-semibold text-arena-text-secondary mb-2">No top-up packs yet</p>
      <p className="text-xs text-arena-text-muted max-w-sm mx-auto leading-relaxed">
        We are curating the best top-up deals for your favorite games. Check back soon for exclusive offers on in-game currency!
      </p>
    </div>
  );
}
