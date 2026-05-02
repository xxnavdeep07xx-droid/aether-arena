'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import {
  ShoppingBag, Zap, ExternalLink, Gamepad2, Headphones,
  Mouse, Keyboard, Gift, Package, TrendingUp, Sparkles,
  CreditCard, ArrowRight, Flame
} from 'lucide-react';
import { cn, paiseToRupee } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { ThemedSkeleton } from './Skeletons';

// ==================== TYPES ====================

interface TopupPack {
  id: string;
  gameName: string;
  gameSlug: string;
  packName: string;
  price: number;
  originalPrice: number;
  affiliateUrl: string;
  imageUrl: string;
  description: string;
  isPopular: boolean;
  isActive: boolean;
}

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  priceDisplay: string;
  originalPriceDisplay: string | null;
  clicks: number;
  platform: string;
}

// ==================== CATEGORY / ICON MAPS ====================

type StoreTab = 'currency' | 'gear' | 'giftcards';

const STORE_TABS: { key: StoreTab; label: string; icon: React.ReactNode }[] = [
  { key: 'currency', label: 'In-Game Currency', icon: <Zap className="w-3.5 h-3.5" /> },
  { key: 'gear', label: 'Gaming Gear', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { key: 'giftcards', label: 'Gift Cards', icon: <Gift className="w-3.5 h-3.5" /> },
];

const GEAR_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  headset: <Headphones className="w-5 h-5" />,
  controller: <Gamepad2 className="w-5 h-5" />,
  mouse: <Mouse className="w-5 h-5" />,
  keyboard: <Keyboard className="w-5 h-5" />,
  default: <Package className="w-5 h-5" />,
};

function getCategoryIcon(category: string): React.ReactNode {
  const key = category.toLowerCase();
  for (const [k, icon] of Object.entries(GEAR_CATEGORY_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return GEAR_CATEGORY_ICONS.default;
}

// ==================== MAIN COMPONENT ====================

export function GameStoreView() {
  const [activeTab, setActiveTab] = useState<StoreTab>('currency');

  return (
    <div>
      {/* ====== Store Header ====== */}
      <div className="relative mb-6 -mx-4 md:-mx-6 px-4 md:px-6 pt-4 pb-6 overflow-hidden">
        {/* Gradient banner */}
        <div className="absolute inset-0 bg-gradient-to-br from-arena-accent/15 via-arena-purple/10 to-arena-dark" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-arena-dark/80" />
        {/* Decorative orbs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-arena-accent/8 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-arena-purple/8 blur-3xl" />

        <div className="relative z-10">
          {/* Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arena-accent/25 to-arena-purple/20 flex items-center justify-center shadow-lg shadow-arena-accent/10">
              <ShoppingBag className="w-6 h-6 text-arena-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Game Store</h1>
              <p className="text-[11px] text-arena-text-muted">Top up, gear up, and gift cards</p>
            </div>
          </div>

          {/* Tab pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STORE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 flex-shrink-0',
                  activeTab === tab.key
                    ? 'bg-arena-accent text-white shadow-lg shadow-arena-accent/25'
                    : 'bg-arena-surface/80 border border-arena-border text-arena-text-secondary hover:text-arena-text-primary hover:border-arena-accent/30'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ====== Tab Content ====== */}
      {activeTab === 'currency' && <CurrencyTab />}
      {activeTab === 'gear' && <GearTab />}
      {activeTab === 'giftcards' && <GiftCardsTab />}
    </div>
  );
}

// ==================== CURRENCY TAB ====================

function CurrencyTab() {
  const [filterGame, setFilterGame] = useState('all');

  const { data: packsData, isLoading } = useQuery({
    queryKey: ['topup-packs-store', filterGame],
    queryFn: () =>
      apiFetch<{ packs: TopupPack[] }>(
        `/api/topup-packs${filterGame !== 'all' ? `?game=${filterGame}` : ''}`
      ).then(d => Array.isArray(d.packs) ? d.packs : []),
    placeholderData: [],
    staleTime: 5 * 60 * 1000,
  });

  const packs = (packsData || []) as TopupPack[];

  // Derive unique games from packs
  const gameEntries = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of packs) {
      if (!map.has(p.gameSlug)) map.set(p.gameSlug, p.gameName);
    }
    return Array.from(map.entries());
  }, [packs]);

  const popularPacks = useMemo(() => packs.filter(p => p.isPopular), [packs]);
  const filteredPacks = useMemo(
    () => (filterGame === 'all' ? packs : packs.filter(p => p.gameSlug === filterGame)),
    [packs, filterGame]
  );

  return (
    <div>
      {/* Info banner */}
      <div className="mb-5 p-3 rounded-xl bg-gradient-to-r from-arena-accent/10 via-arena-purple/5 to-transparent border border-arena-accent/15 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-arena-accent/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-arena-accent" />
        </div>
        <p className="text-xs font-medium text-arena-text-secondary leading-relaxed">
          Powered by Codashop & trusted partners. Get your in-game currency at the best prices.
        </p>
      </div>

      {/* Game filter chips */}
      {gameEntries.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterGame('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              filterGame === 'all'
                ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20'
                : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-arena-text-primary hover:border-arena-accent/30'
            )}
          >
            All
          </button>
          {gameEntries.map(([slug, name]) => (
            <button
              key={slug}
              onClick={() => setFilterGame(slug)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5',
                filterGame === slug
                  ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20'
                  : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-arena-text-primary hover:border-arena-accent/30'
              )}
            >
              <Image
                src={`/images/games/${slug}.webp`}
                alt={name}
                width={18}
                height={18}
                className="w-4.5 h-4.5 rounded object-cover"
                unoptimized
                loading="lazy"
              />
              {name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <CurrencySkeleton />
      ) : filteredPacks.length > 0 ? (
        <>
          {/* Popular packs highlight */}
          {popularPacks.length > 0 && filterGame === 'all' && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-arena-gold" />
                <h2 className="text-sm font-semibold text-arena-gold">Hot Deals</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularPacks.slice(0, 2).map(pack => (
                  <a
                    key={pack.id}
                    href={pack.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-gradient-to-br from-arena-accent/10 via-arena-card to-arena-purple/5 border border-arena-accent/25 rounded-2xl p-5 hover:border-arena-accent/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/10 block overflow-hidden"
                  >
                    {/* HOT DEAL badge */}
                    <div className="absolute top-3 right-3 bg-arena-gold/20 text-arena-gold text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" /> HOT DEAL
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-arena-accent/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {pack.imageUrl ? (
                          <Image
                            src={pack.imageUrl}
                            alt={pack.packName}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                            unoptimized
                            loading="lazy"
                          />
                        ) : (
                          <Zap className="w-5 h-5 text-arena-accent" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium text-arena-text-muted">{pack.gameName}</div>
                        <h3 className="font-bold text-sm truncate group-hover:text-arena-accent transition-colors duration-150">
                          {pack.packName}
                        </h3>
                      </div>
                    </div>
                    {pack.description && (
                      <p className="text-xs text-arena-text-secondary mb-3 line-clamp-2 leading-relaxed">
                        {pack.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-arena-border/50">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-arena-text-primary">
                          {paiseToRupee(pack.price)}
                        </span>
                        {pack.originalPrice > pack.price && (
                          <span className="text-xs text-arena-text-muted line-through">
                            {paiseToRupee(pack.originalPrice)}
                          </span>
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
            {filteredPacks.map(pack => (
              <TopupPackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Zap className="w-10 h-10 text-arena-accent/40" />}
          title="No in-game currency packs yet"
          description="We are curating the best top-up deals for your favorite games. Check back soon for exclusive offers on UC, Diamonds, and CP!"
        />
      )}
    </div>
  );
}

// ==================== GEAR TAB ====================

function GearTab() {
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: affiliatesData, isLoading } = useQuery({
    queryKey: ['affiliates-store'],
    queryFn: () =>
      apiFetch<{ affiliates: AffiliateLink[] }>('/api/affiliates').then(d =>
        Array.isArray(d.affiliates) ? d.affiliates : []
      ),
    placeholderData: [],
    staleTime: 10 * 60 * 1000,
  });

  const allAffiliates = (affiliatesData || []) as AffiliateLink[];

  // Filter out gift_card category — those belong to Gift Cards tab
  const gearAffiliates = useMemo(
    () => allAffiliates.filter(a => a.category.toLowerCase() !== 'gift_card'),
    [allAffiliates]
  );

  // Derive unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const a of gearAffiliates) {
      if (a.category) cats.add(a.category);
    }
    return Array.from(cats);
  }, [gearAffiliates]);

  const filtered = useMemo(
    () =>
      filterCategory === 'all'
        ? gearAffiliates
        : gearAffiliates.filter(a => a.category.toLowerCase() === filterCategory.toLowerCase()),
    [gearAffiliates, filterCategory]
  );

  const handleAffiliateClick = async (affiliate: AffiliateLink) => {
    try {
      await fetch(`/api/affiliates/${affiliate.id}/click`, { method: 'POST' });
    } catch {
      // silently ignore click tracking errors
    }
  };

  return (
    <div>
      {/* Category filter chips */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              filterCategory === 'all'
                ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20'
                : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-arena-text-primary hover:border-arena-accent/30'
            )}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 capitalize',
                filterCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-arena-accent text-white shadow-md shadow-arena-accent/20'
                  : 'bg-arena-surface border border-arena-border text-arena-text-secondary hover:text-arena-text-primary hover:border-arena-accent/30'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <GearSkeleton />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(affiliate => (
            <GearCard
              key={affiliate.id}
              affiliate={affiliate}
              onClick={handleAffiliateClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Gamepad2 className="w-10 h-10 text-arena-success/40" />}
          title="No gaming gear yet"
          description="We are partnering with top gaming brands for the best deals on headsets, controllers, mice, and more. Stay tuned!"
        />
      )}
    </div>
  );
}

// ==================== GIFT CARDS TAB ====================

function GiftCardsTab() {
  const { data: affiliatesData, isLoading } = useQuery({
    queryKey: ['affiliates-store'],
    queryFn: () =>
      apiFetch<{ affiliates: AffiliateLink[] }>('/api/affiliates').then(d =>
        Array.isArray(d.affiliates) ? d.affiliates : []
      ),
    placeholderData: [],
    staleTime: 10 * 60 * 1000,
  });

  const allAffiliates = (affiliatesData || []) as AffiliateLink[];

  const giftCards = useMemo(
    () => allAffiliates.filter(a => a.category.toLowerCase() === 'gift_card'),
    [allAffiliates]
  );

  const handleAffiliateClick = async (affiliate: AffiliateLink) => {
    try {
      await fetch(`/api/affiliates/${affiliate.id}/click`, { method: 'POST' });
    } catch {
      // silently ignore click tracking errors
    }
  };

  return (
    <div>
      {isLoading ? (
        <GearSkeleton />
      ) : giftCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {giftCards.map(card => (
            <GiftCardItem
              key={card.id}
              affiliate={card}
              onClick={handleAffiliateClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Gift className="w-10 h-10 text-arena-purple/40" />}
          title="No gift cards available"
          description="Razer Gold, Google Play, and more gift cards are coming soon. Check back for the best digital gift card deals!"
        />
      )}
    </div>
  );
}

// ==================== CARD COMPONENTS ====================

function TopupPackCard({ pack }: { pack: TopupPack }) {
  return (
    <a
      href={pack.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative bg-arena-surface border border-arena-border rounded-2xl p-4 hover:border-arena-accent/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-accent/5 block overflow-hidden"
    >
      {/* Popular badge */}
      {pack.isPopular && (
        <div className="absolute top-0 right-0 bg-arena-accent text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1">
          <TrendingUp className="w-2.5 h-2.5" /> POPULAR
        </div>
      )}

      <div className="flex items-center gap-2.5 mb-3">
        {/* Game icon */}
        <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {pack.imageUrl ? (
            <Image
              src={pack.imageUrl}
              alt={pack.packName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
              loading="lazy"
            />
          ) : (
            <Zap className="w-5 h-5 text-arena-accent" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium text-arena-text-muted">{pack.gameName}</div>
          <h3 className="font-semibold text-sm truncate group-hover:text-arena-accent transition-colors duration-150">
            {pack.packName}
          </h3>
        </div>
        <ExternalLink className="w-4 h-4 text-arena-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
      </div>

      {pack.description && (
        <p className="text-[11px] text-arena-text-muted mb-3 line-clamp-2 leading-relaxed">
          {pack.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-arena-border">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-arena-text-primary">
            {paiseToRupee(pack.price)}
          </span>
          {pack.originalPrice > pack.price && (
            <span className="text-[11px] text-arena-text-muted line-through">
              {paiseToRupee(pack.originalPrice)}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold px-4 py-2 rounded-xl bg-arena-accent text-white group-hover:bg-arena-accent-light transition-all duration-200 flex items-center gap-1.5">
          Buy Now <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}

function GearCard({
  affiliate,
  onClick,
}: {
  affiliate: AffiliateLink;
  onClick: (a: AffiliateLink) => void;
}) {
  const categoryIcon = getCategoryIcon(affiliate.category);

  return (
    <a
      href={affiliate.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick(affiliate)}
      className="group relative bg-arena-surface border border-arena-border rounded-2xl p-4 hover:border-arena-success/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-success/5 block overflow-hidden"
    >
      {/* Image / fallback icon */}
      <div className="w-full h-32 rounded-xl bg-arena-card flex items-center justify-center mb-3 overflow-hidden relative">
        {affiliate.imageUrl ? (
          <Image
            src={affiliate.imageUrl}
            alt={affiliate.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
            loading="lazy"
          />
        ) : (
          <div className="text-arena-text-muted/40 group-hover:text-arena-success/60 transition-colors duration-200">
            {categoryIcon}
          </div>
        )}
        {/* External link indicator */}
        <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-arena-dark/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ExternalLink className="w-3 h-3 text-arena-text-secondary" />
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-sm truncate group-hover:text-arena-success transition-colors duration-150 mb-1">
        {affiliate.name}
      </h3>
      {affiliate.description && (
        <p className="text-[11px] text-arena-text-muted line-clamp-2 leading-relaxed mb-3">
          {affiliate.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-arena-border">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-arena-text-primary">
            {affiliate.priceDisplay || 'Free'}
          </span>
          {affiliate.originalPrice > 0 && affiliate.originalPriceDisplay && (
            <span className="text-[11px] text-arena-text-muted line-through">
              {affiliate.originalPriceDisplay}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold px-4 py-2 rounded-xl bg-arena-success text-white group-hover:brightness-110 transition-all duration-200 flex items-center gap-1.5">
          Shop Now <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}

function GiftCardItem({
  affiliate,
  onClick,
}: {
  affiliate: AffiliateLink;
  onClick: (a: AffiliateLink) => void;
}) {
  return (
    <a
      href={affiliate.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick(affiliate)}
      className="group relative bg-arena-surface border border-arena-border rounded-2xl p-4 hover:border-arena-purple/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-purple/5 block overflow-hidden"
    >
      {/* Card image */}
      <div className="w-full h-28 rounded-xl bg-arena-card flex items-center justify-center mb-3 overflow-hidden relative">
        {affiliate.imageUrl ? (
          <Image
            src={affiliate.imageUrl}
            alt={affiliate.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
            loading="lazy"
          />
        ) : (
          <div className="text-arena-text-muted/40 group-hover:text-arena-purple/60 transition-colors duration-200">
            <CreditCard className="w-8 h-8" />
          </div>
        )}
        {/* External link indicator */}
        <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-arena-dark/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ExternalLink className="w-3 h-3 text-arena-text-secondary" />
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-sm truncate group-hover:text-arena-purple transition-colors duration-150 mb-1">
        {affiliate.name}
      </h3>
      {affiliate.description && (
        <p className="text-[11px] text-arena-text-muted line-clamp-2 leading-relaxed mb-3">
          {affiliate.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-arena-border">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-arena-text-primary">
            {affiliate.priceDisplay || 'Free'}
          </span>
          {affiliate.originalPrice > 0 && affiliate.originalPriceDisplay && (
            <span className="text-[11px] text-arena-text-muted line-through">
              {affiliate.originalPriceDisplay}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold px-4 py-2 rounded-xl bg-arena-purple text-white group-hover:brightness-110 transition-all duration-200 flex items-center gap-1.5">
          Get Card <Gift className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}

// ==================== SKELETON COMPONENTS ====================

function CurrencySkeleton() {
  return (
    <div className="space-y-4">
      {/* Popular skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-arena-surface border border-arena-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <ThemedSkeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <ThemedSkeleton className="h-2.5 w-14" />
                <ThemedSkeleton className="h-4 w-3/4" />
              </div>
            </div>
            <ThemedSkeleton className="h-3 w-full mb-2" />
            <div className="flex items-center justify-between pt-3 border-t border-arena-border">
              <ThemedSkeleton className="h-6 w-20" />
              <ThemedSkeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-arena-surface border border-arena-border rounded-2xl p-4">
            <div className="flex items-center gap-2.5 mb-3">
              <ThemedSkeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <ThemedSkeleton className="h-2.5 w-12" />
                <ThemedSkeleton className="h-4 w-3/4" />
              </div>
            </div>
            <ThemedSkeleton className="h-3 w-full mb-2" />
            <div className="flex items-center justify-between pt-3 border-t border-arena-border">
              <ThemedSkeleton className="h-5 w-16" />
              <ThemedSkeleton className="h-7 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GearSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-arena-surface border border-arena-border rounded-2xl p-4">
          <ThemedSkeleton className="h-32 w-full rounded-xl mb-3" />
          <ThemedSkeleton className="h-4 w-3/4 mb-1.5" />
          <ThemedSkeleton className="h-3 w-full mb-1" />
          <ThemedSkeleton className="h-3 w-2/3 mb-3" />
          <div className="flex items-center justify-between pt-3 border-t border-arena-border">
            <ThemedSkeleton className="h-5 w-16" />
            <ThemedSkeleton className="h-7 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== EMPTY STATE ====================

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16 bg-arena-card/50 border border-dashed border-arena-border rounded-2xl">
      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-arena-accent/10 to-arena-purple/10 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-base font-semibold text-arena-text-secondary mb-2">{title}</p>
      <p className="text-xs text-arena-text-muted max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}
