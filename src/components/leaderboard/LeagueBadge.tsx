'use client';

import { cn } from '@/lib/utils';
import { LEAGUE_CONFIG } from '@/lib/utils';

interface LeagueBadgeProps {
  league: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { container: 'px-2 py-0.5 text-[10px] gap-1', iconSize: 'text-xs' },
  md: { container: 'px-2.5 py-1 text-xs gap-1.5', iconSize: 'text-sm' },
  lg: { container: 'px-3 py-1.5 text-sm gap-2', iconSize: 'text-base' },
};

export function LeagueBadge({ league, size = 'md', showLabel = true, className }: LeagueBadgeProps) {
  const config = LEAGUE_CONFIG[league] || LEAGUE_CONFIG.bronze;
  const styles = sizeStyles[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-medium whitespace-nowrap',
        styles.container,
        className
      )}
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      <span className={styles.iconSize}>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
