import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const [
      totalUsers,
      activeTournaments,
      pendingVerifications,
      totalRevenue,
      recentRegistrations,
    ] = await Promise.all([
      db.profile.count(),
      db.tournament.count({
        where: { status: { in: ['upcoming', 'registration_open', 'ongoing', 'live'] } },
      }),
      db.tournamentRegistration.count({
        where: { paymentStatus: 'pending' },
      }),
      // Total revenue from verified registrations
      db.tournamentRegistration.aggregate({
        where: { paymentStatus: 'verified' },
        _sum: { paidAmount: true },
      }),
      // Recent registrations (last 7 days)
      db.tournamentRegistration.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    const revenue = totalRevenue._sum.paidAmount || 0

    return NextResponse.json({
      totalUsers,
      activeTournaments,
      pendingVerifications,
      totalRevenue: revenue,
      totalRevenueDisplay: (revenue / 100).toFixed(2),
      recentRegistrations,
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
