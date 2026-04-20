import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const gameId = searchParams.get('gameId')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)
    const skip = (page - 1) * limit

    const where: Prisma.TournamentWhereInput = {}
    if (status) where.status = status
    if (gameId) where.gameId = gameId
    if (search) where.title = { contains: search }

    const [tournaments, total] = await Promise.all([
      db.tournament.findMany({
        where,
        include: {
          game: {
            select: { id: true, name: true, slug: true, iconUrl: true },
          },
          _count: { select: { registrations: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.tournament.count({ where }),
    ])

    const formatted = tournaments.map((t) => ({
      ...t,
      entryFeeDisplay: (t.entryFee / 100).toFixed(2),
      prizePoolDisplay: (t.prizePool / 100).toFixed(2),
      registrationCount: t._count.registrations,
      _count: undefined,
    }))

    return NextResponse.json({
      tournaments: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Admin tournaments list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request)
    const body = await request.json()

    const {
      title,
      description,
      gameId,
      coverImageUrl,
      format,
      entryFee,
      prizePool,
      maxPlayers,
      status,
      matchMode,
      map,
      roomId,
      roomPassword,
      customRules,
      registrationStart,
      registrationEnd,
      startTime,
      endTime,
      isFeatured,
      streamScheduled,
      streamPlatform,
      streamUrl,
      streamStartTime,
    } = body

    if (!title || !gameId || !maxPlayers) {
      return NextResponse.json(
        { error: 'Title, gameId, and maxPlayers are required' },
        { status: 400 }
      )
    }

    const tournament = await db.tournament.create({
      data: {
        title,
        description: description || '',
        gameId,
        coverImageUrl: coverImageUrl || '',
        format: format || 'solo',
        entryFee: entryFee ? Math.round(Number(entryFee)) : 0,
        prizePool: prizePool ? Math.round(Number(prizePool)) : 0,
        maxPlayers,
        status: status || 'upcoming',
        matchMode: matchMode || '',
        map: map || '',
        roomId,
        roomPassword,
        customRules: customRules || '',
        registrationStart: registrationStart ? new Date(registrationStart) : new Date(),
        registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        isFeatured: isFeatured || false,
        streamScheduled: streamScheduled || false,
        streamPlatform: streamPlatform || '',
        streamUrl: streamUrl || '',
        streamStartTime: streamStartTime ? new Date(streamStartTime) : null,
        createdById: auth.userId,
      },
      include: {
        game: {
          select: { id: true, name: true, slug: true, iconUrl: true },
        },
      },
    })

    return NextResponse.json(
      {
        tournament: {
          ...tournament,
          entryFeeDisplay: (tournament.entryFee / 100).toFixed(2),
          prizePoolDisplay: (tournament.prizePool / 100).toFixed(2),
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Admin create tournament error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
