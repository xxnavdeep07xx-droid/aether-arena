export const AETHER_SYMBOL = '◆';
export const AETHER_NAME = 'Aether';
export const REDEEM_MINIMUM = 500;
export const CONVERSION_RATE = 100; // 100 Aether = ₹10

export function formatAether(amount: number): string {
  return `${amount} ${AETHER_SYMBOL}`;
}

export function aetherToInr(aether: number): number {
  return (aether / CONVERSION_RATE) * 10;
}

export function inrToAether(inr: number): number {
  return Math.round((inr / 10) * CONVERSION_RATE);
}

export function getStreakMilestone(streak: number): { milestone: number; reward: number } | null {
  if (streak === 7) return { milestone: 7, reward: 50 };
  if (streak === 30) return { milestone: 30, reward: 200 };
  return null;
}

export function getNextStreakMilestone(currentStreak: number): { milestone: number; reward: number } {
  if (currentStreak < 7) return { milestone: 7, reward: 50 };
  if (currentStreak < 30) return { milestone: 30, reward: 200 };
  return { milestone: 30, reward: 200 }; // max reached
}
