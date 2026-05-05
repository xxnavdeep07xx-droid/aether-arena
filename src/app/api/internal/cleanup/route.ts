import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SETUP_SECRET = process.env.SETUP_SECRET

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!SETUP_SECRET || authHeader !== `Bearer ${SETUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []

  try {
    const body = await request.json().catch(() => ({}))
    const action = body.action || 'drop-unused'

    if (action === 'tables') {
      const tables = await db.$queryRaw`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `
      return NextResponse.json({ tables })
    }

    // Drop unused Account table and clean up stale data
    try {
      await db.$executeRawUnsafe(`DROP TABLE IF EXISTS "Account" CASCADE`)
      results.push('Dropped Account table (old NextAuth, replaced by AccountCredential)')
    } catch (e: unknown) {
      results.push(`Account table: ${e instanceof Error ? e.message : 'error'}`)
    }

    // Clean expired OTP records
    try {
      const deleted = await db.phoneVerification.deleteMany({
        where: { expiresAt: { lt: new Date() } }
      })
      results.push(`Cleaned ${deleted.count} expired OTP records`)
    } catch (e: unknown) {
      results.push(`OTP cleanup: ${e instanceof Error ? e.message : 'error'}`)
    }

    // Clean expired sessions
    try {
      const deleted = await db.session.deleteMany({
        where: { expiresAt: { lt: new Date() } }
      })
      results.push(`Cleaned ${deleted.count} expired sessions`)
    } catch (e: unknown) {
      results.push(`Session cleanup: ${e instanceof Error ? e.message : 'error'}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
