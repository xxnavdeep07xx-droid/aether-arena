import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Health check endpoint — tests database connectivity and returns diagnostics.
 * Useful for verifying Supabase/Neon/Postgres is properly configured.
 * Call: GET /api/health
 */
export async function GET() {
  const results: Record<string, string> = {}
  let dbOk = false

  // 1. Check if DATABASE_URL is configured
  if (process.env.DATABASE_URL) {
    results.database_url_set = 'yes'
    results.database_host = process.env.DATABASE_URL.match(/@([^:\/]+)/)?.[1] || 'configured'
    results.has_sslmode = process.env.DATABASE_URL.includes('sslmode') ? 'yes' : 'NO'
  } else {
    results.database_url_set = 'NO — DATABASE_URL environment variable is missing!'
  }

  // 2. Test database connection
  try {
    const start = Date.now()
    await db.$queryRawUnsafe('SELECT 1 as ok')
    const latency = Date.now() - start
    results.db_connection = `OK (${latency}ms)`
    dbOk = true
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    results.db_connection = `FAILED: ${msg}`

    // Provide helpful hints
    if (msg.includes('ECONNREFUSED') || msg.includes('Connection refused')) {
      results.hint = 'Database server refused connection. Check host/port in DATABASE_URL.'
    } else if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      results.hint = 'Database host not found. Check the hostname in DATABASE_URL.'
    } else if (msg.includes('authentication failed') || msg.includes('password authentication')) {
      results.hint = 'Wrong username or password in DATABASE_URL.'
    } else if (msg.includes('ssl') || msg.includes('SSL')) {
      results.hint = 'SSL error. Try adding ?sslmode=require to DATABASE_URL.'
    } else if (msg.includes('P1001') || msg.includes('P1000')) {
      results.hint = 'Prisma connection error. Check DATABASE_URL format. For Supabase, use the connection string from Settings > Database > Connection string > URI.'
    } else if (msg.includes('timeout')) {
      results.hint = 'Connection timed out. Database might be paused (Supabase free tier pauses after inactivity — visit your Supabase dashboard to wake it up).'
    }
  }

  // 3. If connected, check tables
  if (dbOk) {
    try {
      const tables: { tablename: string }[] = await db.$queryRawUnsafe(`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `)
      results.tables = tables.map(t => t.tablename).join(', ')
      results.table_count = String(tables.length)

      // Check critical tables
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
  }

  return NextResponse.json({
    status: dbOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    ...results,
  })
}
