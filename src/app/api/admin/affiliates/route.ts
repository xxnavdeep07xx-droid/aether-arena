import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const affiliates = await db.affiliateLink.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    const formatted = affiliates.map((a) => ({
      ...a,
      priceDisplay: (a.price / 100).toFixed(2),
      originalPriceDisplay: (a.originalPrice / 100).toFixed(2),
    }))

    return NextResponse.json({ affiliates: formatted })
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

    const { name, platform, url, slug, description, category, imageUrl, price, originalPrice, isActive, sortOrder } = body

    if (!name || !url || !slug) {
      return NextResponse.json(
        { error: 'Name, URL, and slug are required' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await db.affiliateLink.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Affiliate slug already exists' }, { status: 409 })
    }

    const affiliate = await db.affiliateLink.create({
      data: {
        name,
        platform: platform || '',
        url,
        slug,
        description: description || '',
        category: category || '',
        imageUrl: imageUrl || '',
        price: price ? Math.round(price * 100) : 0,
        originalPrice: originalPrice ? Math.round(originalPrice * 100) : 0,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json(
      {
        affiliate: {
          ...affiliate,
          priceDisplay: (affiliate.price / 100).toFixed(2),
          originalPriceDisplay: (affiliate.originalPrice / 100).toFixed(2),
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
