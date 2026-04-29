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

    const existing = await db.topupPack.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Top-up pack not found' }, { status: 404 })
    }

    const pack = await db.topupPack.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ pack })
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

    const existing = await db.topupPack.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Top-up pack not found' }, { status: 404 })
    }

    await db.topupPack.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
