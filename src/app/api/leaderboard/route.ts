import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const period = searchParams.get('period') || 'all_time'

    const where: Record<string, unknown> = { period }
    if (gameId) {
      where.gameId = gameId
    }

    const leaderboard = await db.leaderboard.findMany({
      where,
      include: {
        player: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            league: true,
            leaguePoints: true,
          },
        },
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
          },
        },
      },
      orderBy: [{ totalPoints: 'desc' }, { winRate: 'desc' }],
      take: 100,
    })

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
