import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiLimiter } from '@/lib/rate-limit'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting per IP to prevent click fraud
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { id } = await params
  const { success: rateLimitOk } = await apiLimiter(`affiliate:${clientIp}:${id}`)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const affiliate = await db.affiliateLink.update({
      where: { id, isActive: true },
      data: { clicks: { increment: 1 } },
    })

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, url: affiliate.url })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
