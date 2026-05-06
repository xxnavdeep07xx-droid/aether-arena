'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useAppStore } from '@/lib/store';
import { cn, LEAGUE_CONFIG } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { ThemedSkeleton } from './Skeletons';
import { LeagueBadge } from '@/components/ui/league-badge';
import {
  Trophy, Lock, CheckCircle2, Star,
  Zap, Calendar, Users, Crown, Shield, ArrowRight,
  TrendingUp, Gift, Swords,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────

interface ProfileData {
  league: string;
  leaguePoints: number;
  username?: string;
  displayName?: string;
}

// ─── Constants ────────────────────────────────────────────────────

const LEAGUE_REWARDS: Record<string, { perk: string; bonus: string; detail: string }> = {
  bronze: { perk: 'Basic Tournament Access', bonus: '—', detail: 'Enter any open tournament and start competing' },
  silver: { perk: 'Prize Pool Bonus', bonus: '+5%', detail: 'Earn 5% extra from every prize pool win' },
  gold: { perk: 'Priority Registration', bonus: '+10%', detail: 'Register early for tournaments + 10% prize bonus' },
  platinum: { perk: 'Exclusive Tournaments', bonus: '+15%', detail: 'Access Platinum-only events + 15% prize bonus' },
  diamond: { perk: 'Custom Profile Glow', bonus: '+20%', detail: 'Glowing profile badge + 20% prize bonus' },
  master: { perk: 'Early Feature Access', bonus: '+25%', detail: 'Try new features first + 25% prize bonus' },
  grandmaster: { perk: 'Verified Player Badge', bonus: '+30%', detail: 'Verified status + 30% prize bonus' },
  legend: { perk: 'Legend-Only Tournaments', bonus: '+50%', detail: 'Exclusive events, merch + 50% prize bonus' },
};

const LP_WAYS = [
  { icon: Trophy, label: 'Tournament Win', lp: 30, color: 'text-arena-gold' },
  { icon: Crown, label: 'Tournament Top 3', lp: 15, color: 'text-arena-accent' },
  { icon: Swords, label: 'Tournament Participation', lp: 5, color: 'text-arena-info' },
  { icon: Calendar, label: 'Daily Check-in Streak (7 days)', lp: 10, color: 'text-orange-400' },
  { icon: Users, label: 'Referral (each)', lp: 5, color: 'text-arena-purple' },
];

const LEAGUE_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'legend'] as const;

// ─── Helper: compute progress to next league ─────────────────────

function getLeagueProgress(currentPoints: number, currentLeague: string) {
  const leagueKeys = LEAGUE_ORDER;
  const currentIdx = leagueKeys.indexOf(currentLeague as typeof LEAGUE_ORDER[number]);
  const isMax = currentIdx === leagueKeys.length - 1;

  if (isMax) {
    return { isMax: true, progressPercent: 100, pointsToNext: 0, nextLeague: null };
  }

  const nextLeagueKey = leagueKeys[currentIdx + 1];
  const currentMin = LEAGUE_CONFIG[currentLeague]?.minPoints ?? 0;
  const nextMin = LEAGUE_CONFIG[nextLeagueKey]?.minPoints ?? currentMin + 1;
  const range = nextMin - currentMin;
  const progressInLeague = currentPoints - currentMin;
  const progressPercent = Math.min(Math.round((progressInLeague / range) * 100), 100);
  const pointsToNext = nextMin - currentPoints;

  return {
    isMax: false,
    progressPercent,
    pointsToNext,
    nextLeague: nextLeagueKey,
    nextLeagueLabel: LEAGUE_CONFIG[nextLeagueKey]?.label ?? '',
    nextLeagueColor: LEAGUE_CONFIG[nextLeagueKey]?.color ?? '#fff',
  };
}

// ─── Sub-component: League Hero Card ─────────────────────────────

function LeagueHeroCard({ profile }: { profile: ProfileData }) {
  const league = profile.league || 'bronze';
  const config = LEAGUE_CONFIG[league] || LEAGUE_CONFIG.bronze;
  const lp = profile.leaguePoints ?? 0;
  const progress = getLeagueProgress(lp, league);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-arena-border bg-arena-card">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${config.color}40 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: config.color }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-8 blur-2xl"
        style={{ backgroundColor: config.color }}
      />

      <div className="relative p-6 md:p-8">
        {/* Badge + League name */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={cn(progress.isMax && 'animate-legend-crown-float')}>
            <LeagueBadge
              league={league}
              size="xl"
              animated
            />
          </div>
          <h2
            className="text-3xl md:text-4xl font-extrabold mt-4 tracking-tight"
            style={{ color: config.color }}
          >
            {config.label}
          </h2>
          {progress.isMax ? (
            <div className="mt-2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-arena-gold/15 border border-arena-gold/30 animate-legend-shimmer">
              <Crown className="w-4 h-4 text-arena-gold" />
              <span className="text-sm font-bold text-arena-gold">Max Rank Achieved!</span>
            </div>
          ) : (
            <p className="text-sm text-arena-text-secondary mt-1">
              {config.icon} {config.label} League
            </p>
          )}
        </div>

        {/* LP display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Star className="w-5 h-5" style={{ color: config.color }} />
          <span className="text-4xl font-black" style={{ color: config.color }}>
            {lp.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-arena-text-muted mt-2">LP</span>
        </div>

        {/* Progress bar to next league */}
        {!progress.isMax && (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-arena-text-secondary">{config.label}</span>
              <span className="font-medium" style={{ color: progress.nextLeagueColor }}>
                {progress.nextLeagueLabel}
              </span>
            </div>
            <div className="h-3 bg-arena-dark rounded-full overflow-hidden border border-arena-border/50">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out animate-progress-shine"
                style={{
                  width: `${progress.progressPercent}%`,
                  background: `linear-gradient(90deg, ${config.color}90, ${progress.nextLeagueColor ?? config.color}CC)`,
                }}
              />
            </div>
            <p className="text-xs text-arena-text-muted text-center mt-2.5">
              <span className="font-bold" style={{ color: config.color }}>
                {progress.pointsToNext}
              </span>{' '}
              more LP to reach{' '}
              <span className="font-semibold" style={{ color: progress.nextLeagueColor }}>
                {progress.nextLeagueLabel}
              </span>
            </p>
          </div>
        )}

        {/* Max league special content */}
        {progress.isMax && (
          <div className="text-center">
            <p className="text-sm text-arena-text-secondary">
              You&apos;ve reached the pinnacle! Continue dominating to maintain your rank.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes legendCrownFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-legend-crown-float {
          animation: legendCrownFloat 3s ease-in-out infinite;
        }

        @keyframes legendShimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-legend-shimmer {
          animation: legendShimmer 2s ease-in-out infinite;
        }

        @keyframes progressShine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-progress-shine {
          background-size: 200% 100%;
          animation: progressShine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ─── Sub-component: League Rewards ───────────────────────────────

function LeagueRewards({ currentLeague }: { currentLeague: string }) {
  const currentIdx = LEAGUE_ORDER.indexOf(currentLeague as typeof LEAGUE_ORDER[number]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-arena-accent" />
        League Rewards
      </h3>
      <div className="space-y-2">
        {LEAGUE_ORDER.map((key, idx) => {
          const config = LEAGUE_CONFIG[key];
          const reward = LEAGUE_REWARDS[key];
          const isCurrent = key === currentLeague;
          const isCompleted = idx < currentIdx;
          const isLocked = idx > currentIdx;

          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
                isCurrent
                  ? 'bg-arena-card border-arena-accent/30 shadow-lg'
                  : isCompleted
                    ? 'bg-arena-card/60 border-arena-border/50 opacity-70'
                    : 'bg-arena-card/30 border-arena-border/30 opacity-50',
              )}
              style={isCurrent ? { boxShadow: `0 0 16px ${config.color}20` } : undefined}
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <div className="w-8 h-8 rounded-lg bg-arena-success/15 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-arena-success" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
                    <Star className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-arena-dark/50 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-arena-text-muted" />
                  </div>
                )}
              </div>

              {/* League badge mini */}
              <LeagueBadge league={key} size="sm" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: isLocked ? undefined : config.color }}>
                    {config.label}
                  </span>
                  {isCurrent && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}
                    >
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-xs text-arena-text-muted truncate">{reward.perk}</p>
              </div>

              {/* Prize bonus */}
              <div className="text-right flex-shrink-0">
                <span
                  className={cn(
                    'text-sm font-bold',
                    reward.bonus !== '—' ? 'text-arena-success' : 'text-arena-text-muted',
                  )}
                >
                  {reward.bonus}
                </span>
                {reward.bonus !== '—' && (
                  <p className="text-[10px] text-arena-text-muted">prize bonus</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-component: League Tiers Grid ────────────────────────────

function LeagueTiersGrid({ currentLeague }: { currentLeague: string }) {
  const currentIdx = LEAGUE_ORDER.indexOf(currentLeague as typeof LEAGUE_ORDER[number]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-arena-info" />
        All League Tiers
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LEAGUE_ORDER.map((key, idx) => {
          const config = LEAGUE_CONFIG[key];
          const reward = LEAGUE_REWARDS[key];
          const isCurrent = key === currentLeague;
          const isCompleted = idx < currentIdx;
          const isLocked = idx > currentIdx;

          return (
            <div
              key={key}
              className={cn(
                'relative rounded-xl border p-4 transition-all duration-300 flex flex-col items-center text-center',
                isCurrent
                  ? 'bg-arena-card border-arena-accent/40 shadow-lg scale-[1.03]'
                  : isCompleted
                    ? 'bg-arena-card/60 border-arena-border/50 opacity-60'
                    : 'bg-arena-card/20 border-arena-border/30 opacity-40',
              )}
              style={
                isCurrent
                  ? {
                      borderColor: `${config.color}50`,
                      boxShadow: `0 0 20px ${config.color}15, inset 0 1px 0 ${config.color}10`,
                    }
                  : undefined
              }
            >
              {/* Current league glow ring */}
              {isCurrent && (
                <div
                  className="absolute -inset-[2px] rounded-xl animate-tier-glow opacity-50"
                  style={{ boxShadow: `0 0 12px ${config.color}40` }}
                />
              )}

              {/* Completed checkmark overlay */}
              {isCompleted && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-arena-success" />
                </div>
              )}

              {/* Locked overlay */}
              {isLocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-arena-text-muted" />
                </div>
              )}

              <div className="relative">
                <LeagueBadge league={key} size="md" />
              </div>
              <h4 className="text-sm font-bold mt-2" style={{ color: isLocked ? undefined : config.color }}>
                {config.label}
              </h4>
              <p className="text-[10px] text-arena-text-muted mt-0.5">
                {config.minPoints.toLocaleString()} LP
              </p>
              <p className="text-[10px] text-arena-text-secondary mt-1.5 leading-tight">
                {reward.perk}
              </p>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes tierGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-tier-glow {
          animation: tierGlow 2s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

// ─── Sub-component: How to Earn LP ───────────────────────────────

function HowToEarnLP() {
  return (
    <div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-arena-warning" />
        How to Earn LP
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LP_WAYS.map((way) => (
          <div
            key={way.label}
            className="flex items-center gap-3 p-4 bg-arena-card border border-arena-border/50 rounded-xl hover:border-arena-accent/20 transition-colors duration-200"
          >
            <div className={cn('w-10 h-10 rounded-xl bg-arena-dark/50 flex items-center justify-center flex-shrink-0', way.color)}>
              <way.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{way.label}</p>
              <p className="text-xs text-arena-text-muted">Per occurrence</p>
            </div>
            <span className="text-sm font-bold text-arena-accent whitespace-nowrap">+{way.lp} LP</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function LeagueView() {
  const { user, isAuthenticated } = useAuthStore();
  const { navigate } = useAppStore();

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: ['league-profile'],
    queryFn: () => apiFetch<ProfileData>('/api/profiles/me'),
    enabled: isAuthenticated,
  });

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-arena-accent/50" />
        </div>
        <h2 className="text-lg font-bold mb-2">League Progression</h2>
        <p className="text-sm text-arena-text-muted mb-4">Sign in to track your league progress!</p>
        <button
          onClick={() => navigate('landing')}
          className="px-6 py-2.5 bg-arena-accent text-white text-sm font-semibold rounded-xl hover:bg-arena-accent-light transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-arena-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold">League Progression</h1>
            <p className="text-xs text-arena-text-muted">Climb the ranks, earn rewards</p>
          </div>
        </div>
        {/* Hero skeleton */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-8 flex flex-col items-center">
          <ThemedSkeleton circle width={96} height={96} className="mb-4" />
          <ThemedSkeleton width={160} height={32} className="mb-2" />
          <ThemedSkeleton width={100} height={28} className="mb-6" />
          <ThemedSkeleton width="70%" height={12} className="rounded-full" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ThemedSkeleton key={i} height={120} className="rounded-xl" />
          ))}
        </div>
        {/* Earn LP skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <ThemedSkeleton key={i} height={64} className="rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-arena-accent/50" />
        </div>
        <h2 className="text-lg font-bold mb-2">Unable to Load League</h2>
        <p className="text-sm text-arena-text-muted">
          {error instanceof Error ? error.message : 'Something went wrong. Please try again.'}
        </p>
      </div>
    );
  }

  // Use profile data, with fallback to auth store
  const currentLeague = profile?.league || user?.league || 'bronze';
  const currentPoints = profile?.leaguePoints ?? user?.leaguePoints ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-arena-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold">League Progression</h1>
          <p className="text-xs text-arena-text-muted">Climb the ranks, unlock rewards</p>
        </div>
      </div>

      {/* 1. Current League Hero Card */}
      <LeagueHeroCard profile={{ league: currentLeague, leaguePoints: currentPoints }} />

      {/* 2. League Tiers Grid */}
      <LeagueTiersGrid currentLeague={currentLeague} />

      {/* 3. League Rewards */}
      <LeagueRewards currentLeague={currentLeague} />

      {/* 4. How to Earn LP */}
      <HowToEarnLP />

      {/* CTA: Browse Tournaments */}
      <div className="bg-gradient-to-r from-arena-accent/10 via-arena-purple/10 to-arena-accent/5 border border-arena-accent/20 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-arena-accent/15 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-arena-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">Ready to rank up?</h4>
          <p className="text-xs text-arena-text-muted mt-0.5">Join tournaments and earn LP to climb the league ladder</p>
        </div>
        <button
          onClick={() => navigate('tournaments')}
          className="flex items-center gap-1.5 px-4 py-2 bg-arena-accent text-white text-xs font-semibold rounded-lg hover:bg-arena-accent-light transition-colors flex-shrink-0"
        >
          Browse <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
