'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StreamItem {
  id: string;
  title: string;
  platform: string;
  status: string;
  viewers?: number;
  streamUrl: string;
  tournamentId?: string;
  tournamentTitle?: string;
  scheduledStart: string;
  thumbnailUrl?: string;
}

export function StreamBanner() {
  const [streams, setStreams] = useState<StreamItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/streams');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setStreams(data.streams || []);
        }
      } catch {
        // Use fallback data
      }
      if (mounted) setIsLoading(false);
    };
    void load();
    return () => { mounted = false; };
  }, []);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (streams.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % streams.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [streams.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + streams.length) % streams.length);
  }, [streams.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % streams.length);
  }, [streams.length]);

  if (isLoading) {
    return (
      <div className="relative w-full h-48 md:h-64 rounded-2xl bg-arena-card border border-arena-border animate-pulse" />
    );
  }

  if (streams.length === 0) {
    return (
      <div className="relative w-full h-48 md:h-64 rounded-2xl bg-gradient-to-br from-arena-accent/20 via-arena-card to-arena-purple/20 border border-arena-border flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🎮</div>
          <h3 className="text-lg font-semibold text-arena-text-primary">No Live Streams</h3>
          <p className="text-sm text-arena-text-secondary mt-1">Check back later for upcoming broadcasts</p>
        </div>
      </div>
    );
  }

  const stream = streams[currentIndex];
  const isLive = stream.status === 'live';

  return (
    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden group">
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-700',
          isLive
            ? 'bg-gradient-to-br from-red-900/60 via-arena-card to-orange-900/40'
            : 'bg-gradient-to-br from-arena-purple/30 via-arena-card to-arena-info/30'
        )}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-5 md:p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              {isLive ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-arena-accent/20 text-arena-accent text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-arena-accent animate-pulse-dot" />
                  LIVE NOW
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-arena-info/20 text-arena-info text-xs font-semibold">
                  UPCOMING
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-arena-surface/60 text-arena-text-secondary text-xs font-medium border border-arena-border">
                {stream.platform}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-arena-text-primary leading-tight max-w-lg">
              {stream.title}
            </h2>

            {stream.tournamentTitle && (
              <p className="text-sm text-arena-text-secondary">
                🏆 {stream.tournamentTitle}
              </p>
            )}

            {/* Viewers for live */}
            {isLive && stream.viewers && (
              <div className="flex items-center gap-1.5 text-sm text-arena-text-secondary">
                <Eye className="w-4 h-4" />
                <span>{stream.viewers.toLocaleString()} watching</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isLive && stream.streamUrl && (
            <Button
              onClick={() => window.open(stream.streamUrl, '_blank')}
              className="bg-arena-accent hover:bg-arena-accent-light text-white rounded-xl h-10 px-5 gap-2 shadow-lg shadow-arena-accent/20"
            >
              <ExternalLink className="w-4 h-4" />
              Watch Now
            </Button>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {streams.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {streams.length > 1 && (
        <div className="absolute bottom-3 right-5 flex items-center gap-1.5">
          {streams.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === currentIndex
                  ? 'w-6 bg-arena-accent'
                  : 'bg-white/30 hover:bg-white/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
