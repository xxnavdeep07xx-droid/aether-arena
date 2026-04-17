import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const games = await db.game.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { tournaments: true, leaderboardEntries: true },
        },
      },
    })

    return NextResponse.json({ games })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Admin games error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const body = await request.json()

    const { name, slug, iconUrl, bannerUrl, maxTeamSize, description, isActive, sortOrder } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await db.game.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Game slug already exists' }, { status: 409 })
    }

    const game = await db.game.create({
      data: {
        name,
        slug,
        iconUrl: iconUrl || '',
        bannerUrl: bannerUrl || '',
        maxTeamSize: maxTeamSize || 1,
        description: description || '',
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json({ game }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Admin create game error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
