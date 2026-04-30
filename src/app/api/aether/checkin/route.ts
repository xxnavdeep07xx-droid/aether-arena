import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'
import { strictLimiter } from '@/lib/rate-limit'

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

// Helper: check if `date` is yesterday relative to `today`
function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return isSameDay(date, yesterday)
}

export async function POST(request: Request) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await strictLimiter(`checkin:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many check-in attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const { userId } = await requireAuth(request)
    const today = getTodayIST()

    const result = await db.$transaction(async (tx) => {
      // Get or create streak
      const streak = await tx.userStreak.upsert({
        where: { userId },
        create: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastLoginDate: null,
        },
        update: {},
      })

      // Already checked in today
      if (streak.lastLoginDate && isSameDay(streak.lastLoginDate, today)) {
        return {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          streakBonusAwarded: null,
          dailyLoginAwarded: false,
        }
      }

      let newStreak: number
      let streakBonusAwarded: { amount: number; milestone: number } | null = null
      const prevStreak = streak.currentStreak

      if (streak.lastLoginDate && isYesterday(streak.lastLoginDate, today)) {
        // Consecutive day — increment
        newStreak = streak.currentStreak + 1
      } else if (streak.lastLoginDate && streak.lastLoginDate < today) {
        // Streak broken — reset to 1
        newStreak = 1
      } else {
        // First ever checkin
        newStreak = 1
      }

      const newLongestStreak = Math.max(streak.longestStreak, newStreak)

      // Update streak
      await tx.userStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastLoginDate: new Date(),
        },
      })

      // Ensure balance record exists
      await tx.aetherBalance.upsert({
        where: { userId },
        create: { userId, balance: 0, totalEarned: 0, totalRedeemed: 0 },
        update: {},
      })

      // Track total bonus to atomically increment at the end
      let totalBonus = 0

      // Check for milestone bonuses
      if (newStreak === 7 && prevStreak < 7) {
        totalBonus += 50
        await tx.aetherTransaction.create({
          data: {
            userId,
            type: 'streak',
            source: 'streak_7',
            description: '7-Day Login Streak Bonus!',
            amount: 50,
            balanceAfter: 0, // placeholder, updated below
          },
        })
        streakBonusAwarded = { amount: 50, milestone: 7 }

        // Auto-complete streak_7 task
        await completeOneTimeTask(tx, userId, 'streak_7', 50)
      }

      if (newStreak === 30 && prevStreak < 30) {
        totalBonus += 200
        await tx.aetherTransaction.create({
          data: {
            userId,
            type: 'streak',
            source: 'streak_30',
            description: '30-Day Login Streak Bonus!',
            amount: 200,
            balanceAfter: 0, // placeholder, updated below
          },
        })
        streakBonusAwarded = { amount: 200, milestone: 30 }

        // Auto-complete streak_30 task
        await completeOneTimeTask(tx, userId, 'streak_30', 200)
      }

      // Award daily login task if not completed today
      const todayIST = getTodayIST()
      const dailyProgress = await tx.aetherTaskProgress.findUnique({
        where: {
          userId_taskKey_resetDate: {
            userId,
            taskKey: 'daily_login',
            resetDate: todayIST,
          },
        },
      })

      let dailyLoginAwarded = false

      if (!dailyProgress || !dailyProgress.completed) {
        const dailyReward = 5
        totalBonus += dailyReward
        await tx.aetherTransaction.create({
          data: {
            userId,
            type: 'earned',
            source: 'daily_login',
            description: 'Daily Login Reward',
            amount: dailyReward,
            balanceAfter: 0, // placeholder, updated below
          },
        })

        await tx.aetherTaskProgress.upsert({
          where: {
            userId_taskKey_resetDate: {
              userId,
              taskKey: 'daily_login',
              resetDate: todayIST,
            },
          },
          create: {
            userId,
            taskKey: 'daily_login',
            completed: true,
            completedAt: new Date(),
            resetDate: todayIST,
            timesCompleted: 1,
          },
          update: {
            completed: true,
            completedAt: new Date(),
            timesCompleted: { increment: 1 },
          },
        })

        dailyLoginAwarded = true
      }

      // Atomic balance update — single increment prevents race conditions
      if (totalBonus > 0) {
        await tx.aetherBalance.update({
          where: { userId },
          data: {
            balance: { increment: totalBonus },
            totalEarned: { increment: totalBonus },
          },
        })

        // Fix balanceAfter on all transactions created in this checkin
        const updatedBalance = await tx.aetherBalance.findUnique({ where: { userId } })
        const finalBalance = updatedBalance!.balance
        await tx.aetherTransaction.updateMany({
          where: { userId, balanceAfter: 0, source: { in: ['streak_7', 'streak_30', 'daily_login'] } },
          data: { balanceAfter: finalBalance },
        })
      }

      return {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        streakBonusAwarded,
        dailyLoginAwarded,
      }
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Checkin error:', error)
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 })
  }
}

// Helper: complete a one-time task without awarding additional Aether (bonus already awarded)
async function completeOneTimeTask(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  userId: string,
  taskKey: string,
  rewardAmount: number
) {
  const existing = await tx.aetherTaskProgress.findFirst({
    where: { userId, taskKey },
  })

  if (existing) {
    if (!existing.completed) {
      await tx.aetherTaskProgress.update({
        where: { id: existing.id },
        data: {
          completed: true,
          completedAt: new Date(),
          timesCompleted: { increment: 1 },
        },
      })
    }
  } else {
    await tx.aetherTaskProgress.create({
      data: {
        userId,
        taskKey,
        completed: true,
        completedAt: new Date(),
        timesCompleted: 1,
      },
    })
  }
}
