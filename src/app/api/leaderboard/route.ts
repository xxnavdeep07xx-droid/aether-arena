import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const period = searchParams.get('period') || 'all_time'
    const search = searchParams.get('search')

    // When "All Games" is selected (no gameId), aggregate player stats across all games
    if (!gameId) {
      const where: Prisma.LeaderboardWhereInput = { period }

      // Server-side search filter using Prisma include with filter
      const playerFilterWhere = search
        ? {
            OR: [
              { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { displayName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : undefined;

      const entries = await db.leaderboard.findMany({
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
              privacyPrefs: true,
            },
            ...(playerFilterWhere ? { where: playerFilterWhere } : {}),
          },
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [{ totalPoints: 'desc' }],
        take: 500,
      })

      // Aggregate per player
      const playerMap = new Map<string, {
        playerId: string;
        player: any;
        totalPoints: number;
        totalWins: number;
        totalMatches: number;
        totalKills: number;
        totalDeaths: number;
        games: string[];
        gameNames: string[];
      }>()

      for (const entry of entries) {
        const pid = entry.playerId
        // Privacy: skip users who opted out of leaderboard
        const pp = entry.player.privacyPrefs as Record<string, unknown> | null
        if (pp && pp.showLeaderboard === false) continue
        const existing = playerMap.get(pid)
        if (existing) {
          existing.totalPoints += entry.totalPoints || 0
          existing.totalWins += entry.totalWins || 0
          existing.totalMatches += entry.totalMatches || 0
          existing.totalKills += entry.totalKills || 0
          existing.totalDeaths += entry.totalDeaths || 0
          if (entry.game && !existing.games.includes(entry.game.id)) {
            existing.games.push(entry.game.id)
            existing.gameNames.push(entry.game.name)
          }
        } else {
          playerMap.set(pid, {
            playerId: pid,
            player: entry.player,
            totalPoints: entry.totalPoints || 0,
            totalWins: entry.totalWins || 0,
            totalMatches: entry.totalMatches || 0,
            totalKills: entry.totalKills || 0,
            totalDeaths: entry.totalDeaths || 0,
            games: entry.game ? [entry.game.id] : [],
            gameNames: entry.game ? [entry.game.name] : [],
          })
        }
      }

      let aggregated = Array.from(playerMap.values())

      // Sort by points desc
      aggregated.sort((a, b) => b.totalPoints - a.totalPoints)

      // Compute derived stats
      const leaderboard = aggregated.slice(0, 100).map((e, idx) => ({
        id: `${e.playerId}-${idx}`,
        playerId: e.playerId,
        rank: idx + 1,
        player: { ...e.player, privacyPrefs: undefined },
        game: null,
        totalPoints: e.totalPoints,
        totalWins: e.totalWins,
        totalMatches: e.totalMatches,
        totalKills: e.totalKills,
        totalDeaths: e.totalDeaths,
        kdRatio: e.totalDeaths > 0 ? e.totalKills / e.totalDeaths : e.totalKills > 0 ? e.totalKills : 0,
        winRate: e.totalMatches > 0 ? (e.totalWins / e.totalMatches) * 100 : 0,
        period,
        gamesPlayed: e.gameNames,
      }))

      return NextResponse.json({ leaderboard })
    }

    // Specific game filter
    const where: Record<string, unknown> = { period, gameId }

    // Server-side search filter via player relation
    const playerFilterWhere = search
      ? {
          OR: [
            { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { displayName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

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
            privacyPrefs: true,
          },
          ...(playerFilterWhere ? { where: playerFilterWhere } : {}),
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

    // Filter out users who opted out of leaderboard (privacy)
    const filteredLeaderboard = leaderboard.filter(entry => {
      const pp = entry.player.privacyPrefs as Record<string, unknown> | null
      return !(pp && pp.showLeaderboard === false)
    }).map(entry => ({
      ...entry,
      player: { ...entry.player, privacyPrefs: undefined },
    }))

    return NextResponse.json({ leaderboard: filteredLeaderboard })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
