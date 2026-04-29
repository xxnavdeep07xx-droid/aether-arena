import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

// Helper: get today's date in IST (midnight IST)
function getTodayIST(): Date {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const ist = new Date(utc + istOffset)
  ist.setHours(0, 0, 0, 0)
  return ist
}

// Helper: check if two dates are the same calendar day in IST
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request)
    const today = getTodayIST()

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

    // Check if the user has already checked in today
    const alreadyCheckedIn = streak.lastLoginDate
      ? isSameDay(streak.lastLoginDate, today)
      : false

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
      alreadyCheckedIn,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Streak error:', error)
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 })
  }
}
