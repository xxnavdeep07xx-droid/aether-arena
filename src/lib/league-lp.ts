import { db } from './db';
import { LEAGUE_CONFIG, getLeagueForPoints } from './utils';

// LP rewards for different actions
export const LP_REWARDS = {
  TOURNAMENT_WIN: 30,        // 1st place
  TOURNAMENT_TOP3: 15,       // 2nd or 3rd place
  TOURNAMENT_PARTICIPATION: 5, // Completed a tournament match
  DAILY_STREAK_7: 10,        // 7-day check-in streak bonus
  REFERRAL: 5,               // Each successful referral
} as const;

/**
 * Add LP to a user's profile and auto-update their league
 */
export async function addLeaguePoints(userId: string, amount: number, _reason: string): Promise<{ newPoints: number; newLeague: string; leagueChanged: boolean }> {
  const profile = await db.profile.findUnique({ where: { id: userId }, select: { leaguePoints: true, league: true } });
  if (!profile) throw new Error('Profile not found');

  const newPoints = profile.leaguePoints + amount;
  const newLeague = getLeagueForPoints(newPoints);
  const leagueChanged = newLeague !== profile.league;

  await db.profile.update({
    where: { id: userId },
    data: {
      leaguePoints: newPoints,
      league: newLeague,
    },
  });

  // Create notification if league changed
  if (leagueChanged) {
    const leagueConfig = LEAGUE_CONFIG[newLeague];
    await db.notification.create({
      data: {
        userId,
        title: 'League Rank Up!',
        message: `Congratulations! You've been promoted to ${leagueConfig.label} league! ${leagueConfig.icon}`,
        type: 'league_up',
      },
    });
  }

  return { newPoints, newLeague, leagueChanged };
}

/**
 * Calculate and award LP based on match placement
 */
export async function awardMatchLP(userId: string, placement: number): Promise<{ newPoints: number; newLeague: string; leagueChanged: boolean; lpAwarded: number }> {
  let lpAwarded: number = LP_REWARDS.TOURNAMENT_PARTICIPATION; // Base participation

  if (placement === 1) {
    lpAwarded = LP_REWARDS.TOURNAMENT_WIN;
  } else if (placement <= 3) {
    lpAwarded = LP_REWARDS.TOURNAMENT_TOP3;
  }

  const result = await addLeaguePoints(userId, lpAwarded, `Match placement #${placement}`);
  return { ...result, lpAwarded };
}
