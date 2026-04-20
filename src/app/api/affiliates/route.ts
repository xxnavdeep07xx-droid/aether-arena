import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const affiliates = await db.affiliateLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    const formatted = affiliates.map((a) => ({
      ...a,
      priceDisplay: a.price.toLocaleString('en-IN'),
      originalPriceDisplay: a.originalPrice ? a.originalPrice.toLocaleString('en-IN') : null,
    }))

    return NextResponse.json({ affiliates: formatted })
  } catch (error) {
    console.error('Get affiliates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
