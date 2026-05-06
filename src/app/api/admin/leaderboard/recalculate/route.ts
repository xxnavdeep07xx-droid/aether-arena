import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { getLeagueForPoints } from '@/lib/utils'

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

    // --- Recalculate LP for all players based on leaderboard entries ---
    // Aggregate from all_time entries to avoid double-counting across periods
    const allTimeEntries = await db.leaderboard.findMany({
      where: { period: 'all_time' },
      select: {
        playerId: true,
        totalWins: true,
        totalMatches: true,
        totalKills: true,
        totalDeaths: true,
      },
    })

    // Aggregate per player across all games
    const playerStatsMap = new Map<string, { totalWins: number; totalMatches: number; totalKills: number; totalDeaths: number }>()
    for (const entry of allTimeEntries) {
      const existing = playerStatsMap.get(entry.playerId) || { totalWins: 0, totalMatches: 0, totalKills: 0, totalDeaths: 0 }
      existing.totalWins += entry.totalWins
      existing.totalMatches += entry.totalMatches
      existing.totalKills += entry.totalKills
      existing.totalDeaths += entry.totalDeaths
      playerStatsMap.set(entry.playerId, existing)
    }

    // Calculate and update LP for each player
    for (const [playerId, stats] of playerStatsMap) {
      const kdRatio = stats.totalDeaths > 0 ? stats.totalKills / stats.totalDeaths : stats.totalKills > 0 ? 99.99 : 0

      // LP formula: totalWins * 30 + (totalMatches - totalWins) * 5 + K/D bonus
      const kdBonus = kdRatio >= 5 ? 50 : kdRatio >= 3 ? 25 : kdRatio >= 2 ? 10 : 0
      const calculatedLP = stats.totalWins * 30 + (stats.totalMatches - stats.totalWins) * 5 + kdBonus

      const newLeague = getLeagueForPoints(calculatedLP)

      await db.profile.update({
        where: { id: playerId },
        data: {
          leaguePoints: calculatedLP,
          league: newLeague,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Leaderboard recalculated successfully' })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
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
