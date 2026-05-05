import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const game = searchParams.get('game')

  try {
    const where: Record<string, unknown> = { isActive: true }
    if (game && game !== 'all') {
      where.gameSlug = game
    }

    const packs = await db.topupPack.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ packs }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (error: unknown) {
    console.error('TopupPacks GET error:', error)
    return NextResponse.json({ packs: [] })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    if (!body.gameName || !body.gameSlug || !body.packName) {
      return NextResponse.json({ error: 'gameName, gameSlug, and packName are required' }, { status: 400 })
    }

    if (body.price !== undefined && typeof body.price === 'number') {
      if (body.price < 0) {
        return NextResponse.json({ error: 'Price must be non-negative' }, { status: 400 })
      }
    }

    const pack = await db.topupPack.create({
      data: {
        gameName: body.gameName,
        gameSlug: body.gameSlug,
        packName: body.packName,
        description: body.description || '',
        price: Number(body.price) || 0,
        originalPrice: Number(body.originalPrice) || 0,
        imageUrl: body.imageUrl || '',
        affiliateUrl: body.affiliateUrl || '',
        isPopular: Boolean(body.isPopular),
        isActive: Boolean(body.isActive ?? true),
        sortOrder: Number(body.sortOrder) || 0,
      },
    })
    return NextResponse.json({ pack })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Failed to create pack' }, { status: 500 })
  }
}
