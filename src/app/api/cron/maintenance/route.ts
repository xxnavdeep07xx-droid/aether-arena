import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    // Still perform a comparison to avoid leaking length via timing
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

// Vercel Cron: Runs every 6 hours to clean up expired sessions and process account deletions
// Protected by CRON_SECRET env var to prevent unauthorized calls

export async function GET(request: Request) {
  // Verify cron secret — multiple methods supported:
  // 1. Authorization: Bearer <CRON_SECRET> header
  // 2. ?secret=<CRON_SECRET> query param
  // 3. Vercel cron requests are identified by x-vercel-cron header
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  const urlSecret = new URL(request.url).searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET

  if (!isVercelCron) {
    // Not a Vercel cron — require manual auth
    if (cronSecret) {
      const headerToken = authHeader?.replace('Bearer ', '')
      const provided = headerToken || urlSecret
      if (!provided || !timingSafeEqual(provided, cronSecret)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
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
        // Delete in dependency order inside a transaction — prevents partial deletion
        await db.$transaction(async (tx) => {
          await tx.matchParticipant.deleteMany({ where: { playerId: user.id } })
          await tx.match.deleteMany({ where: { tournament: { createdById: user.id } } })
          await tx.tournamentRegistration.deleteMany({ where: { playerId: user.id } })
          await tx.leaderboard.deleteMany({ where: { playerId: user.id } })
          await tx.notification.deleteMany({ where: { userId: user.id } })
          await tx.announcement.deleteMany({ where: { createdById: user.id } })
          await tx.streamSchedule.deleteMany({ where: { createdById: user.id } })
          await tx.platformSetting.deleteMany({ where: { updatedById: user.id } })
          await tx.aetherTaskProgress.deleteMany({ where: { userId: user.id } })
          await tx.aetherTransaction.deleteMany({ where: { userId: user.id } })
          await tx.redemptionRequest.deleteMany({ where: { userId: user.id } })
          await tx.aetherBalance.deleteMany({ where: { userId: user.id } })
          await tx.userStreak.deleteMany({ where: { userId: user.id } })
          await tx.tournament.deleteMany({ where: { createdById: user.id } })
          await tx.session.deleteMany({ where: { userId: user.id } })
          await tx.accountCredential.deleteMany({ where: { userId: user.id } })
          await tx.profile.delete({ where: { id: user.id } })
        })
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

  // ── 4. Clean expired email verification tokens ─────────────
  try {
    const expiredTokens = await db.accountCredential.updateMany({
      where: {
        emailVerificationToken: { not: null },
        emailVerificationExpires: { lt: new Date() },
        emailVerified: false,
      } as any,
      data: {
        emailVerificationToken: null,
        emailVerificationExpires: null,
      } as any,
    })
    results.push(`Expired email verification tokens cleaned: ${expiredTokens.count}`)
  } catch (e) {
    results.push(`Email verification cleanup failed: ${e instanceof Error ? e.message : 'unknown'}`)
  }

  console.info('[Cron] Maintenance results:', results)
  return NextResponse.json({ success: true, results })
}
