import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

/**
 * Health check endpoint.
 *
 * - Without auth: Returns only basic {"status": "healthy"/"unhealthy"} — safe for load balancers.
 * - With admin auth: Returns full diagnostics (DB host, tables, latency, error hints).
 */
export async function GET(request: Request) {
  let dbOk = false
  let latency = 0

  // Always test database connectivity
  try {
    const start = Date.now()
    await db.$queryRawUnsafe('SELECT 1 as ok')
    latency = Date.now() - start
    dbOk = true
  } catch {
    dbOk = false
  }

  // Check if request has admin authentication for detailed diagnostics
  let isAdmin = false
  try {
    await requireAdmin(request)
    isAdmin = true
  } catch {
    // Not authenticated or not admin — that's fine, return basic status only
  }

  // Public response — minimal, no sensitive info
  if (!isAdmin) {
    return NextResponse.json({
      status: dbOk ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    })
  }

  // Admin response — full diagnostics
  const results: Record<string, string> = {}

  if (process.env.DATABASE_URL) {
    results.database_url_set = 'yes'
    // Mask the DB host to avoid full exposure even for admins
    const dbHost = process.env.DATABASE_URL.match(/@([^:/]+)/)?.[1]
    results.database_host = dbHost ? `${dbHost.slice(0, 4)}***` : 'configured'
    results.has_sslmode = process.env.DATABASE_URL.includes('sslmode') ? 'yes' : 'NO'
  } else {
    results.database_url_set = 'NO — DATABASE_URL environment variable is missing!'
  }

  results.db_connection = dbOk ? `OK (${latency}ms)` : 'FAILED'

  if (dbOk) {
    try {
      const tables: { tablename: string }[] = await db.$queryRawUnsafe(`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `)
      results.table_count = String(tables.length)

      const criticalTables = ['Profile', 'Session', 'AccountCredential', 'Tournament', 'Game', 'TopupPack']
      const missing = criticalTables.filter(t => !tables.some(tb => tb.tablename === t))
      if (missing.length > 0) {
        results.missing_tables = `Missing: ${missing.join(', ')} — visit /api/setup to create them`
      } else {
        results.missing_tables = 'none — all critical tables exist'
      }
    } catch (e: unknown) {
      results.table_check = `Failed: ${e instanceof Error ? e.message : 'error'}`
    }
  } else {
    // Only show detailed error hints to admins
    try {
      await db.$queryRawUnsafe('SELECT 1 as ok')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      results.db_connection = `FAILED: ${msg}`

      if (msg.includes('ECONNREFUSED') || msg.includes('Connection refused')) {
        results.hint = 'Database server refused connection. Check host/port in DATABASE_URL.'
      } else if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
        results.hint = 'Database host not found. Check the hostname in DATABASE_URL.'
      } else if (msg.includes('authentication failed') || msg.includes('password authentication')) {
        results.hint = 'Wrong username or password in DATABASE_URL.'
      } else if (msg.includes('ssl') || msg.includes('SSL')) {
        results.hint = 'SSL error. Try adding ?sslmode=require to DATABASE_URL.'
      } else if (msg.includes('P1001') || msg.includes('P1000')) {
        results.hint = 'Prisma connection error. Check DATABASE_URL format.'
      } else if (msg.includes('timeout')) {
        results.hint = 'Connection timed out. Database might be paused (Supabase free tier).'
      }
    }
  }

  return NextResponse.json({
    status: dbOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    ...results,
  })
}
