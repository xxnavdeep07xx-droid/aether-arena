'use client';

import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Flame, Gift, ExternalLink, CheckCircle2, Clock,
  Copy, Share2, ChevronRight, Loader2, AlertCircle,
  Wallet, History, Zap, Trophy, Star, Gamepad2,
  Users, ArrowRight
} from 'lucide-react';
import {
  AETHER_SYMBOL, AETHER_NAME, REDEEM_MINIMUM, CONVERSION_RATE,
  formatAether, aetherToInr, getNextStreakMilestone
} from '@/lib/aether';
import { Skeleton } from './Skeletons';

// ==================== FLOATING AETHER ANIMATION ====================

function FloatingAether({ amount, key }: { amount: number; key: number }) {
  return (
    <div
      key={key}
      className="fixed pointer-events-none z-[200] animate-float-up"
      style={{
        top: '40%',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <span className="text-2xl font-bold text-arena-accent drop-shadow-lg">
        +{amount} {AETHER_SYMBOL}
      </span>
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          50% { opacity: 0.8; transform: translateX(-50%) translateY(-60px) scale(1.1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-120px) scale(0.8); }
        }
        .animate-float-up { animation: floatUp 1.5s ease-out forwards; }
      `}</style>
    </div>
  );
}

// ==================== TAB COMPONENT ====================

function TabBar({ activeTab, setActiveTab }: { activeTab: 'tasks' | 'history'; setActiveTab: (tab: 'tasks' | 'history') => void }) {
  return (
    <div className="flex gap-1 bg-arena-dark rounded-xl p-1 mb-6">
      {[
        { key: 'tasks' as const, label: 'Tasks', icon: Zap },
        { key: 'history' as const, label: 'History', icon: History },
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
            activeTab === tab.key
              ? 'bg-arena-accent text-white shadow-lg shadow-arena-accent/25'
              : 'text-arena-text-secondary hover:text-white hover:bg-arena-card'
          )}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ==================== TASKS TAB ====================

function TasksTab({ onClaimSuccess }: { onClaimSuccess?: (amount: number) => void }) {
  const queryClient = useQueryClient();
  const [floatingKey, setFloatingKey] = useState(0);
  const [floatingAmount, setFloatingAmount] = useState(0);
  const [showFloating, setShowFloating] = useState(false);

  // Fetch streak
  const { data: streak } = useQuery({
    queryKey: ['aether-streak'],
    queryFn: () => fetch('/api/aether/streak').then(r => r.json()),
  });

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['aether-tasks'],
    queryFn: () => fetch('/api/aether/tasks').then(r => r.json()),
  });

  // Fetch referral
  const { data: referral } = useQuery({
    queryKey: ['aether-referral'],
    queryFn: () => fetch('/api/aether/referral').then(r => r.json()),
  });

  // Fetch balance for redeem section
  const { data: balance } = useQuery({
    queryKey: ['aether-balance'],
    queryFn: () => fetch('/api/aether/balance').then(r => r.json()),
  });

  // Claim task mutation
  const claimMutation = useMutation({
    mutationFn: async (taskKey: string) => {
      const res = await fetch(`/api/aether/tasks/${taskKey}/complete`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to claim task');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`You earned ${data.amount} ${AETHER_SYMBOL} ${AETHER_NAME}! 🎉`);
      queryClient.invalidateQueries({ queryKey: ['aether-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['aether-balance'] });
      // Trigger floating animation
      setFloatingAmount(data.amount);
      setFloatingKey(k => k + 1);
      setShowFloating(true);
      setTimeout(() => setShowFloating(false), 1600);
      onClaimSuccess?.(data.amount);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Redeem mutation
  const redeemMutation = useMutation({
    mutationFn: async (upiId: string) => {
      const res = await fetch('/api/aether/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Redemption failed');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Redemption for ${data.redemption.amountInr} submitted!`);
      queryClient.invalidateQueries({ queryKey: ['aether-balance'] });
      queryClient.invalidateQueries({ queryKey: ['aether-transactions'] });
      setRedeemSubmitted(true);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const [upiId, setUpiId] = useState('');
  const [redeemSubmitted, setRedeemSubmitted] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  const handleRedeem = () => {
    if (!upiId.trim()) { toast.error('Please enter a UPI ID'); return; }
    redeemMutation.mutate(upiId.trim());
  };

  const tasks = tasksData?.tasks || [];
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const nextMilestone = getNextStreakMilestone(currentStreak);

  // Group tasks by category
  const categoryConfig: Record<string, { icon: typeof Trophy; label: string; color: string; accent: string }> = {
    daily: { icon: Clock, label: '📅 Daily Tasks', color: 'text-cyan-400', accent: 'border-cyan-500/30' },
    tournament: { icon: Trophy, label: '🏆 Tournament Tasks', color: 'text-purple-400', accent: 'border-purple-500/30' },
    engagement: { icon: Star, label: '⭐ Engagement Tasks', color: 'text-yellow-400', accent: 'border-yellow-500/30' },
    affiliate: { icon: Gamepad2, label: '🎮 Affiliate Tasks', color: 'text-green-400', accent: 'border-green-500/30' },
  };

  const groupedTasks: Record<string, typeof tasks> = {};
  for (const task of tasks) {
    const cat = task.category || 'engagement';
    if (!groupedTasks[cat]) groupedTasks[cat] = [];
    groupedTasks[cat].push(task);
  }

  const categoryOrder = ['daily', 'tournament', 'engagement', 'affiliate'];

  if (tasksLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Floating animation */}
      {showFloating && <FloatingAether amount={floatingAmount} key={floatingKey} />}

      {/* Streak Banner */}
      <div className="relative bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center justify-between relative">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-medium text-orange-300 uppercase tracking-wider">Daily Streak</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold animate-streak-pulse">{currentStreak}</span>
              <span className="text-sm text-arena-text-secondary">/ {longestStreak} best</span>
            </div>
            <p className="text-xs text-arena-text-muted mt-1">
              {currentStreak > 0 ? `${currentStreak} day${currentStreak > 1 ? 's' : ''} in a row!` : 'Complete a task daily to start your streak!'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-arena-text-muted mb-2">Next bonus</div>
            <div className="text-lg font-bold text-orange-400">{nextMilestone.milestone} days</div>
            <div className="text-xs text-orange-300/80">+{nextMilestone.reward} {AETHER_SYMBOL}</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 relative">
          <div className="h-2 bg-arena-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((currentStreak / nextMilestone.milestone) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-arena-text-muted">{currentStreak}/{nextMilestone.milestone} for {nextMilestone.reward} {AETHER_SYMBOL} bonus</span>
          </div>
        </div>
        <style>{`
          @keyframes streakPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-streak-pulse { animation: streakPulse 2s ease-in-out infinite; }
        `}</style>
      </div>

      {/* Referral Card */}
      {referral && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-sm">Invite Friends — Earn 30 {AETHER_SYMBOL} each!</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-arena-text-muted">Code:</span>
              <code className="text-sm font-mono bg-arena-dark px-3 py-1 rounded-lg text-purple-300">{referral.referralCode}</code>
              <button onClick={() => handleCopy(referral.referralCode)} className="p-1.5 rounded-lg hover:bg-arena-card transition-colors">
                <Copy className="w-3.5 h-3.5 text-arena-text-muted" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-arena-text-muted">Link:</span>
              <div className="flex-1 bg-arena-dark px-3 py-1 rounded-lg text-xs text-arena-text-secondary truncate">{referral.referralUrl}</div>
              <button onClick={() => handleCopy(referral.referralUrl)} className="p-1.5 rounded-lg hover:bg-arena-card transition-colors">
                <Copy className="w-3.5 h-3.5 text-arena-text-muted" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-arena-text-muted">{referral.referralCount} friend{referral.referralCount !== 1 ? 's' : ''} referred</span>
            <button onClick={() => handleCopy(referral.referralUrl)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-lg hover:bg-purple-500/30 transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      )}

      {/* Task Groups */}
      {categoryOrder.map(category => {
        const categoryTasks = groupedTasks[category];
        if (!categoryTasks || categoryTasks.length === 0) return null;
        const config = categoryConfig[category] || categoryConfig.engagement;
        const CategoryIcon = config.icon;

        return (
          <div key={category}>
            <div className={cn('flex items-center gap-2 mb-3 pb-2 border-b', config.accent)}>
              <span className="text-sm font-semibold">{config.label}</span>
              <span className="text-[10px] text-arena-text-muted">({categoryTasks.length})</span>
            </div>
            <div className="space-y-2">
              {categoryTasks.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((task: any) => (
                <TaskCard
                  key={task.taskKey}
                  task={task}
                  isClaiming={claimMutation.isPending}
                  onClaim={() => claimMutation.mutate(task.taskKey)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {tasks.length === 0 && !tasksLoading && (
        <div className="text-center py-12 text-arena-text-muted">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Complete tasks to earn {AETHER_NAME}!</p>
        </div>
      )}

      {/* Redeem Section */}
      <div className="border-t border-arena-border pt-6 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-arena-accent" />
          <h2 className="text-lg font-bold">Redeem {AETHER_NAME}</h2>
        </div>
        <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
          {!redeemSubmitted ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-arena-accent/10 rounded-xl px-4 py-2">
                  <div className="text-xs text-arena-text-muted">Conversion Rate</div>
                  <div className="text-sm font-bold text-arena-accent">{CONVERSION_RATE} {AETHER_SYMBOL} = ₹10</div>
                </div>
                <div className="bg-arena-dark rounded-xl px-4 py-2">
                  <div className="text-xs text-arena-text-muted">Available</div>
                  <div className="text-sm font-bold">{balance?.balance || 0} {AETHER_SYMBOL}</div>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-arena-text-secondary mb-1 block">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full bg-arena-dark border border-arena-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-arena-accent focus:ring-1 focus:ring-arena-accent/20 transition-colors duration-150"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-arena-text-muted">Minimum: {REDEEM_MINIMUM} {AETHER_SYMBOL} (₹{aetherToInr(REDEEM_MINIMUM)})</span>
                <button
                  onClick={handleRedeem}
                  disabled={(balance?.balance || 0) < REDEEM_MINIMUM || redeemMutation.isPending || !upiId.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-arena-accent hover:bg-arena-accent-light text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {redeemMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Redeem <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm font-medium mb-1">Redemption Submitted!</p>
              <p className="text-xs text-arena-text-muted">We&apos;ll process it within 24 hours.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== TASK CARD ====================

function TaskCard({ task, isClaiming, onClaim }: {
  task: any;
  isClaiming: boolean;
  onClaim: () => void;
}) {
  const isCompleted = task.isCompleted;
  const isAffiliate = task.category === 'affiliate' && task.affiliateUrl;

  const handleAffiliateClick = () => {
    if (task.affiliateUrl) {
      window.open(task.affiliateUrl, '_blank', 'noopener,noreferrer');
      onClaim();
    }
  };

  return (
    <div className={cn(
      'bg-arena-card border border-arena-border rounded-xl p-4 flex items-center gap-4 transition-all duration-200',
      isCompleted && 'opacity-60'
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm">{task.title}</span>
        </div>
        <p className="text-xs text-arena-text-muted truncate">{task.description}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Status badge */}
        {isCompleted ? (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">✅ Completed</span>
        ) : task.resetType === 'daily' ? (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Daily Reset</span>
        ) : (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Available</span>
        )}
        {/* Reward */}
        <span className="text-xs font-bold text-arena-accent whitespace-nowrap">+{task.rewardAmount} {AETHER_SYMBOL}</span>
        {/* Action button */}
        {isCompleted ? (
          <div className="w-8 h-8 rounded-lg bg-arena-dark flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
        ) : isAffiliate ? (
          <button
            onClick={handleAffiliateClick}
            disabled={isClaiming}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
          >
            Visit <ExternalLink className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={onClaim}
            disabled={isClaiming}
            className="flex items-center gap-1 px-3 py-1.5 bg-arena-accent text-white text-xs font-semibold rounded-lg hover:bg-arena-accent-light transition-colors disabled:opacity-50"
          >
            {isClaiming ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== HISTORY TAB ====================

function HistoryTab() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['aether-transactions', page],
    queryFn: () => fetch(`/api/aether/transactions?page=${page}&limit=${limit}`).then(r => r.json()),
  });

  const transactions = data?.transactions || [];
  const total = data?.total || 0;
  const hasMore = transactions.length < total;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      earned: 'bg-green-500/20 text-green-400',
      redeemed: 'bg-red-500/20 text-red-400',
      bonus: 'bg-purple-500/20 text-purple-400',
      streak: 'bg-orange-500/20 text-orange-400',
      referral: 'bg-cyan-500/20 text-cyan-400',
    };
    return colors[type] || 'bg-arena-card text-arena-text-muted';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      {transactions.length === 0 ? (
        <div className="text-center py-16 text-arena-text-muted">
          <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No transactions yet. Start earning {AETHER_NAME}!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx: any) => (
            <div key={tx.id} className="bg-arena-card border border-arena-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{tx.description}</span>
                  <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', typeBadge(tx.type))}>{tx.type}</span>
                </div>
                <span className="text-xs text-arena-text-muted">{formatDate(tx.createdAt)}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <span className={cn(
                  'text-sm font-bold',
                  tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount} {AETHER_SYMBOL}
                </span>
                <div className="text-[10px] text-arena-text-muted">Bal: {tx.balanceAfter} {AETHER_SYMBOL}</div>
              </div>
            </div>
          ))}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={isFetching}
                className="px-6 py-2.5 bg-arena-card border border-arena-border text-sm font-medium rounded-xl hover:border-arena-accent/30 transition-colors disabled:opacity-50"
              >
                {isFetching ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== MAIN VIEW ====================

export function EarnAetherView() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');
  const queryClient = useQueryClient();

  const handleClaimSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['aether-balance'] });
  }, [queryClient]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-arena-accent/10 flex items-center justify-center">
          <Gift className="w-8 h-8 text-arena-accent" />
        </div>
        <h2 className="text-lg font-bold mb-2">Earn {AETHER_NAME}</h2>
        <p className="text-sm text-arena-text-muted">Sign in to start earning {AETHER_NAME}!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-arena-accent/10 flex items-center justify-center">
          <Gift className="w-5 h-5 text-arena-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Earn {AETHER_NAME}</h1>
          <p className="text-xs text-arena-text-muted">Complete tasks, earn rewards, redeem for real money</p>
        </div>
      </div>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'tasks' ? <TasksTab onClaimSuccess={handleClaimSuccess} /> : <HistoryTab />}
    </div>
  );
}
