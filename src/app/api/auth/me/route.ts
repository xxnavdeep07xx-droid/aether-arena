import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null })
    }

    // Get fresh profile data with email
    const profile = await db.profile.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        isAdmin: true,
        isBanned: true,
        league: true,
        leaguePoints: true,
        totalTournamentsPlayed: true,
        totalWins: true,
        totalKills: true,
        totalDeaths: true,
        totalPrizeWon: true,
        scheduledDeletionAt: true,
        credentials: {
          select: { email: true, phone: true, emailVerified: true } as any,
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ user: null })
    }

    // If deletion period has passed, treat as deleted
    if (profile.scheduledDeletionAt && new Date(profile.scheduledDeletionAt) <= new Date()) {
      await db.session.deleteMany({ where: { userId: session.userId } })
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        ...profile,
        email: profile.credentials?.email || null,
        phone: profile.phone || profile.credentials?.phone || null,
        emailVerified: profile.credentials?.emailVerified ?? false,
        isAdmin: Boolean(profile.isAdmin),
        credentials: undefined,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/auth/me — Cancel scheduled account deletion
// Separated from GET to avoid writes on read requests (proper HTTP semantics)
export async function POST() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const profile = await db.profile.findUnique({
      where: { id: session.userId },
      select: { scheduledDeletionAt: true },
    })

    if (!profile?.scheduledDeletionAt) {
      return NextResponse.json({ message: 'No scheduled deletion found' })
    }

    // Cancel the deletion
    await db.profile.update({
      where: { id: session.userId },
      data: { scheduledDeletionAt: null },
    })

    return NextResponse.json({ message: 'Account deletion cancelled successfully' })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
