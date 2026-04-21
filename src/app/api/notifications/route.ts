import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)
    const skip = (page - 1) * limit

    const [notifications, unreadCount, total] = await Promise.all([
      db.notification.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({
        where: { userId: auth.userId, isRead: false },
      }),
      db.notification.count({
        where: { userId: auth.userId },
      }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
