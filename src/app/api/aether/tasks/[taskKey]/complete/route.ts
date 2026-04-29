import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'
import { apiLimiter } from '@/lib/rate-limit'

// Helper: get today's date in IST (just the date part, no time)
function getTodayISTDate(): Date {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const ist = new Date(utc + istOffset)
  ist.setHours(0, 0, 0, 0)
  return ist
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskKey: string }> }
) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await apiLimiter(`task:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { userId } = await requireAuth(request)
    const { taskKey } = await params

    // Verify task exists and is active
    const task = await db.aetherTask.findUnique({
      where: { taskKey },
    })

    if (!task || !task.isActive) {
      return NextResponse.json({ error: 'Task not found or inactive' }, { status: 404 })
    }

    const todayIST = getTodayISTDate()

    // Check if already completed
    if (task.resetType === 'daily') {
      // For daily tasks, check if there's a completed record for today
      const todayProgress = await db.aetherTaskProgress.findUnique({
        where: {
          userId_taskKey_resetDate: {
            userId,
            taskKey,
            resetDate: todayIST,
          },
        },
      })

      if (todayProgress && todayProgress.completed) {
        return NextResponse.json({ error: 'Task already completed today' }, { status: 400 })
      }
    } else {
      // For one_time tasks, check if already completed
      const existingProgress = await db.aetherTaskProgress.findFirst({
        where: {
          userId,
          taskKey,
          completed: true,
        },
      })

      if (existingProgress) {
        return NextResponse.json({ error: 'Task already completed' }, { status: 400 })
      }
    }

    // Execute atomic transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Upsert AetherBalance
      const balance = await tx.aetherBalance.upsert({
        where: { userId },
        create: { userId, balance: 0, totalEarned: 0, totalRedeemed: 0 },
        update: {},
      })

      const newBalance = balance.balance + task.rewardAmount

      // 2. Update balance
      await tx.aetherBalance.update({
        where: { userId },
        data: {
          balance: newBalance,
          totalEarned: { increment: task.rewardAmount },
        },
      })

      // 3. Create transaction record
      const transaction = await tx.aetherTransaction.create({
        data: {
          userId,
          type: 'earned',
          source: task.taskKey,
          description: `Completed: ${task.title}`,
          amount: task.rewardAmount,
          balanceAfter: newBalance,
        },
        select: {
          description: true,
          amount: true,
        },
      })

      // 4. Create or update task progress
      if (task.resetType === 'daily') {
        await tx.aetherTaskProgress.upsert({
          where: {
            userId_taskKey_resetDate: {
              userId,
              taskKey,
              resetDate: todayIST,
            },
          },
          create: {
            userId,
            taskKey,
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
      } else {
        // For one_time tasks, no resetDate
        const existingProgress = await tx.aetherTaskProgress.findFirst({
          where: { userId, taskKey },
        })

        if (existingProgress) {
          await tx.aetherTaskProgress.update({
            where: { id: existingProgress.id },
            data: {
              completed: true,
              completedAt: new Date(),
              timesCompleted: { increment: 1 },
            },
          })
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

      return { newBalance, transaction }
    })

    return NextResponse.json({
      success: true,
      balance: result.newBalance,
      amount: task.rewardAmount,
      transaction: result.transaction,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Task complete error:', error)
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 })
  }
}
