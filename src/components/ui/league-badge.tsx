'use client';

import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────
   League colour / glow config
   ────────────────────────────────────────────── */

const LEAGUE_BADGE_CONFIG: Record<
  string,
  { primary: string; secondary: string; glow: string }
> = {
  bronze: {
    primary: '#CD7F32',
    secondary: '#8B5A2B',
    glow: 'none',
  },
  silver: {
    primary: '#C0C0C0',
    secondary: '#808080',
    glow: '0 0 6px rgba(192,192,192,0.3)',
  },
  gold: {
    primary: '#FFD700',
    secondary: '#B8860B',
    glow: '0 0 8px rgba(255,215,0,0.4)',
  },
  platinum: {
    primary: '#E5E4E2',
    secondary: '#A0A0A0',
    glow: '0 0 10px rgba(229,228,226,0.4)',
  },
  diamond: {
    primary: '#B9F2FF',
    secondary: '#00BFFF',
    glow: '0 0 14px rgba(185,242,255,0.5)',
  },
  master: {
    primary: '#FF6B6B',
    secondary: '#CC3333',
    glow: '0 0 16px rgba(255,107,107,0.5)',
  },
  grandmaster: {
    primary: '#FF4B5C',
    secondary: '#CC0022',
    glow: '0 0 20px rgba(255,75,92,0.6)',
  },
  legend: {
    primary: '#BF5AF2',
    secondary: '#8944CC',
    glow: '0 0 24px rgba(191,90,242,0.6)',
  },
};

const SIZE_MAP: Record<string, number> = { sm: 24, md: 36, lg: 48, xl: 64 };

/* ──────────────────────────────────────────────
   SVG Badge Components — one per league, each
   progressively more elaborate & detailed
   ────────────────────────────────────────────── */

interface BadgeProps {
  color: string;
  secondaryColor: string;
  size: number;
}

/* ── Bronze — Simple round shield with rivets ── */
function BronzeBadge({ color, secondaryColor, size }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bronze-grad" x1="12" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="bronze-rim" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>
      {/* Outer shield */}
      <path
        d="M32 4L8 16V36C8 48 32 60 32 60S56 48 56 36V16L32 4Z"
        fill="url(#bronze-grad)"
        stroke="url(#bronze-rim)"
        strokeWidth="2.5"
      />
      {/* Inner panel */}
      <path
        d="M32 14L18 22V36C18 44 32 52 32 52S46 44 46 36V22L32 14Z"
        fill={color}
        fillOpacity="0.15"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      {/* Centre circle emblem */}
      <circle cx="32" cy="31" r="7" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="32" cy="31" r="3" fill={color} fillOpacity="0.5" />
      {/* Rivet details */}
      <circle cx="32" cy="10" r="1.2" fill={color} fillOpacity="0.7" />
      <circle cx="14" cy="20" r="1.2" fill={color} fillOpacity="0.7" />
      <circle cx="50" cy="20" r="1.2" fill={color} fillOpacity="0.7" />
    </svg>
  );
}

/* ── Silver — Shield with 5‑pointed star ── */
function SilverBadge({ color, secondaryColor, size }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="silver-grad" x1="10" y1="2" x2="54" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8E8E8" stopOpacity="0.5" />
          <stop offset="50%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="silver-rim" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D8D8D8" />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="silver-star" x1="32" y1="18" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Outer shield with notch top */}
      <path
        d="M32 4L8 16V36C8 48 32 60 32 60S56 48 56 36V16L32 4Z"
        fill="url(#silver-grad)"
        stroke="url(#silver-rim)"
        strokeWidth="2.5"
      />
      {/* Inner panel */}
      <path
        d="M32 14L18 22V36C18 44 32 52 32 52S46 44 46 36V22L32 14Z"
        fill={color}
        fillOpacity="0.1"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      {/* Horizontal band */}
      <rect x="18" y="30" width="28" height="3" rx="1.5" fill={color} fillOpacity="0.2" />
      {/* Star emblem */}
      <path
        d="M32 18L34.9 25.5L43 26.2L36.9 31.5L38.8 39.4L32 35.2L25.2 39.4L27.1 31.5L21 26.2L29.1 25.5L32 18Z"
        fill="url(#silver-star)"
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.5"
      />
      {/* Shine line */}
      <path d="M14 18L32 8L36 10" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Gold — Shield with crown detail ── */
function GoldBadge({ color, secondaryColor, size }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gold-grad" x1="10" y1="2" x2="54" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE066" stopOpacity="0.55" />
          <stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="gold-rim" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="gold-crown" x1="24" y1="14" x2="40" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF2A0" />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <filter id="gold-shimmer" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
        </filter>
      </defs>
      {/* Outer shield */}
      <path
        d="M32 4L8 16V36C8 48 32 60 32 60S56 48 56 36V16L32 4Z"
        fill="url(#gold-grad)"
        stroke="url(#gold-rim)"
        strokeWidth="2.5"
      />
      {/* Decorative inner border */}
      <path
        d="M32 12L16 21V37C16 46 32 54 32 54S48 46 48 37V21L32 12Z"
        fill={color}
        fillOpacity="0.08"
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.35"
      />
      {/* Crown */}
      <path
        d="M22 30L24 20L28 25L32 16L36 25L40 20L42 30Z"
        fill="url(#gold-crown)"
        stroke={secondaryColor}
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      {/* Crown base band */}
      <rect x="22" y="30" width="20" height="4" rx="1" fill={color} fillOpacity="0.5" stroke={secondaryColor} strokeWidth="0.6" strokeOpacity="0.4" />
      {/* Jewels on crown */}
      <circle cx="28" cy="32" r="1.5" fill="#FF4444" fillOpacity="0.7" />
      <circle cx="32" cy="32" r="1.5" fill="#44FF44" fillOpacity="0.7" />
      <circle cx="36" cy="32" r="1.5" fill="#4488FF" fillOpacity="0.7" />
      {/* Crown tips */}
      <circle cx="24" cy="20" r="1.2" fill={color} fillOpacity="0.8" />
      <circle cx="32" cy="16" r="1.2" fill={color} fillOpacity="0.8" />
      <circle cx="40" cy="20" r="1.2" fill={color} fillOpacity="0.8" />
      {/* Lower chevron decoration */}
      <path d="M22 40L32 46L42 40" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
      {/* Shine streak */}
      <path d="M14 18L32 8L37 11" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round" />
    </svg>
  );
}

/* ── Platinum — Shield with diamond facet lines ── */
function PlatinumBadge({ color, secondaryColor, size }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="plat-grad" x1="10" y1="2" x2="54" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="50%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="plat-rim" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0EFED" />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="plat-gem" x1="26" y1="20" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Outer shield — slightly wider */}
      <path
        d="M32 3L7 16V37C7 49 32 61 32 61S57 49 57 37V16L32 3Z"
        fill="url(#plat-grad)"
        stroke="url(#plat-rim)"
        strokeWidth="2.5"
      />
      {/* Facet lines radiating from centre */}
      <line x1="32" y1="12" x2="32" y2="52" stroke={color} strokeWidth="0.6" strokeOpacity="0.3" />
      <line x1="16" y1="22" x2="48" y2="42" stroke={color} strokeWidth="0.6" strokeOpacity="0.3" />
      <line x1="48" y1="22" x2="16" y2="42" stroke={color} strokeWidth="0.6" strokeOpacity="0.3" />
      <line x1="12" y1="32" x2="52" y2="32" stroke={color} strokeWidth="0.6" strokeOpacity="0.3" />
      {/* Inner border */}
      <path
        d="M32 12L17 22V38C17 47 32 54 32 54S47 47 47 38V22L32 12Z"
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.3"
      />
      {/* Central diamond / gem shape */}
      <path
        d="M32 18L40 31L32 44L24 31Z"
        fill="url(#plat-gem)"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      {/* Facet lines inside gem */}
      <line x1="32" y1="18" x2="32" y2="44" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.4" />
      <line x1="24" y1="31" x2="40" y2="31" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.4" />
      {/* Highlight reflections */}
      <path d="M28 24L32 20L34 24" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
      {/* Corner accents */}
      <path d="M12 20L16 18" stroke={color} strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
      <path d="M52 20L48 18" stroke={color} strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── Diamond — Gem shape with facet reflections + animated glow ── */
function DiamondBadge({ color, secondaryColor, size }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="league-badge-animated"
    >
      <defs>
        <linearGradient id="dia-grad" x1="16" y1="4" x2="48" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0FAFF" stopOpacity="0.6" />
          <stop offset="40%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="dia-facet1" x1="22" y1="10" x2="32" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="dia-facet2" x1="32" y1="10" x2="42" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="dia-facet3" x1="22" y1="30" x2="42" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor="#005F8A" stopOpacity="0.9" />
        </linearGradient>
        <filter id="dia-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feFlood floodColor={color} floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#dia-glow)">
        {/* Main diamond outline */}
        <path
          d="M32 4L12 24L32 58L52 24L32 4Z"
          fill="url(#dia-grad)"
          stroke={color}
          strokeWidth="2"
        />
        {/* Top left facet */}
        <path
          d="M32 4L12 24L32 28Z"
          fill="url(#dia-facet1)"
          stroke={color}
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />
        {/* Top right facet */}
        <path
          d="M32 4L52 24L32 28Z"
          fill="url(#dia-facet2)"
          stroke={color}
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />
        {/* Bottom facet */}
        <path
          d="M12 24L32 58L32 28Z"
          fill="url(#dia-facet3)"
          stroke={color}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        <path
          d="M52 24L32 58L32 28Z"
          fill={secondaryColor}
          fillOpacity="0.4"
          stroke={color}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        {/* Internal facet lines */}
        <line x1="12" y1="24" x2="52" y2="24" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        <line x1="32" y1="4" x2="32" y2="58" stroke={color} strokeWidth="0.6" strokeOpacity="0.3" />
        <line x1="12" y1="24" x2="32" y2="28" stroke="#FFFFFF" strokeWidth="0.4" strokeOpacity="0.4" />
        <line x1="52" y1="24" x2="32" y2="28" stroke="#FFFFFF" strokeWidth="0.4" strokeOpacity="0.4" />
        {/* Shine highlight */}
        <path
          d="M24 14L28 10L30 16"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        {/* Sparkle dots */}
        <circle cx="26" cy="18" r="1" fill="#FFFFFF" opacity="0.7" />
        <circle cx="38" cy="22" r="0.8" fill="#FFFFFF" opacity="0.5" />
      </g>
    </svg>
  );
}

/* ── Master — Shield with flame above ── */
function MasterBadge({ color, secondaryColor, size }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="league-badge-animated"
    >
      <defs>
        <linearGradient id="master-grad" x1="10" y1="12" x2="54" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="master-rim" x1="8" y1="10" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="flame-grad" x1="32" y1="0" x2="32" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFDD44" stopOpacity="0.9" />
          <stop offset="40%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="flame-inner" x1="32" y1="6" x2="32" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFDD44" stopOpacity="0.6" />
        </linearGradient>
        <filter id="flame-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
          <feFlood floodColor={color} floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer shield — starts lower to leave room for flame */}
      <path
        d="M32 14L10 24V40C10 50 32 60 32 60S54 50 54 40V24L32 14Z"
        fill="url(#master-grad)"
        stroke="url(#master-rim)"
        strokeWidth="2.5"
      />
      {/* Inner border */}
      <path
        d="M32 20L16 28V42C16 48 32 56 32 56S48 48 48 42V28L32 20Z"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      {/* Horizontal band across shield */}
      <rect x="16" y="36" width="32" height="3" rx="1.5" fill={color} fillOpacity="0.3" />
      {/* Flame above shield */}
      <g filter="url(#flame-glow)">
        <path
          d="M32 2C32 2 38 8 38 14C38 18 36 20 36 20C36 20 40 16 40 10C40 6 36 2 36 2C36 2 38 10 34 16C32 20 28 18 28 14C28 10 32 6 32 2Z"
          fill="url(#flame-grad)"
        />
        {/* Inner flame */}
        <path
          d="M32 8C32 8 35 12 35 15C35 17 34 18 33 18C32 18 30 17 30 15C30 12 32 8 32 8Z"
          fill="url(#flame-inner)"
        />
      </g>
      {/* Shield emblem — crossed swords */}
      <line x1="24" y1="28" x2="40" y2="44" stroke={color} strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="40" y1="28" x2="24" y2="44" stroke={color} strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" />
      {/* Sword guards */}
      <circle cx="32" cy="36" r="2.5" fill={color} fillOpacity="0.4" stroke={color} strokeWidth="1" strokeOpacity="0.6" />
      {/* Ember particles */}
      <circle cx="28" cy="6" r="0.8" fill="#FFDD44" opacity="0.7" />
      <circle cx="36" cy="4" r="0.6" fill={color} opacity="0.6" />
      <circle cx="34" cy="8" r="0.5" fill="#FFDD44" opacity="0.5" />
    </svg>
  );
}

/* ── Grandmaster — Shield with lightning bolt ── */
function GrandmasterBadge({ color, secondaryColor, size }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="league-badge-animated"
    >
      <defs>
        <linearGradient id="gm-grad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="gm-rim" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF7B8A" />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="bolt-grad" x1="28" y1="8" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFCC" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#FFEE66" stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
        <filter id="bolt-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="blur" />
          <feFlood floodColor={color} floodOpacity="0.55" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="electric-arc" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>
      {/* Outer shield — bolder stroke */}
      <path
        d="M32 3L7 16V38C7 50 32 61 32 61S57 50 57 38V16L32 3Z"
        fill="url(#gm-grad)"
        stroke="url(#gm-rim)"
        strokeWidth="3"
      />
      {/* Inner panel */}
      <path
        d="M32 12L16 21V39C16 48 32 55 32 55S48 48 48 39V21L32 12Z"
        fill={color}
        fillOpacity="0.08"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      {/* Lightning bolt */}
      <g filter="url(#bolt-glow)">
        <path
          d="M35 8L26 30H33L29 56L42 26H34L35 8Z"
          fill="url(#bolt-grad)"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </g>
      {/* Electric arcs around bolt */}
      <g filter="url(#electric-arc)" opacity="0.5">
        <path d="M24 18L20 20L22 16" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M42 22L46 18L44 24" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M22 40L18 42L20 38" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M44 36L48 34L46 40" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
      {/* Energy crackle lines */}
      <path d="M18 24L14 26" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" strokeLinecap="round" />
      <path d="M46 28L50 26" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" strokeLinecap="round" />
      <path d="M20 44L16 46" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" strokeLinecap="round" />
      {/* Sparks */}
      <circle cx="20" cy="22" r="1" fill="#FFFFAA" opacity="0.7" />
      <circle cx="44" cy="20" r="0.8" fill="#FFFFAA" opacity="0.5" />
      <circle cx="24" cy="46" r="0.7" fill="#FFFFAA" opacity="0.4" />
    </svg>
  );
}

/* ── Legend — Crown shape with jewels ── */
function LegendBadge({ color, secondaryColor, size }: BadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="league-badge-animated"
    >
      <defs>
        <linearGradient id="legend-grad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D98AFF" stopOpacity="0.5" />
          <stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="legend-rim" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D98AFF" />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
        <linearGradient id="crown-body" x1="14" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D98AFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="crown-highlight" x1="20" y1="8" x2="44" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
        <filter id="crown-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
          <feFlood floodColor={color} floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="jewel-red" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FF8888" />
          <stop offset="100%" stopColor="#CC0044" />
        </radialGradient>
        <radialGradient id="jewel-blue" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#88BBFF" />
          <stop offset="100%" stopColor="#0044CC" />
        </radialGradient>
        <radialGradient id="jewel-green" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#88FFBB" />
          <stop offset="100%" stopColor="#008844" />
        </radialGradient>
      </defs>
      <g filter="url(#crown-glow)">
        {/* Crown base — the band */}
        <rect x="12" y="40" width="40" height="10" rx="2" fill="url(#crown-body)" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
        {/* Crown peak 1 (left) */}
        <path d="M12 40L12 18L20 30Z" fill="url(#crown-body)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        {/* Crown peak 2 (center-left) */}
        <path d="M20 40L22 12L30 30Z" fill="url(#crown-body)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        {/* Crown peak 3 (center — tallest) */}
        <path d="M27 40L32 6L37 40Z" fill="url(#crown-body)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        {/* Crown peak 4 (center-right) */}
        <path d="M34 40L42 12L44 30Z" fill="url(#crown-body)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        {/* Crown peak 5 (right) */}
        <path d="M44 40L52 18L52 40Z" fill="url(#crown-body)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        {/* Highlight overlays on peaks */}
        <path d="M12 18L16 24L12 30" fill="url(#crown-highlight)" opacity="0.5" />
        <path d="M22 12L26 20L24 28" fill="url(#crown-highlight)" opacity="0.5" />
        <path d="M32 6L34 16L32 24" fill="url(#crown-highlight)" opacity="0.5" />
        {/* Crown tip orbs */}
        <circle cx="12" cy="17" r="2.5" fill={color} stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="22" cy="11" r="2.5" fill={color} stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="32" cy="5" r="3" fill={color} stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />
        <circle cx="42" cy="11" r="2.5" fill={color} stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.5" />
        <circle cx="52" cy="17" r="2.5" fill={color} stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.5" />
        {/* Jewels on band */}
        <circle cx="20" cy="45" r="3" fill="url(#jewel-red)" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.4" />
        <circle cx="32" cy="45" r="3.5" fill="url(#jewel-blue)" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.4" />
        <circle cx="44" cy="45" r="3" fill="url(#jewel-green)" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.4" />
        {/* Band decoration lines */}
        <line x1="12" y1="42" x2="52" y2="42" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.3" />
        <line x1="12" y1="48" x2="52" y2="48" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.3" />
        {/* Sparkle highlights */}
        <path d="M30 8L32 4L34 8L32 10Z" fill="#FFFFFF" opacity="0.6" />
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Badge component lookup
   ────────────────────────────────────────────── */

const BADGE_COMPONENTS: Record<string, React.FC<BadgeProps>> = {
  bronze: BronzeBadge,
  silver: SilverBadge,
  gold: GoldBadge,
  platinum: PlatinumBadge,
  diamond: DiamondBadge,
  master: MasterBadge,
  grandmaster: GrandmasterBadge,
  legend: LegendBadge,
};

/* ──────────────────────────────────────────────
   League label config
   ────────────────────────────────────────────── */

const LEAGUE_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
  master: 'Master',
  grandmaster: 'Grandmaster',
  legend: 'Legend',
};

/* ──────────────────────────────────────────────
   Main exported components
   ────────────────────────────────────────────── */

interface LeagueBadgeProps {
  league: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export function LeagueBadge({
  league,
  size = 'md',
  className,
  animated = true,
}: LeagueBadgeProps) {
  const config = LEAGUE_BADGE_CONFIG[league] ?? LEAGUE_BADGE_CONFIG.bronze;
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;
  const BadgeComponent = BADGE_COMPONENTS[league] ?? BronzeBadge;
  const isHighLeague = ['diamond', 'master', 'grandmaster', 'legend'].includes(league);

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      style={{
        filter: config.glow !== 'none' ? `drop-shadow(${config.glow})` : undefined,
        animation:
          animated && isHighLeague
            ? `league-badge-glow 2s ease-in-out infinite`
            : undefined,
      }}
    >
      <BadgeComponent color={config.primary} secondaryColor={config.secondary} size={px} />
    </div>
  );
}

/* ── With label underneath ── */

interface LeagueBadgeWithLabelProps extends LeagueBadgeProps {
  showLabel?: boolean;
}

export function LeagueBadgeWithLabel({
  league,
  size = 'md',
  className,
  animated = true,
  showLabel = true,
}: LeagueBadgeWithLabelProps) {
  const config = LEAGUE_BADGE_CONFIG[league] ?? LEAGUE_BADGE_CONFIG.bronze;
  const label = LEAGUE_LABELS[league] ?? 'Bronze';
  const isHighLeague = ['diamond', 'master', 'grandmaster', 'legend'].includes(league);

  const textSizeClass =
    size === 'sm'
      ? 'text-[8px]'
      : size === 'md'
        ? 'text-[10px]'
        : size === 'lg'
          ? 'text-xs'
          : 'text-sm';

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <div
        style={{
          filter: config.glow !== 'none' ? `drop-shadow(${config.glow})` : undefined,
          animation:
            animated && isHighLeague
              ? `league-badge-glow 2s ease-in-out infinite`
              : undefined,
        }}
      >
        <LeagueBadge league={league} size={size} animated={animated} />
      </div>
      {showLabel && (
        <span
          className={cn(
            'font-bold uppercase tracking-wider',
            textSizeClass,
          )}
          style={{ color: config.primary }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   CSS keyframes for animated glow — injected via
   a style tag so no global CSS changes needed
   ────────────────────────────────────────────── */

export function LeagueBadgeStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes league-badge-glow {
            0%, 100% {
              filter: drop-shadow(0 0 6px rgba(255,255,255,0.15));
            }
            50% {
              filter: drop-shadow(0 0 14px rgba(255,255,255,0.35));
            }
          }
        `,
      }}
    />
  );
}

/* ──────────────────────────────────────────────
   Utility: get the colour for a league (useful
   for styling text / borders alongside badge)
   ────────────────────────────────────────────── */

export function getLeagueColor(league: string): string {
  return LEAGUE_BADGE_CONFIG[league]?.primary ?? LEAGUE_BADGE_CONFIG.bronze.primary;
}

export function getLeagueGlow(league: string): string {
  return LEAGUE_BADGE_CONFIG[league]?.glow ?? 'none';
}

export { LEAGUE_BADGE_CONFIG, SIZE_MAP };
