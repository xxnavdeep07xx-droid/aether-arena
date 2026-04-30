import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { apiLimiter } from '@/lib/rate-limit'

export async function GET(request: Request) {
  // Rate limiting for public endpoint
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { success: rateLimitOk } = await apiLimiter(`public:${clientIp}`)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const games = await db.game.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ games })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
