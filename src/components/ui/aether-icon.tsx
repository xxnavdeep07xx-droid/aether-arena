'use client';

import { cn } from '@/lib/utils';

interface AetherIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const srcMap = {
  sm: '/aether-coin-sm.png',
  md: '/aether-coin-md.png',
  lg: '/aether-coin-md.png',
  xl: '/aether-coin-lg.png',
};

export function AetherIcon({ className, size = 'md' }: AetherIconProps) {
  return (
    <img
      src={srcMap[size]}
      alt="◆"
      className={cn(sizeMap[size], 'inline-block object-contain', className)}
      draggable={false}
    />
  );
}
