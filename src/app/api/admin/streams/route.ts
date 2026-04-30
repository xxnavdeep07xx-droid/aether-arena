import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)
    const skip = (page - 1) * limit

    const [streams, total] = await Promise.all([
      db.streamSchedule.findMany({
        orderBy: { scheduledStart: 'desc' },
        include: {
          tournament: {
            select: {
              id: true,
              title: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      db.streamSchedule.count(),
    ])

    return NextResponse.json({
      streams,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request)
    const body = await request.json()

    const {
      title,
      description,
      tournamentId,
      scheduledStart,
      scheduledEnd,
      platform,
      streamUrl,
      thumbnailUrl,
      status,
      isFeatured,
    } = body

    if (!title || !scheduledStart) {
      return NextResponse.json(
        { error: 'Title and scheduledStart are required' },
        { status: 400 }
      )
    }

    const stream = await db.streamSchedule.create({
      data: {
        title,
        description: description || '',
        tournamentId: tournamentId || null,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        platform: platform || '',
        streamUrl: streamUrl || '',
        thumbnailUrl: thumbnailUrl || '',
        status: status || 'scheduled',
        isFeatured: isFeatured || false,
        createdById: auth.userId,
      },
    })

    return NextResponse.json({ stream }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
