'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AetherIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
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

export function AetherIcon({ className, size = 'md', animated = false }: AetherIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeMap[size],
        animated && 'aether-icon-animated',
        isHovered && 'aether-icon-hover',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sparkle shimmer overlay */}
      {animated && (
        <span className="absolute inset-0 rounded-full aether-sparkle-overlay pointer-events-none" aria-hidden="true">
          <span className="absolute -top-0.5 -left-0.5 w-1 h-1 rounded-full bg-arena-accent animate-[aether-sparkle_2s_ease-in-out_infinite]" />
          <span className="absolute -top-0.5 -right-0.5 w-0.5 h-0.5 rounded-full bg-yellow-300 animate-[aether-sparkle_2s_ease-in-out_0.5s_infinite]" />
          <span className="absolute -bottom-0.5 -right-0.5 w-1 h-1 rounded-full bg-arena-accent-light animate-[aether-sparkle_2s_ease-in-out_1s_infinite]" />
          <span className="absolute -bottom-0.5 -left-0.5 w-0.5 h-0.5 rounded-full bg-pink-300 animate-[aether-sparkle_2s_ease-in-out_1.5s_infinite]" />
        </span>
      )}
      <img
        src={srcMap[size]}
        alt="◆"
        className="w-full h-full object-contain select-none relative z-10"
        draggable={false}
      />
    </span>
  );
}
