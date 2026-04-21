import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
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
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
