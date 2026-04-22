import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request)

    const streak = await db.userStreak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: null,
      },
      update: {},
    })

    // Determine next milestone
    let nextMilestone: number
    let milestoneReward: number

    if (streak.currentStreak >= 30) {
      nextMilestone = 0
      milestoneReward = 0
    } else if (streak.currentStreak >= 7) {
      nextMilestone = 30
      milestoneReward = 200
    } else {
      nextMilestone = 7
      milestoneReward = 50
    }

    return NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastLoginDate: streak.lastLoginDate,
      nextMilestone,
      milestoneReward,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Streak error:', error)
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 })
  }
}
