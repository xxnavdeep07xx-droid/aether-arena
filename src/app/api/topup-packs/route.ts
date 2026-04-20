import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const game = searchParams.get('game')

    const where: Record<string, unknown> = { isActive: true }
    if (game && game !== 'all') {
      where.gameSlug = game
    }

    const packs = await db.topupPack.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ packs })
  } catch (error) {
    console.error('Error fetching topup packs:', error)
    return NextResponse.json({ error: 'Failed to fetch packs' }, { status: 500 })
  }
}
