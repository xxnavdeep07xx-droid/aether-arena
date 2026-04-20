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

    const existing = await db.affiliateLink.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    // Convert price from rupees to paise if provided as number
    if (body.price !== undefined && typeof body.price === 'number' && !Number.isInteger(body.price)) {
      body.price = Math.round(body.price * 100)
    }
    if (body.originalPrice !== undefined && typeof body.originalPrice === 'number' && !Number.isInteger(body.originalPrice)) {
      body.originalPrice = Math.round(body.originalPrice * 100)
    }

    const affiliate = await db.affiliateLink.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ affiliate })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Error updating affiliate:', error)
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

    const existing = await db.affiliateLink.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    await db.affiliateLink.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Error deleting affiliate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
