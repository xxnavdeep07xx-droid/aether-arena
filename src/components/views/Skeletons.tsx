'use client';

import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-arena-card rounded-xl', className)} />;
}

export function HomeSkeleton() {
  return (
    <div className="space-y-6 py-2">
      {/* Stream banner */}
      <Skeleton className="h-64 md:h-72 w-full rounded-2xl" />
      {/* Top players */}
      <div>
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1,2,3,4].map(i => <Skeleton key={i} className="w-44 h-20 rounded-xl flex-shrink-0" />)}
        </div>
      </div>
      {/* Affiliate */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
      {/* Tournaments */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex gap-2 mb-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-xl overflow-hidden border border-arena-border/30">
              <Skeleton className="h-28 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-1.5 w-full rounded-full mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TournamentsSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="flex flex-wrap gap-2 mb-6">
        {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-xl overflow-hidden border border-arena-border/30">
            <Skeleton className="h-28 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="flex flex-wrap gap-4 mb-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="flex items-center px-4 py-3 border-b border-arena-border/30">
            <Skeleton className="h-5 w-8 mr-4" />
            <Skeleton className="h-8 w-8 rounded-lg mr-3" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28 mb-1" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StreamsSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="py-2">
      <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden mb-6">
        <Skeleton className="h-28 w-full rounded-none" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-end gap-4 mb-4">
            <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
            <div className="flex-1 pt-10">
              <Skeleton className="h-6 w-36 mb-2" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="py-2">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-arena-dark flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="splash-bg-glow" />

      {/* Energy swirls */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full energy-swirl opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full energy-swirl energy-swirl-2 opacity-40" />

      {/* Pulse rings */}
      <div className="splash-ring" />
      <div className="splash-ring splash-ring-2" />

      {/* Floating particles */}
      <div className="energy-particle energy-particle-1" />
      <div className="energy-particle energy-particle-2" />
      <div className="energy-particle energy-particle-3" />
      <div className="energy-particle energy-particle-4" />
      <div className="energy-particle energy-particle-5" />
      <div className="energy-particle energy-particle-6" />

      {/* Energy streaks */}
      <div className="energy-streak energy-streak-1" />
      <div className="energy-streak energy-streak-2" />

      {/* Logo */}
      <div className="relative z-10">
        <div className="hero-energy-container w-36 h-36 md:w-48 md:h-48">
          <div className="energy-aura" />
          <div className="energy-ring energy-ring-1" />
          <div className="energy-ring energy-ring-2" />
          <div className="energy-ring energy-ring-3" />
          <img
            src="/logo-hero.webp"
            alt="Aether Arena"
            className="relative z-10 w-full h-full object-contain splash-logo logo-hero-energy rounded-3xl"
          />
        </div>
      </div>

      {/* Tagline */}
      <p className="splash-text mt-8 md:mt-10 text-sm md:text-base font-medium tracking-[0.2em] text-arena-text-secondary uppercase select-none">
        Compete &middot; Win &middot; Rise
      </p>

      {/* Loading dots */}
      <div className="flex items-center gap-2 mt-10">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="splash-loading-dot w-1.5 h-1.5 rounded-full bg-arena-accent"
          />
        ))}
      </div>
    </div>
  );
}
