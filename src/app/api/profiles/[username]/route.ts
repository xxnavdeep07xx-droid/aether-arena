import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    const profile = await db.profile.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        league: true,
        leaguePoints: true,
        totalTournamentsPlayed: true,
        totalWins: true,
        totalKills: true,
        totalDeaths: true,
        totalPrizeWon: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Calculate derived stats
    const kdRatio = profile.totalDeaths > 0
      ? (profile.totalKills / profile.totalDeaths).toFixed(2)
      : profile.totalKills > 0
        ? '∞'
        : '0'

    const winRate = profile.totalTournamentsPlayed > 0
      ? ((profile.totalWins / profile.totalTournamentsPlayed) * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      ...profile,
      kdRatio,
      winRate,
      totalPrizeWonDisplay: (profile.totalPrizeWon / 100).toFixed(2),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
