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

    const existing = await db.game.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    const game = await db.game.update({
      where: { id },
      data: body,
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
