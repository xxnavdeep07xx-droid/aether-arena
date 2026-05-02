import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// Temporary endpoint to clear all seed/demo data from the database.
// Protected by admin authentication. Will be removed after use.

export async function DELETE() {
  // Require admin auth
  const session = await requireAuth()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const results: string[] = []

    // Clear data tables in dependency order (child tables first)
    const dataTables = [
      'Notification',
      'Leaderboard',
      'MatchParticipant',
      'Match',
      'TournamentRegistration',
      'Tournament',
      'StreamSchedule',
      'AffiliateLink',
      'PlatformSetting',
      'Announcement',
      'ContactSubmission',
      'Game',
      'AetherTaskProgress',
      'AetherTransaction',
      'RedemptionRequest',
      'AetherBalance',
      'UserStreak',
      'AetherTask',
      'TopupPack',
    ]

    for (const table of dataTables) {
      try {
        const res: { count: number }[] = await db.$queryRawUnsafe(
          `SELECT COUNT(*)::int as count FROM "${table}"`
        )
        const before = res[0]?.count || 0
        await db.$executeRawUnsafe(`DELETE FROM "${table}"`)
        results.push(`${table}: deleted ${before} rows`)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'unknown'
        results.push(`${table}: skipped (${msg.substring(0, 80)})`)
      }
    }

    // Reset all user profile stats to zero (keeps accounts intact)
    try {
      await db.$executeRawUnsafe(`
        UPDATE "Profile" SET
          "league" = 'bronze',
          "leaguePoints" = 0,
          "totalTournamentsPlayed" = 0,
          "totalWins" = 0,
          "totalKills" = 0,
          "totalDeaths" = 0,
          "totalPrizeWon" = 0,
          "avatarUrl" = NULL,
          "bio" = ''
      `)
      results.push('Profile stats: reset to zero')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      results.push(`Profile reset: ${msg.substring(0, 80)}`)
    }

    // Remove fake/seeded user profiles (keep only real users with credentials)
    try {
      const realUsers: { id: string }[] = await db.$queryRawUnsafe(`
        SELECT DISTINCT "userId" as id FROM "AccountCredential"
      `)
      const realIds = realUsers.map(u => u.id)

      if (realIds.length > 0) {
        const placeholders = realIds.map((_, i) => `$${i + 1}`).join(',')
        const deleteResult: { count: number }[] = await db.$queryRawUnsafe(
          `SELECT COUNT(*)::int as count FROM "Profile" WHERE "id" NOT IN (${placeholders})`,
          ...realIds
        )
        const fakeCount = deleteResult[0]?.count || 0

        if (fakeCount > 0) {
          await db.$executeRawUnsafe(
            `DELETE FROM "Profile" WHERE "id" NOT IN (${placeholders})`,
            ...realIds
          )
          results.push(`Fake profiles deleted: ${fakeCount} (kept ${realIds.length} real users)`)
        } else {
          results.push(`No fake profiles found (all ${realIds.length} users have credentials)`)
        }
      } else {
        results.push('No real users found — skipping fake profile cleanup')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      results.push(`Fake profile cleanup: ${msg.substring(0, 80)}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
