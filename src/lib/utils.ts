import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function paiseToRupee(paise: number): string {
  if (paise === 0) return 'FREE';
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export function rupeeToPaise(rupee: number): number {
  return Math.round(rupee * 100);
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getCountdown(targetDate: string | Date): string {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return 'Started!';
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

export const LEAGUE_CONFIG: Record<string, { minPoints: number; color: string; label: string; icon: string }> = {
  bronze: { minPoints: 0, color: '#CD7F32', label: 'Bronze', icon: '🥉' },
  silver: { minPoints: 100, color: '#C0C0C0', label: 'Silver', icon: '🏅' },
  gold: { minPoints: 300, color: '#FFD700', label: 'Gold', icon: '🏆' },
  platinum: { minPoints: 600, color: '#E5E4E2', label: 'Platinum', icon: '💎' },
  diamond: { minPoints: 1000, color: '#B9F2FF', label: 'Diamond', icon: '💠' },
  master: { minPoints: 1500, color: '#FF6B6B', label: 'Master', icon: '🔥' },
  grandmaster: { minPoints: 2100, color: '#FF4B5C', label: 'Grandmaster', icon: '⚡' },
  legend: { minPoints: 3000, color: '#BF5AF2', label: 'Legend', icon: '👑' },
};

export function getLeagueForPoints(points: number): string {
  const leagues = Object.entries(LEAGUE_CONFIG).sort((a, b) => b[1].minPoints - a[1].minPoints);
  for (const [key, config] of leagues) {
    if (points >= config.minPoints) return key;
  }
  return 'bronze';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'live': case 'in_progress': return 'text-arena-accent';
    case 'registration_open': return 'text-arena-success';
    case 'upcoming': case 'scheduled': return 'text-arena-info';
    case 'completed': case 'ended': return 'text-arena-text-muted';
    case 'cancelled': return 'text-arena-text-muted';
    default: return 'text-arena-text-secondary';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'live': case 'in_progress': return 'bg-arena-accent/20 text-arena-accent';
    case 'registration_open': return 'bg-arena-success/20 text-arena-success';
    case 'upcoming': case 'scheduled': return 'bg-arena-info/20 text-arena-info';
    case 'completed': case 'ended': return 'bg-arena-text-muted/20 text-arena-text-muted';
    case 'cancelled': return 'bg-arena-text-muted/20 text-arena-text-muted';
    default: return 'bg-secondary text-muted-foreground';
  }
}

export function getFormatLabel(format: string): string {
  switch (format) {
    case 'solo': return 'Solo';
    case 'duo': return 'Duo';
    case 'squad': return 'Squad';
    case 'custom': return 'Custom';
    default: return format;
  }
}
