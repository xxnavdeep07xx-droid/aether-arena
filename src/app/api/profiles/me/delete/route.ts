import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { strictLimiter } from '@/lib/rate-limit'

// POST /api/profiles/me/delete — Schedule account deletion (30-day window)
export async function POST(request: Request) {
  // Rate limiting — strict because this is a destructive action
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await strictLimiter(`delete:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many deletion attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const auth = await requireAuth(request)
    const userId = auth.userId

    const profile = await db.profile.findUnique({
      where: { id: userId },
      select: { id: true, username: true, isAdmin: true, scheduledDeletionAt: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Admins cannot delete their account through this endpoint
    if (profile.isAdmin) {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted. Contact the platform owner.' },
        { status: 403 }
      )
    }

    // Check if already scheduled
    if (profile.scheduledDeletionAt) {
      const deletionDate = new Date(profile.scheduledDeletionAt)
      const now = new Date()
      const daysLeft = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysLeft > 0) {
        return NextResponse.json({
          message: `Account is already scheduled for deletion. ${daysLeft} days remaining to recover.`,
          scheduledDeletionAt: profile.scheduledDeletionAt,
          daysRemaining: daysLeft,
        })
      } else {
        // Deletion period has passed — perform actual deletion
        await performDeletion(userId)
        return NextResponse.json({ message: 'Account has been permanently deleted.' })
      }
    }

    // Schedule deletion for 30 days from now
    const deletionDate = new Date()
    deletionDate.setDate(deletionDate.getDate() + 30)

    await db.profile.update({
      where: { id: userId },
      data: { scheduledDeletionAt: deletionDate },
    })

    // Delete sessions to log the user out
    await db.session.deleteMany({ where: { userId } })

    return NextResponse.json({
      message: `Account scheduled for deletion. You have 30 days to recover by logging back in. Deletion date: ${deletionDate.toISOString().split('T')[0]}`,
      scheduledDeletionAt: deletionDate.toISOString(),
      daysRemaining: 30,
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function performDeletion(userId: string) {
  // Delete all related data in correct order due to foreign keys
  await db.matchParticipant.deleteMany({ where: { playerId: userId } })
  await db.match.deleteMany({ where: { tournament: { createdById: userId } } })
  await db.tournamentRegistration.deleteMany({ where: { playerId: userId } })
  await db.leaderboard.deleteMany({ where: { playerId: userId } })
  await db.notification.deleteMany({ where: { userId } })
  await db.announcement.deleteMany({ where: { createdById: userId } })
  await db.streamSchedule.deleteMany({ where: { createdById: userId } })
  await db.platformSetting.deleteMany({ where: { updatedById: userId } })
  await db.tournament.deleteMany({ where: { createdById: userId } })
  await db.session.deleteMany({ where: { userId } })
  await db.account.deleteMany({ where: { userId } })
  await db.accountCredential.deleteMany({ where: { userId } })
  await db.profile.delete({ where: { id: userId } })
}
