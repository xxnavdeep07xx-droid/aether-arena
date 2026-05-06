import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiLimiter } from '@/lib/rate-limit'

export async function GET(request: Request) {
  // Rate limiting for public endpoint
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { success: rateLimitOk } = await apiLimiter(`public:${clientIp}`)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

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

    return NextResponse.json({ streams }, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
