'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, className, action }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-arena-surface border border-arena-border flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-arena-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-arena-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-arena-text-secondary max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
