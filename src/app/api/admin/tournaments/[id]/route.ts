import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const tournament = await db.tournament.findUnique({
      where: { id },
      include: {
        game: {
          select: { id: true, name: true, slug: true, iconUrl: true },
        },
        registrations: {
          include: {
            player: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...tournament,
      entryFeeDisplay: (tournament.entryFee / 100).toFixed(2),
      prizePoolDisplay: (tournament.prizePool / 100).toFixed(2),
      registrationCount: tournament.registrations.length,
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const body = await request.json()

    const existing = await db.tournament.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

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

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (gameId !== undefined) updateData.gameId = gameId
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl
    if (format !== undefined) updateData.format = format
    if (entryFee !== undefined) updateData.entryFee = Math.round(entryFee * 100)
    if (prizePool !== undefined) updateData.prizePool = Math.round(prizePool * 100)
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers
    if (status !== undefined) updateData.status = status
    if (matchMode !== undefined) updateData.matchMode = matchMode
    if (map !== undefined) updateData.map = map
    if (roomId !== undefined) updateData.roomId = roomId
    if (roomPassword !== undefined) updateData.roomPassword = roomPassword
    if (customRules !== undefined) updateData.customRules = customRules
    if (registrationStart !== undefined)
      updateData.registrationStart = new Date(registrationStart)
    if (registrationEnd !== undefined)
      updateData.registrationEnd = registrationEnd ? new Date(registrationEnd) : null
    if (startTime !== undefined)
      updateData.startTime = startTime ? new Date(startTime) : null
    if (endTime !== undefined)
      updateData.endTime = endTime ? new Date(endTime) : null
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (streamScheduled !== undefined) updateData.streamScheduled = streamScheduled
    if (streamPlatform !== undefined) updateData.streamPlatform = streamPlatform
    if (streamUrl !== undefined) updateData.streamUrl = streamUrl
    if (streamStartTime !== undefined)
      updateData.streamStartTime = streamStartTime ? new Date(streamStartTime) : null

    const tournament = await db.tournament.update({
      where: { id },
      data: updateData,
      include: {
        game: {
          select: { id: true, name: true, slug: true, iconUrl: true },
        },
      },
    })

    return NextResponse.json({
      tournament: {
        ...tournament,
        entryFeeDisplay: (tournament.entryFee / 100).toFixed(2),
        prizePoolDisplay: (tournament.prizePool / 100).toFixed(2),
      },
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const existing = await db.tournament.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    await db.tournament.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
