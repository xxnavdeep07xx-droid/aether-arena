import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const { gameId, period } = body as { gameId?: string; period?: string }

    // If gameId is specified, recalculate for that game only
    if (gameId) {
      const periods = period ? [period] : ['weekly', 'monthly', 'all_time']
      const game = await db.game.findUnique({ where: { id: gameId } })
      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 })
      }

      for (const p of periods) {
        // Get date range for period
        const startDate = getStartDate(p)

        // Aggregate match participant data
        const aggregated = await db.matchParticipant.groupBy({
          by: ['playerId'],
          where: {
            match: {
              tournament: { gameId },
              ...(startDate ? { actualStart: { gte: startDate } } : {}),
            },
          },
          _sum: {
            kills: true,
            deaths: true,
            score: true,
            prizeWon: true,
          },
          _count: { playerId: true },
        })

        // Calculate wins (placement === 1)
        const wins = await db.matchParticipant.groupBy({
          by: ['playerId'],
          where: {
            match: {
              tournament: { gameId },
              ...(startDate ? { actualStart: { gte: startDate } } : {}),
            },
            placement: 1,
          },
          _count: { playerId: true },
        })

        const winsMap = new Map(wins.map((w) => [w.playerId, w._count.playerId]))

        // Upsert leaderboard entries
        for (const entry of aggregated) {
          const totalKills = entry._sum.kills || 0
          const totalDeaths = entry._sum.deaths || 0
          const totalMatches = entry._count.playerId
          const totalWins = winsMap.get(entry.playerId) || 0
          const totalPoints = entry._sum.score || 0

          await db.leaderboard.upsert({
            where: {
              playerId_gameId_period: {
                playerId: entry.playerId,
                gameId,
                period: p,
              },
            },
            update: {
              totalPoints,
              totalWins,
              totalMatches,
              totalKills,
              totalDeaths,
              kdRatio: totalDeaths > 0 ? totalKills / totalDeaths : totalKills > 0 ? 99.99 : 0,
              winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
            },
            create: {
              playerId: entry.playerId,
              gameId,
              period: p,
              totalPoints,
              totalWins,
              totalMatches,
              totalKills,
              totalDeaths,
              kdRatio: totalDeaths > 0 ? totalKills / totalDeaths : totalKills > 0 ? 99.99 : 0,
              winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
            },
          })
        }
      }
    } else {
      // Recalculate for all games
      const games = await db.game.findMany({ select: { id: true } })
      const periods = period ? [period] : ['weekly', 'monthly', 'all_time']

      for (const game of games) {
        for (const p of periods) {
          const startDate = getStartDate(p)

          const aggregated = await db.matchParticipant.groupBy({
            by: ['playerId'],
            where: {
              match: {
                tournament: { gameId: game.id },
                ...(startDate ? { actualStart: { gte: startDate } } : {}),
              },
            },
            _sum: { kills: true, deaths: true, score: true, prizeWon: true },
            _count: { playerId: true },
          })

          const wins = await db.matchParticipant.groupBy({
            by: ['playerId'],
            where: {
              match: {
                tournament: { gameId: game.id },
                ...(startDate ? { actualStart: { gte: startDate } } : {}),
              },
              placement: 1,
            },
            _count: { playerId: true },
          })

          const winsMap = new Map(wins.map((w) => [w.playerId, w._count.playerId]))

          for (const entry of aggregated) {
            const totalKills = entry._sum.kills || 0
            const totalDeaths = entry._sum.deaths || 0
            const totalMatches = entry._count.playerId
            const totalWins = winsMap.get(entry.playerId) || 0
            const totalPoints = entry._sum.score || 0

            await db.leaderboard.upsert({
              where: {
                playerId_gameId_period: {
                  playerId: entry.playerId,
                  gameId: game.id,
                  period: p,
                },
              },
              update: {
                totalPoints,
                totalWins,
                totalMatches,
                totalKills,
                totalDeaths,
                kdRatio: totalDeaths > 0 ? totalKills / totalDeaths : totalKills > 0 ? 99.99 : 0,
                winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
              },
              create: {
                playerId: entry.playerId,
                gameId: game.id,
                period: p,
                totalPoints,
                totalWins,
                totalMatches,
                totalKills,
                totalDeaths,
                kdRatio: totalDeaths > 0 ? totalKills / totalDeaths : totalKills > 0 ? 99.99 : 0,
                winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
              },
            })
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Leaderboard recalculated successfully' })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Admin recalculate leaderboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getStartDate(period: string): Date | null {
  const now = new Date()
  switch (period) {
    case 'weekly':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'all_time':
      return null
    default:
      return null
  }
}
