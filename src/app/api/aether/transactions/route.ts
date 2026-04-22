import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request)
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      db.aetherTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          source: true,
          description: true,
          amount: true,
          balanceAfter: true,
          createdAt: true,
        },
      }),
      db.aetherTransaction.count({
        where: { userId },
      }),
    ])

    return NextResponse.json({
      transactions,
      total,
      page,
      limit,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Aether transactions error:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
