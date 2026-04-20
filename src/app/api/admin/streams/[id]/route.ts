import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

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

    // Convert date strings to Date objects
    if (body.scheduledStart) body.scheduledStart = new Date(body.scheduledStart)
    if (body.scheduledEnd) body.scheduledEnd = new Date(body.scheduledEnd)

    const stream = await db.streamSchedule.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ stream })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Error updating stream:', error)
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
    console.error('Error deleting stream:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
