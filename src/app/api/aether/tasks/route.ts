import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

// Helper: get today's date in IST
function getTodayIST(): Date {
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const ist = new Date(utc + istOffset)
  ist.setHours(0, 0, 0, 0)
  return ist
}

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request)

    const tasks = await db.aetherTask.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        taskKey: true,
        title: true,
        description: true,
        rewardAmount: true,
        category: true,
        resetType: true,
        affiliateUrl: true,
        displayOrder: true,
      },
    })

    const todayIST = getTodayIST()

    // Get all user progress for active tasks
    const allProgress = await db.aetherTaskProgress.findMany({
      where: {
        userId,
        taskKey: { in: tasks.map(t => t.taskKey) },
      },
    })

    // Build a map of progress keyed by taskKey
    type ProgressItem = typeof allProgress[number]
    const progressMap = new Map<string, ProgressItem>()
    for (const p of allProgress) {
      progressMap.set(p.taskKey, p)
    }

    // Calculate daily reset time (midnight IST tomorrow)
    const tomorrowIST = new Date(todayIST.getTime() + 24 * 60 * 60 * 1000)
    const dailyResetAt = new Date(tomorrowIST.getTime() - 5.5 * 60 * 60 * 1000).toISOString()

    const tasksWithProgress = tasks.map(task => {
      const progress = progressMap.get(task.taskKey)

      let isCompleted = false
      let completedAt: string | null = null
      let timesCompleted = 0

      if (task.resetType === 'daily') {
        // For daily tasks, check if there's progress with today's resetDate
        const todayProgress = allProgress.find(p => {
          if (p.taskKey !== task.taskKey) return false
          if (!p.resetDate) return false
          return p.resetDate.getTime() === todayIST.getTime()
        })
        if (todayProgress) {
          isCompleted = todayProgress.completed
          completedAt = todayProgress.completedAt?.toISOString() || null
          timesCompleted = todayProgress.timesCompleted
        }
      } else {
        // For one_time tasks, check if any progress exists
        if (progress) {
          isCompleted = progress.completed
          completedAt = progress.completedAt?.toISOString() || null
          timesCompleted = progress.timesCompleted
        }
      }

      return {
        taskKey: task.taskKey,
        title: task.title,
        description: task.description,
        rewardAmount: task.rewardAmount,
        category: task.category,
        resetType: task.resetType,
        affiliateUrl: task.affiliateUrl,
        isCompleted,
        completedAt,
        timesCompleted,
        displayOrder: task.displayOrder,
      }
    })

    return NextResponse.json({
      tasks: tasksWithProgress,
      dailyResetAt,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Aether tasks error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}
