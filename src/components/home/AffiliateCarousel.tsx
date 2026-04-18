'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { paiseToRupee } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ExternalLink, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AffiliateItem {
  id: string;
  name: string;
  platform: string;
  url: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  clicks: number;
}

export function AffiliateCarousel() {
  const [items, setItems] = useState<AffiliateItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/affiliates');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setItems(data.affiliates || []);
        }
      } catch {
        // Fallback
      }
      if (mounted) setIsLoading(false);
    };
    void load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const trackClick = async (id: string, url: string) => {
    try {
      await fetch(`/api/affiliates/click?id=${id}`, { method: 'POST' });
    } catch {
      // Silent
    }
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="w-full h-40 rounded-2xl bg-arena-card border border-arena-border animate-pulse" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full rounded-2xl bg-gradient-to-br from-arena-purple/10 via-arena-card to-arena-info/10 border border-arena-border p-6 text-center">
        <ShoppingBag className="w-8 h-8 text-arena-text-muted mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-arena-text-primary">Official Aether Arena Store</h3>
        <p className="text-xs text-arena-text-secondary mt-1">Coming Soon — Gaming gear, peripherals & more!</p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arena-accent/10 text-arena-accent text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-arena-accent animate-pulse-dot" />
          Coming Soon
        </div>
      </div>
    );
  }

  const item = items[currentIndex];
  const hasDiscount = item.originalPrice > 0 && item.price < item.originalPrice;

  return (
    <div className="space-y-3">
      {/* Carousel */}
      <div className="relative w-full h-40 rounded-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-arena-purple/20 via-arena-card to-arena-info/10" />
        <div className="relative h-full flex items-center p-5">
          {/* Image placeholder */}
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-arena-surface border border-arena-border flex items-center justify-center shrink-0 overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-10 h-10 text-arena-text-muted" />
            )}
          </div>

          {/* Product info */}
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-xs text-arena-text-muted uppercase tracking-wide">{item.platform || item.category}</p>
            <h3 className="text-base md:text-lg font-bold text-arena-text-primary truncate mt-0.5">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-arena-text-secondary mt-0.5 line-clamp-2 hidden md:block">
                {item.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                'text-lg font-bold',
                hasDiscount ? 'text-arena-success' : 'text-arena-text-primary'
              )}>
                {paiseToRupee(item.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-arena-text-muted line-through">
                  {paiseToRupee(item.originalPrice)}
                </span>
              )}
            </div>

            <Button
              onClick={() => trackClick(item.id, item.url)}
              size="sm"
              className="mt-2 bg-arena-accent hover:bg-arena-accent-light text-white rounded-lg h-8 px-4 text-xs gap-1.5"
            >
              <ExternalLink className="w-3 h-3" />
              Shop Now
            </Button>
          </div>
        </div>

        {/* Navigation */}
        {items.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-2 right-3 flex items-center gap-1">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    i === currentIndex ? 'w-4 bg-arena-accent' : 'bg-white/30'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Coming Soon banner */}
      <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-arena-surface/50 border border-arena-border/50">
        <ShoppingBag className="w-3.5 h-3.5 text-arena-text-muted" />
        <span className="text-xs text-arena-text-muted">
          Official Aether Arena Store — <span className="text-arena-accent font-medium">Coming Soon</span>
        </span>
      </div>
    </div>
  );
}
