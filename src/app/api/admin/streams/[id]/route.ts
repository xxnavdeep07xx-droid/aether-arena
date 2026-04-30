import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

const ALLOWED_UPDATE_FIELDS = [
  'title', 'description', 'tournamentId', 'scheduledStart', 'scheduledEnd',
  'platform', 'streamUrl', 'thumbnailUrl', 'status', 'isFeatured',
] as const

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()

    const existing = await db.streamSchedule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Only allow whitelisted fields — prevents mass assignment
    const updateData: Record<string, unknown> = {}
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    // Convert date strings to Date objects
    if (updateData.scheduledStart) updateData.scheduledStart = new Date(updateData.scheduledStart as string)
    if (updateData.scheduledEnd) updateData.scheduledEnd = new Date(updateData.scheduledEnd as string)
    // Handle explicit null for optional fields
    if (body.tournamentId === null) updateData.tournamentId = null

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const stream = await db.streamSchedule.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ stream })
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

    const existing = await db.streamSchedule.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    await db.streamSchedule.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
