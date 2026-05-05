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
    const [
      playerCount,
      tournamentCount,
      totalPrizeWon,
      gameCount,
      activeTournaments,
      liveStreams,
    ] = await Promise.all([
      db.profile.count({ where: { isBanned: false } }),
      db.tournament.count(),
      db.profile.aggregate({ _sum: { totalPrizeWon: true } }),
      db.game.count({ where: { isActive: true } }),
      db.tournament.count({ where: { status: { in: ['registration_open', 'in_progress', 'live'] } } }),
      db.streamSchedule.count({ where: { status: 'live' } }),
    ])

    return NextResponse.json({
      players: playerCount,
      tournaments: tournamentCount,
      prizesWon: totalPrizeWon._sum.totalPrizeWon || 0,
      games: gameCount,
      activeTournaments,
      liveStreams,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
