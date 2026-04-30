import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10)), 100)
    const skip = (page - 1) * limit

    const [packs, total] = await Promise.all([
      db.topupPack.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      db.topupPack.count(),
    ])

    return NextResponse.json({
      packs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
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
