import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    const whereClause: Record<string, unknown> = {}
    if (status && ['pending', 'approved', 'rejected', 'paid'].includes(status)) {
      whereClause.status = status
    }

    const redemptions = await db.redemptionRequest.findMany({
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
    })

    return NextResponse.json({ redemptions })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Admin redemptions error:', error)
    return NextResponse.json({ error: 'Failed to fetch redemptions' }, { status: 500 })
  }
}
