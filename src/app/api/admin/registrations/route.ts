import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const tournamentId = searchParams.get('tournamentId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Prisma.TournamentRegistrationWhereInput = {}
    if (status) where.paymentStatus = status
    if (tournamentId) where.tournamentId = tournamentId

    const [registrations, total] = await Promise.all([
      db.tournamentRegistration.findMany({
        where,
        include: {
          player: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          tournament: {
            select: {
              id: true,
              title: true,
              game: {
                select: { name: true, slug: true, iconUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.tournamentRegistration.count({ where }),
    ])

    const formatted = registrations.map((reg) => ({
      ...reg,
      paidAmountDisplay: (reg.paidAmount / 100).toFixed(2),
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
    console.error('Admin registrations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
