import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const streams = await db.streamSchedule.findMany({
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
    })

    return NextResponse.json({ streams })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Admin streams error:', error)
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
    console.error('Admin create stream error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
