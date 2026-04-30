import { PrismaClient } from '@prisma/client'

// Validate required env vars at startup (logs warnings in production)
import '@/lib/env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PgBouncer-compatible Prisma client config.
// When using Supabase Pooler, connection_limit must be set to prevent exhausting the pool.
// The pgbouncer=true param in DATABASE_URL is also required.
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''

  // If using Supabase pooler (port 6543 or contains 'pooler'), limit connections
  const isPooler = databaseUrl.includes('pooler.supabase.com') || databaseUrl.includes(':6543')
  const connectionLimit = isPooler ? '5' : undefined

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    datasources: connectionLimit
      ? {
          db: {
            url: databaseUrl.includes('?')
              ? `${databaseUrl}&connection_limit=${connectionLimit}`
              : `${databaseUrl}?connection_limit=${connectionLimit}`,
          },
        }
      : undefined,
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
