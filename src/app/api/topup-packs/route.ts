import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

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

    return NextResponse.json({ packs })
  } catch (error: any) {
    // If table doesn't exist yet, auto-trigger setup
    const msg = error?.message || ''
    if (msg.includes('does not exist') || msg.includes('relation')) {
      try {
        const setupRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/setup`)
        if (setupRes.ok) {
          // Retry after setup
          const where2: Record<string, unknown> = { isActive: true }
          if (game && game !== 'all') {
            where2.gameSlug = game
          }
          const packs = await db.topupPack.findMany({
            where: where2,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          })
          return NextResponse.json({ packs })
        }
      } catch { /* ignore setup failure */ }
    }
    return NextResponse.json({ packs: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
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
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create pack' }, { status: 500 })
  }
}
