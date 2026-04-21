import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const streams = await db.streamSchedule.findMany({
      where: {
        isFeatured: true,
        status: { in: ['live', 'scheduled'] },
      },
      include: {
        tournament: {
          select: {
            id: true,
            title: true,
            game: {
              select: {
                name: true,
                slug: true,
                iconUrl: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        // Live streams first
        { status: 'asc' },
        { scheduledStart: 'asc' },
      ],
    })

    return NextResponse.json({ streams })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
