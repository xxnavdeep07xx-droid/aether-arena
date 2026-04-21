import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const packs = await db.topupPack.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ packs })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request)

    const body = await request.json()
    const {
      gameName,
      gameSlug,
      packName,
      description,
      price,
      originalPrice,
      imageUrl,
      affiliateUrl,
      isPopular,
      isActive,
      sortOrder,
    } = body

    if (!gameName || !gameSlug || !packName) {
      return NextResponse.json(
        { error: 'gameName, gameSlug, and packName are required' },
        { status: 400 }
      )
    }

    const pack = await db.topupPack.create({
      data: {
        gameName,
        gameSlug,
        packName,
        description: description || '',
        price: price || 0,
        originalPrice: originalPrice || 0,
        imageUrl: imageUrl || '',
        affiliateUrl: affiliateUrl || '',
        isPopular: isPopular || false,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json({ pack }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
