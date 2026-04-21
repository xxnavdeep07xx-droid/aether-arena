'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, ExternalLink, ChevronRight } from 'lucide-react';
import { cn, paiseToRupee } from '@/lib/utils';
import { Skeleton } from './Skeletons';

export function TopupFullView() {
  const [filterGame, setFilterGame] = useState('all');

  const { data: packsData, isLoading } = useQuery({
    queryKey: ['topup-packs-all', filterGame],
    queryFn: () => fetch(`/api/topup-packs${filterGame !== 'all' ? `?game=${filterGame}` : ''}`).then(r => r.json()).then(d => d.packs || []),
  });

  const packs = (packsData || []) as any[];
  const gameNames = [...new Set(packs.map((p: any) => p.gameName))] as string[];

  const activeCount = filterGame === 'all' ? packs.length : packs.filter((p: any) => p.gameSlug === filterGame).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-arena-accent/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-arena-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Quick Top Up</h1>
            <p className="text-[11px] text-arena-text-muted">{activeCount} packs available via Codashop</p>
          </div>
        </div>
      </div>

      {/* Game filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setFilterGame('all')}
          className={cn('px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
            filterGame === 'all' ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20' : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/30')}>
          All Games
        </button>
        {gameNames.map((g: string) => {
          const slug = g.toLowerCase().replace(/\s+/g, '-');
          return (
            <button key={g} onClick={() => setFilterGame(slug)}
              className={cn('px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
                filterGame === slug ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20' : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-white hover:border-arena-accent/30')}>
              {g}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : packs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {packs.map((pack: any) => (
            <a key={pack.id} href={pack.affiliateUrl} target="_blank" rel="noopener noreferrer"
              className="group relative bg-arena-surface border border-arena-border rounded-2xl p-4 hover:border-arena-accent/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/5 block overflow-hidden">
              {pack.isPopular && (
                <div className="absolute top-0 right-0 bg-arena-accent text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-lg">🔥 POPULAR</div>
              )}
              <div className="flex items-center gap-2 mb-2.5">
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
                <p className="text-[11px] text-arena-text-muted mb-3 line-clamp-2">{pack.description}</p>
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
      ) : (
        <div className="text-center py-20 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
            <Zap className="w-10 h-10 text-arena-accent/40" />
          </div>
          <p className="text-base font-semibold text-arena-text-secondary mb-2">No top-up packs available</p>
          <p className="text-xs text-arena-text-muted max-w-sm mx-auto">
            We are working on adding more top-up options. Check back later for in-game currency packs at the best prices!
          </p>
        </div>
      )}
    </div>
  );
}
