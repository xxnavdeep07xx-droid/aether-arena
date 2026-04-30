import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)
    const skip = (page - 1) * limit

    const [registrations, total] = await Promise.all([
      db.tournamentRegistration.findMany({
        where: { playerId: auth.userId },
        include: {
          tournament: {
            include: {
              game: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  iconUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.tournamentRegistration.count({
        where: { playerId: auth.userId },
      }),
    ])

    const formatted = registrations.map((reg) => ({
      ...reg,
      paidAmountDisplay: (reg.paidAmount / 100).toFixed(2),
      tournament: {
        ...reg.tournament,
        entryFeeDisplay: (reg.tournament.entryFee / 100).toFixed(2),
        prizePoolDisplay: (reg.tournament.prizePool / 100).toFixed(2),
      },
    }))

    return NextResponse.json({
      registrations: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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
