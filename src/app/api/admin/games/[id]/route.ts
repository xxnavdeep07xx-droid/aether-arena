import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

const ALLOWED_UPDATE_FIELDS = ['name', 'slug', 'iconUrl', 'bannerUrl', 'maxTeamSize', 'description', 'isActive', 'sortOrder'] as const

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()

    const existing = await db.game.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Only allow whitelisted fields — prevents mass assignment
    const updateData: Record<string, unknown> = {}
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const game = await db.game.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ game })
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

    const existing = await db.game.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Prevent deletion if tournaments reference this game
    const tournamentCount = await db.tournament.count({ where: { gameId: id } })
    if (tournamentCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete game: ${tournamentCount} tournament(s) reference it. Deactivate the game instead.` },
        { status: 409 }
      )
    }

    await db.game.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
