import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    // ===== OVERVIEW STATS =====
    const [
      totalPlayers,
      activeTournaments,
      completedTournaments,
      totalRegistrations,
      totalRevenue,
      pendingPayments,
      verifiedPayments,
      totalStreams,
      liveStreams,
      totalGames,
      totalAffiliateClicks,
      todayRegistrations,
      weekRegistrations,
      monthRegistrations,
    ] = await Promise.all([
      db.profile.count(),
      db.tournament.count({ where: { status: { in: ['registration_open', 'ongoing', 'live'] } } }),
      db.tournament.count({ where: { status: 'completed' } }),
      db.tournamentRegistration.count(),
      db.tournamentRegistration.aggregate({ _sum: { paidAmount: true } }),
      db.tournamentRegistration.count({ where: { paymentStatus: 'pending' } }),
      db.tournamentRegistration.count({ where: { paymentStatus: 'verified' } }),
      db.streamSchedule.count(),
      db.streamSchedule.count({ where: { status: 'live' } }),
      db.game.count({ where: { isActive: true } }),
      db.affiliateLink.aggregate({ _sum: { clicks: true } }),
      db.tournamentRegistration.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      db.tournamentRegistration.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      db.tournamentRegistration.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    ]);

    // ===== REVENUE OVER TIME (Last 12 months — single GROUP BY query) =====
    // Replaces 12 sequential month queries with one aggregated query
    const revenueByMonthRaw = await db.$queryRaw<Array<{
      month: Date
      total_revenue: bigint
      total_registrations: bigint
    }>>`
      SELECT
        DATE_TRUNC('month', "createdAt") AS month,
        COALESCE(SUM("paidAmount"), 0) AS total_revenue,
        COUNT(*) AS total_registrations
      FROM "TournamentRegistration"
      WHERE "paymentStatus" = 'verified'
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `

    // Build 12-month array filling in gaps with zeros
    const revenueByMonth: { month: string; revenue: number; registrations: number }[] = []
    const revenueMap = new Map<string, { revenue: number; registrations: number }>()
    for (const row of revenueByMonthRaw) {
      const key = new Date(row.month).toISOString().slice(0, 7) // YYYY-MM
      revenueMap.set(key, {
        revenue: Number(row.total_revenue),
        registrations: Number(row.total_registrations),
      })
    }

    for (let i = 11; i >= 0; i--) {
      const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      const monthName = d.toLocaleString('en-IN', { month: 'short' })
      const data = revenueMap.get(key)
      revenueByMonth.push({
        month: monthName,
        revenue: data?.revenue ?? 0,
        registrations: data?.registrations ?? 0,
      })
    }

    // ===== TOURNAMENTS BY STATUS =====
    const tournamentsByStatus = await db.tournament.groupBy({
      by: ['status'],
      _count: true,
    });

    // ===== REGISTRATIONS BY GAME (using aggregation — avoids fetching all records) =====
    const registrationsByGameRaw = await db.tournamentRegistration.groupBy({
      by: ['tournamentId'],
      _count: true,
      where: { paymentStatus: 'verified' },
    });

    // Map tournamentId → game name, then aggregate by game
    const tournamentIds = registrationsByGameRaw.map(r => r.tournamentId);
    const tournamentGames = await db.tournament.findMany({
      where: { id: { in: tournamentIds } },
      select: { id: true, game: { select: { name: true } } },
    });
    const tournamentGameMap = new Map(tournamentGames.map(t => [t.id, t.game?.name || 'Unknown']));

    const gameRegCounts: Record<string, number> = {};
    for (const reg of registrationsByGameRaw) {
      const gameName = tournamentGameMap.get(reg.tournamentId) || 'Unknown';
      gameRegCounts[gameName] = (gameRegCounts[gameName] || 0) + reg._count;
    }

    // ===== TOP PLAYERS =====
    const topPlayers = await db.leaderboard.findMany({
      take: 10,
      orderBy: { totalPoints: 'desc' },
      where: { period: 'all_time' },
      select: {
        totalPoints: true,
        totalWins: true,
        totalMatches: true,
        kdRatio: true,
        player: { select: { username: true, displayName: true, avatarUrl: true, league: true } },
      },
    });

    // ===== RECENT ACTIVITY =====
    const recentRegistrations = await db.tournamentRegistration.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        paymentStatus: true,
        paidAmount: true,
        createdAt: true,
        player: { select: { username: true, displayName: true } },
        tournament: { select: { title: true, game: { select: { name: true } } } },
      },
    });

    // ===== LEAGUE DISTRIBUTION =====
    const leagueDistribution = await db.profile.groupBy({
      by: ['league'],
      _count: true,
    });

    // ===== STREAM STATS =====
    const streamStats = await db.streamSchedule.aggregate({
      _sum: { peakViewers: true, avgViewers: true },
    });

    return NextResponse.json({
      overview: {
        totalPlayers,
        activeTournaments,
        completedTournaments,
        totalRegistrations,
        totalRevenue: totalRevenue._sum.paidAmount || 0,
        pendingPayments,
        verifiedPayments,
        totalStreams,
        liveStreams,
        totalGames,
        totalAffiliateClicks: totalAffiliateClicks._sum.clicks || 0,
        todayRegistrations,
        weekRegistrations,
        monthRegistrations,
        avgRegistrationValue: verifiedPayments > 0 ? Math.round((totalRevenue._sum.paidAmount || 0) / verifiedPayments) : 0,
      },
      revenueByMonth,
      tournamentsByStatus: tournamentsByStatus.map(s => ({ status: s.status, count: s._count })),
      registrationsByGame: Object.entries(gameRegCounts).map(([name, count]) => ({ game: name, registrations: count })).sort((a, b) => b.registrations - a.registrations),
      topPlayers,
      recentActivity: recentRegistrations,
      leagueDistribution: leagueDistribution.map(l => ({ league: l.league, count: l._count })),
      streamStats: {
        totalPeakViewers: streamStats._sum.peakViewers || 0,
        totalAvgViewers: streamStats._sum.avgViewers || 0,
      },
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string };
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
