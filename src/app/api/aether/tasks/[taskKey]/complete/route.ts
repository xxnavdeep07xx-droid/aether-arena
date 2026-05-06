import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'
import { apiLimiter } from '@/lib/rate-limit'
import { Prisma } from '@prisma/client'

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

    // Execute atomic transaction — completion check INSIDE to prevent double-reward
    const result = await db.$transaction(async (tx) => {
      // ── Check if already completed (INSIDE transaction to prevent race condition) ──
      if (task.resetType === 'daily') {
        const todayProgress = await tx.aetherTaskProgress.findUnique({
          where: {
            userId_taskKey_resetDate: {
              userId,
              taskKey,
              resetDate: todayIST,
            },
          },
        })

        if (todayProgress && todayProgress.completed) {
          throw new Error('TASK_ALREADY_COMPLETED_TODAY')
        }
      } else {
        const existingProgress = await tx.aetherTaskProgress.findFirst({
          where: { userId, taskKey, completed: true },
        })

        if (existingProgress) {
          throw new Error('TASK_ALREADY_COMPLETED')
        }
      }

      // ── Ensure balance record exists ──
      await tx.aetherBalance.upsert({
        where: { userId },
        create: { userId, balance: 0, totalEarned: 0, totalRedeemed: 0 },
        update: {},
      })

      // ── Atomic balance increment — prevents race conditions ──
      await tx.aetherBalance.update({
        where: { userId },
        data: {
          balance: { increment: task.rewardAmount },
          totalEarned: { increment: task.rewardAmount },
        },
      })

      // Read updated balance for transaction record
      const updatedBalance = await tx.aetherBalance.findUnique({ where: { userId } })
      const newBalance = updatedBalance!.balance

      // ── Create transaction record ──
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

      // ── Create or update task progress ──
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
        // For one_time tasks, no resetDate — use upsert with unique constraint catch
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
    // Handle task-already-completed errors (thrown from inside transaction)
    if (error instanceof Error && error.message === 'TASK_ALREADY_COMPLETED_TODAY') {
      return NextResponse.json({ error: 'Task already completed today' }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'TASK_ALREADY_COMPLETED') {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 })
    }
    // Handle unique constraint violation as extra safety net
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 })
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Task complete error:', error)
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 })
  }
}
