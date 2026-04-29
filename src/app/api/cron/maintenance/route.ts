import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Vercel Cron: Runs every 6 hours to clean up expired sessions and process account deletions
// Protected by CRON_SECRET env var to prevent unauthorized calls

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  // ── 1. Clean expired sessions ──────────────────────────────
  try {
    const deletedSessions = await db.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    results.push(`Sessions cleaned: ${deletedSessions.count} expired`)
  } catch (e) {
    results.push(`Sessions cleanup failed: ${e instanceof Error ? e.message : 'unknown'}`)
  }

  // ── 2. Process scheduled account deletions ──────────────────
  try {
    const expiredDeletions = await db.profile.findMany({
      where: {
        scheduledDeletionAt: { lt: new Date() },
        isAdmin: false,
      },
      select: { id: true, username: true },
    })

    for (const user of expiredDeletions) {
      try {
        // Delete in dependency order (same as performDeletion in me/delete/route.ts)
        await db.matchParticipant.deleteMany({ where: { playerId: user.id } })
        await db.match.deleteMany({ where: { tournament: { createdById: user.id } } })
        await db.tournamentRegistration.deleteMany({ where: { playerId: user.id } })
        await db.leaderboard.deleteMany({ where: { playerId: user.id } })
        await db.notification.deleteMany({ where: { userId: user.id } })
        await db.announcement.deleteMany({ where: { createdById: user.id } })
        await db.streamSchedule.deleteMany({ where: { createdById: user.id } })
        await db.platformSetting.deleteMany({ where: { updatedById: user.id } })
        await db.aetherTaskProgress.deleteMany({ where: { userId: user.id } })
        await db.aetherTransaction.deleteMany({ where: { userId: user.id } })
        await db.redemptionRequest.deleteMany({ where: { userId: user.id } })
        await db.aetherBalance.deleteMany({ where: { userId: user.id } })
        await db.userStreak.deleteMany({ where: { userId: user.id } })
        await db.tournament.deleteMany({ where: { createdById: user.id } })
        await db.session.deleteMany({ where: { userId: user.id } })
        await db.account.deleteMany({ where: { userId: user.id } })
        await db.accountCredential.deleteMany({ where: { userId: user.id } })
        await db.profile.delete({ where: { id: user.id } })
        results.push(`Deleted account: ${user.username}`)
      } catch (e) {
        results.push(`Failed to delete ${user.username}: ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    if (expiredDeletions.length === 0) {
      results.push('No accounts to delete')
    }
  } catch (e) {
    results.push(`Account deletion check failed: ${e instanceof Error ? e.message : 'unknown'}`)
  }

  // ── 3. Clean expired phone verifications (OTP) ──────────────
  try {
    const deletedOTPs = await db.phoneVerification.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    results.push(`Expired OTPs cleaned: ${deletedOTPs.count}`)
  } catch (e) {
    results.push(`OTP cleanup failed: ${e instanceof Error ? e.message : 'unknown'}`)
  }

  console.log('[Cron] Maintenance results:', results)
  return NextResponse.json({ success: true, results })
}
