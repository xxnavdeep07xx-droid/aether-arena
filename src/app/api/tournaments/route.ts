import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

let setupAttempted = false

async function ensureSetup() {
  if (setupAttempted) return
  setupAttempted = true
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/setup`)
  } catch { /* ignore */ }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const game = searchParams.get('game')
    const status = searchParams.get('status')
    const format = searchParams.get('format')
    const fee = searchParams.get('fee')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '12', 10)), 100)
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.TournamentWhereInput = {}

    if (game) {
      where.game = { slug: game }
    }

    if (status) {
      where.status = status
    }

    if (format) {
      where.format = format
    }

    if (fee === 'free') {
      where.entryFee = 0
    } else if (fee === 'paid') {
      where.entryFee = { gt: 0 }
    }

    if (search) {
      where.title = { contains: search }
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    // Fetch tournaments
    const [tournaments, total] = await Promise.all([
      db.tournament.findMany({
        where,
        include: {
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              iconUrl: true,
              bannerUrl: true,
              maxTeamSize: true,
            },
          },
          _count: {
            select: { registrations: true },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      db.tournament.count({ where }),
    ])

    // Check if current user is registered for each tournament
    let registeredTournaments: Set<string> = new Set()
    const session = await getSessionFromRequest(request)
    if (session) {
      const myRegs = await db.tournamentRegistration.findMany({
        where: {
          playerId: session.userId,
          tournamentId: { in: tournaments.map((t) => t.id) },
        },
        select: { tournamentId: true },
      })
      registeredTournaments = new Set(myRegs.map((r) => r.tournamentId))
    }

    const formattedTournaments = tournaments.map((t) => ({
      ...t,
      entryFeeDisplay: (t.entryFee / 100).toFixed(2),
      prizePoolDisplay: (t.prizePool / 100).toFixed(2),
      registrationCount: t._count.registrations,
      isRegistered: registeredTournaments.has(t.id),
      _count: undefined,
    }))

    return NextResponse.json({
      tournaments: formattedTournaments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    const msg = error?.message || ''
    if (msg.includes('does not exist') && !setupAttempted) {
      await ensureSetup()
      // Return empty on first attempt — client will refetch
      return NextResponse.json({ tournaments: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper to get session from request
async function getSessionFromRequest(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie')
    if (!cookieHeader) return null
    const match = cookieHeader.match(/aether_session=([^;]+)/)
    if (!match) return null
    const session = await db.session.findUnique({
      where: { token: match[1] },
      select: { userId: true, expiresAt: true },
    })
    if (!session || session.expiresAt < new Date()) return null
    return session
  } catch {
    return null
  }
}
