'use client';

import { cn } from '@/lib/utils';
import { paiseToRupee } from '@/lib/utils';
import { Users, Trophy, Clock, IndianRupee } from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    activeTournaments: number;
    pendingVerifications: number;
    totalRevenue: number;
  };
  className?: string;
}

interface StatCardConfig {
  label: string;
  icon: typeof Users;
  value: string | number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function AdminStats({ stats, className }: AdminStatsProps) {
  const cards: StatCardConfig[] = [
    {
      label: 'Total Users',
      icon: Users,
      value: stats.totalUsers.toLocaleString(),
      color: 'text-arena-info',
      bgColor: 'bg-arena-info/10',
      borderColor: 'border-arena-info/20',
    },
    {
      label: 'Active Tournaments',
      icon: Trophy,
      value: stats.activeTournaments,
      color: 'text-arena-success',
      bgColor: 'bg-arena-success/10',
      borderColor: 'border-arena-success/20',
    },
    {
      label: 'Pending Verifications',
      icon: Clock,
      value: stats.pendingVerifications,
      color: 'text-arena-warning',
      bgColor: 'bg-arena-warning/10',
      borderColor: 'border-arena-warning/20',
    },
    {
      label: 'Total Revenue',
      icon: IndianRupee,
      value: paiseToRupee(stats.totalRevenue),
      color: 'text-arena-accent',
      bgColor: 'bg-arena-accent/10',
      borderColor: 'border-arena-accent/20',
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            'p-5 rounded-2xl bg-arena-card border transition-all hover:shadow-lg hover:-translate-y-0.5',
            card.borderColor
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', card.bgColor)}>
              <card.icon className={cn('w-5 h-5', card.color)} />
            </div>
            <div>
              <p className="text-xs text-arena-text-muted font-medium">{card.label}</p>
              <p className={cn('text-2xl font-bold mt-0.5', card.color)}>{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
