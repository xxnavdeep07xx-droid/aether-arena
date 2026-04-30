import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)), 100)
    const skip = (page - 1) * limit

    const whereClause: Record<string, unknown> = {}
    if (status && ['pending', 'approved', 'rejected', 'paid'].includes(status)) {
      whereClause.status = status
    }

    const [redemptions, total] = await Promise.all([
      db.redemptionRequest.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      db.redemptionRequest.count({ where: whereClause }),
    ])

    return NextResponse.json({
      redemptions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Admin redemptions error:', error)
    return NextResponse.json({ error: 'Failed to fetch redemptions' }, { status: 500 })
  }
}
