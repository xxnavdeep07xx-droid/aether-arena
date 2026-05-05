import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SETUP_SECRET = process.env.SETUP_SECRET

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!SETUP_SECRET || authHeader !== `Bearer ${SETUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all profiles
    const profiles = await db.profile.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, username: true, isAdmin: true, discordId: true }
    })

    if (profiles.length === 0) {
      return NextResponse.json({ error: 'No profiles found' }, { status: 404 })
    }

    // Make ALL current users admin (they're the owner)
    const result = await db.profile.updateMany({
      where: { isAdmin: false },
      data: { isAdmin: true }
    })

    // Also get table info
    const tables = await db.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `

    return NextResponse.json({
      profiles: profiles,
      promotedCount: result.count,
      tables: tables
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
