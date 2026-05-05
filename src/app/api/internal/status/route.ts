import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SETUP_SECRET = process.env.SETUP_SECRET

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!SETUP_SECRET || authHeader !== `Bearer ${SETUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profiles = await db.profile.findMany({
    select: { id: true, username: true, isAdmin: true }
  })

  const tables = await db.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `

  return NextResponse.json({ profiles, tables })
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!SETUP_SECRET || authHeader !== `Bearer ${SETUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))

  if (body.action === 'drop-account-table') {
    try {
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "Account" CASCADE`)
      return NextResponse.json({ success: true, message: 'Account table dropped' })
    } catch (e: unknown) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'error' }, { status: 500 })
    }
  }

  if (body.action === 'ensure-admin') {
    const result = await db.profile.updateMany({
      where: { isAdmin: false },
      data: { isAdmin: true }
    })
    return NextResponse.json({ promoted: result.count })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
