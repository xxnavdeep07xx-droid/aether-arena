/**
 * Aether Arena - Centralized Theme Configuration
 *
 * This file contains ALL styling constants for the website,
 * including colors for dark mode, light mode, spacing, typography,
 * and other design tokens. Import from this file instead of
 * hardcoding values.
 */

// ==================== THEME TYPES ====================

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ColorPalette {
  // Background colors
  background: string;
  darker: string;
  card: string;
  cardHover: string;
  surface: string;

  // Accent colors
  accent: string;
  accentGlow: string;
  accentLight: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Border
  border: string;

  // Semantic colors
  success: string;
  warning: string;
  info: string;
  purple: string;

  // Medal colors
  gold: string;
  silver: string;
  bronze: string;

  // Skeleton loading
  skeletonBase: string;
  skeletonHighlight: string;
}

export interface ShadcnTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ColorPalette;
  shadcn: ShadcnTokens;
}

// ==================== DARK MODE CONFIG ====================

export const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    // Background
    background: '#0f0f14',
    darker: '#0a0a0e',
    card: '#1a1a24',
    cardHover: '#22222e',
    surface: '#12121a',

    // Accent
    accent: '#ff4b5c',
    accentGlow: 'rgba(255, 75, 92, 0.4)',
    accentLight: '#ff6b7a',

    // Text
    textPrimary: '#ffffff',
    textSecondary: '#8a8a9a',
    textMuted: '#555566',

    // Border
    border: '#2a2a38',

    // Semantic
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#3b82f6',
    purple: '#8b5cf6',

    // Medal
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',

    // Skeleton
    skeletonBase: '#14161e',
    skeletonHighlight: '#1e2030',
  },
  shadcn: {
    background: '#0f0f14',
    foreground: '#ffffff',
    card: '#1a1a24',
    cardForeground: '#ffffff',
    popover: '#1a1a24',
    popoverForeground: '#ffffff',
    primary: '#ff4b5c',
    primaryForeground: '#ffffff',
    secondary: '#22222e',
    secondaryForeground: '#ffffff',
    muted: '#22222e',
    mutedForeground: '#8a8a9a',
    accent: '#ff4b5c',
    accentForeground: '#ffffff',
    destructive: '#ef4444',
    border: '#2a2a38',
    input: '#2a2a38',
    ring: '#ff4b5c',
    chart1: '#ff4b5c',
    chart2: '#4ade80',
    chart3: '#fbbf24',
    chart4: '#3b82f6',
    chart5: '#8b5cf6',
    sidebar: '#12121a',
    sidebarForeground: '#ffffff',
    sidebarPrimary: '#ff4b5c',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#22222e',
    sidebarAccentForeground: '#ffffff',
    sidebarBorder: '#2a2a38',
    sidebarRing: '#ff4b5c',
  },
};

// ==================== LIGHT MODE CONFIG ====================

export const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    // Background
    background: '#f5f6f8',
    darker: '#ebedf0',
    card: '#ffffff',
    cardHover: '#f0f1f3',
    surface: '#fafbfc',

    // Accent
    accent: '#e63950',
    accentGlow: 'rgba(230, 57, 80, 0.2)',
    accentLight: '#f05a6e',

    // Text
    textPrimary: '#1a1a2e',
    textSecondary: '#5a5a72',
    textMuted: '#9a9ab0',

    // Border
    border: '#e2e4e8',

    // Semantic
    success: '#16a34a',
    warning: '#d97706',
    info: '#2563eb',
    purple: '#7c3aed',

    // Medal
    gold: '#d4a017',
    silver: '#a8a8a8',
    bronze: '#b06c25',

    // Skeleton
    skeletonBase: '#e5e7eb',
    skeletonHighlight: '#f3f4f6',
  },
  shadcn: {
    background: '#f5f6f8',
    foreground: '#1a1a2e',
    card: '#ffffff',
    cardForeground: '#1a1a2e',
    popover: '#ffffff',
    popoverForeground: '#1a1a2e',
    primary: '#e63950',
    primaryForeground: '#ffffff',
    secondary: '#f0f1f3',
    secondaryForeground: '#1a1a2e',
    muted: '#f0f1f3',
    mutedForeground: '#5a5a72',
    accent: '#e63950',
    accentForeground: '#ffffff',
    destructive: '#dc2626',
    border: '#e2e4e8',
    input: '#e2e4e8',
    ring: '#e63950',
    chart1: '#e63950',
    chart2: '#16a34a',
    chart3: '#d97706',
    chart4: '#2563eb',
    chart5: '#7c3aed',
    sidebar: '#f0f1f3',
    sidebarForeground: '#1a1a2e',
    sidebarPrimary: '#e63950',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#e8e9ec',
    sidebarAccentForeground: '#1a1a2e',
    sidebarBorder: '#e2e4e8',
    sidebarRing: '#e63950',
  },
};

// ==================== HELPER FUNCTIONS ====================

export function getThemeConfig(mode: ThemeMode): ThemeConfig {
  if (mode === 'light') return lightTheme;
  return darkTheme; // default to dark for both 'dark' and 'system' (will resolve at runtime)
}

export function getResolvedTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  }
  return mode;
}

// ==================== INPUT FIELD STYLING ====================

export const inputStyles = {
  dark: {
    background: '#0f0f14',
    border: '#2a2a38',
    focusBorder: '#ff4b5c',
    focusRing: 'rgba(255, 75, 92, 0.2)',
  },
  light: {
    background: '#ffffff',
    border: '#e2e4e8',
    focusBorder: '#e63950',
    focusRing: 'rgba(230, 57, 80, 0.2)',
  },
} as const;

// ==================== THEME CSS VARIABLE MAPPINGS ====================

/**
 * Maps our theme colors to CSS custom property names.
 * Used for generating CSS from theme config.
 */
export const colorToCssVar: Record<keyof ColorPalette, string> = {
  background: '--color-arena-dark',
  darker: '--color-arena-darker',
  card: '--color-arena-card',
  cardHover: '--color-arena-card-hover',
  surface: '--color-arena-surface',
  accent: '--color-arena-accent',
  accentGlow: '--color-arena-accent-glow',
  accentLight: '--color-arena-accent-light',
  textPrimary: '--color-arena-text-primary',
  textSecondary: '--color-arena-text-secondary',
  textMuted: '--color-arena-text-muted',
  border: '--color-arena-border',
  success: '--color-arena-success',
  warning: '--color-arena-warning',
  info: '--color-arena-info',
  purple: '--color-arena-purple',
  gold: '--color-arena-gold',
  silver: '--color-arena-silver',
  bronze: '--color-arena-bronze',
  skeletonBase: '--skeleton-base',
  skeletonHighlight: '--skeleton-highlight',
};

export const shadcnToCssVar: Record<keyof ShadcnTokens, string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  border: '--border',
  input: '--input',
  ring: '--ring',
  chart1: '--chart-1',
  chart2: '--chart-2',
  chart3: '--chart-3',
  chart4: '--chart-4',
  chart5: '--chart-5',
  sidebar: '--sidebar',
  sidebarForeground: '--sidebar-foreground',
  sidebarPrimary: '--sidebar-primary',
  sidebarPrimaryForeground: '--sidebar-primary-foreground',
  sidebarAccent: '--sidebar-accent',
  sidebarAccentForeground: '--sidebar-accent-foreground',
  sidebarBorder: '--sidebar-border',
  sidebarRing: '--sidebar-ring',
};

// ==================== PASSWORD REQUIREMENTS ====================

export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
} as const;

export const PASSWORD_RULES_TEXT = [
  `At least ${PASSWORD_RULES.minLength} characters`,
  'One uppercase letter (A-Z)',
  'One lowercase letter (a-z)',
  'One number (0-9)',
] as const;

// ==================== AUTH CONSTANTS ====================

export const AUTH_CONSTANTS = {
  usernameMinLength: 3,
  usernameMaxLength: 20,
  usernamePattern: /^[a-zA-Z0-9_-]+$/,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phonePattern: /^[6-9]\d{9}$/,
  otpLength: 6,
  otpExpiryMinutes: 5,
  welcomeBonusAether: 50,
  referralBonusAether: 30,
} as const;
