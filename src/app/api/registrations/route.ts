import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)

    const registrations = await db.tournamentRegistration.findMany({
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
    })

    const formatted = registrations.map((reg) => ({
      ...reg,
      paidAmountDisplay: (reg.paidAmount / 100).toFixed(2),
      tournament: {
        ...reg.tournament,
        entryFeeDisplay: (reg.tournament.entryFee / 100).toFixed(2),
        prizePoolDisplay: (reg.tournament.prizePool / 100).toFixed(2),
      },
    }))

    return NextResponse.json({ registrations: formatted })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Get registrations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
