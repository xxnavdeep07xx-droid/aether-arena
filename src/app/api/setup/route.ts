import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Database setup endpoint — creates missing tables/columns.
// DELETE handler clears all seed/demo data from tables.
// Protected by SETUP_SECRET to prevent unauthorized access.
// This is needed because prisma db push cannot be run from Vercel.
// All SQL is PgBouncer-safe: single statements only, no multi-command strings.

const SETUP_SECRET = process.env.SETUP_SECRET;

// PgBouncer-safe: run a single CREATE INDEX IF NOT EXISTS
async function safeCreateIndex(table: string, column: string, unique = false) {
  const idxName = `${table}_${column}_idx`
  const op = unique ? 'CREATE UNIQUE INDEX' : 'CREATE INDEX'
  await db.$executeRawUnsafe(
    `${op} IF NOT EXISTS "${idxName}" ON "${table}"("${column}")`
  )
}

// PgBouncer-safe: add a column using a full DO $$ block with proper quoting
async function safeAddColumn(table: string, column: string, type: string, nullable: boolean, defaultVal?: string) {
  // Build the full ALTER TABLE as a literal string (no dynamic EXECUTE)
  const notNull = nullable ? '' : ' NOT NULL'
  const def = defaultVal !== undefined ? ` DEFAULT ${defaultVal}` : ''
  const alterSql = `ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}${notNull}${def}`

  await db.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = '${table}' AND column_name = '${column}'
      ) THEN
        ${alterSql};
      END IF;
    END $$
  `)
}

export async function GET(request: Request) {
  // Verify setup secret if configured
  if (SETUP_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SETUP_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const results: string[] = []

    // ── Profile columns ──────────────────────────────────────────
    try {
      await safeAddColumn('Profile', 'bio', 'TEXT', false, "''")
      await safeAddColumn('Profile', 'discordId', 'TEXT', true)
      await safeAddColumn('Profile', 'discordUsername', 'TEXT', true)
      await safeAddColumn('Profile', 'league', 'TEXT', false, "'bronze'")
      await safeAddColumn('Profile', 'leaguePoints', 'INTEGER', false, '0')
      await safeAddColumn('Profile', 'totalTournamentsPlayed', 'INTEGER', false, '0')
      await safeAddColumn('Profile', 'totalWins', 'INTEGER', false, '0')
      await safeAddColumn('Profile', 'totalKills', 'INTEGER', false, '0')
      await safeAddColumn('Profile', 'totalDeaths', 'INTEGER', false, '0')
      await safeAddColumn('Profile', 'totalPrizeWon', 'INTEGER', false, '0')
      await safeAddColumn('Profile', 'scheduledDeletionAt', 'TIMESTAMP(3)', true)
      results.push('Profile columns: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`Profile columns: ${msg}`)
    }

    // ── Tournament columns ───────────────────────────────────────
    try {
      await safeAddColumn('Tournament', 'bannerImageUrl', 'TEXT', false, "''")
      await safeAddColumn('Tournament', 'streamScheduled', 'BOOLEAN', false, 'false')
      await safeAddColumn('Tournament', 'streamPlatform', 'TEXT', false, "''")
      await safeAddColumn('Tournament', 'streamUrl', 'TEXT', false, "''")
      await safeAddColumn('Tournament', 'streamStartTime', 'TIMESTAMP(3)', true)
      await safeAddColumn('Tournament', 'streamViewers', 'INTEGER', false, '0')
      await safeAddColumn('Tournament', 'isFeatured', 'BOOLEAN', false, 'false')
      results.push('Tournament columns: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`Tournament columns: ${msg}`)
    }

    // ── TopupPack table ─────────────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TopupPack" (
          "id" TEXT NOT NULL,
          "gameName" TEXT NOT NULL,
          "gameSlug" TEXT NOT NULL,
          "packName" TEXT NOT NULL,
          "description" TEXT NOT NULL DEFAULT '',
          "price" INTEGER NOT NULL DEFAULT 0,
          "originalPrice" INTEGER NOT NULL DEFAULT 0,
          "imageUrl" TEXT NOT NULL DEFAULT '',
          "affiliateUrl" TEXT NOT NULL DEFAULT '',
          "isPopular" BOOLEAN NOT NULL DEFAULT false,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "TopupPack_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('TopupPack table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`TopupPack table: ${msg}`)
    }

    // ── TopupPack indexes (one statement per call for PgBouncer) ─
    try {
      await safeCreateIndex('TopupPack', 'gameSlug')
      await safeCreateIndex('TopupPack', 'isActive')
      await safeCreateIndex('TopupPack', 'sortOrder')
      results.push('TopupPack indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`TopupPack indexes: ${msg}`)
    }

    // ── AccountCredential table ─────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AccountCredential" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AccountCredential_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('AccountCredential table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AccountCredential table: ${msg}`)
    }

    // ── AccountCredential indexes (one per call for PgBouncer) ───
    try {
      await safeCreateIndex('AccountCredential', 'email', true)
      await safeCreateIndex('AccountCredential', 'userId', true)
      results.push('AccountCredential indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AccountCredential indexes: ${msg}`)
    }

    // ── AccountCredential FK → Profile ──────────────────────────
    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'AccountCredential_userId_fkey'
            AND table_name = 'AccountCredential'
          ) THEN
            ALTER TABLE "AccountCredential"
              ADD CONSTRAINT "AccountCredential_userId_fkey"
              FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('AccountCredential FK → Profile: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AccountCredential FK: ${msg}`)
    }

    // ── ContactSubmission table ─────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ContactSubmission" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "subject" TEXT,
          "message" TEXT NOT NULL,
          "isRead" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('ContactSubmission table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`ContactSubmission table: ${msg}`)
    }

    // ── ContactSubmission indexes (one per call for PgBouncer) ───
    try {
      await safeCreateIndex('ContactSubmission', 'isRead')
      await safeCreateIndex('ContactSubmission', 'createdAt')
      results.push('ContactSubmission indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`ContactSubmission indexes: ${msg}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

// DELETE /api/setup — Clear ALL seed/demo data from every data table.
// Keeps only the first admin user profile (real user) and their credentials.
export async function DELETE(request: Request) {
  if (SETUP_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${SETUP_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const results: string[] = []

    // Clear data tables in dependency order (child tables first)
    const dataTables = [
      'Notification',
      'Leaderboard',
      'MatchParticipant',
      'Match',
      'TournamentRegistration',
      'Tournament',
      'TopupPack',
      'StreamSchedule',
      'AffiliateLink',
      'PlatformSetting',
      'Announcement',
      'ContactSubmission',
      'Game',
    ]

    for (const table of dataTables) {
      try {
        const res: { count: number }[] = await db.$queryRawUnsafe(
          `SELECT COUNT(*)::int as count FROM "${table}"`
        )
        const before = res[0]?.count || 0
        await db.$executeRawUnsafe(`DELETE FROM "${table}"`)
        results.push(`${table}: deleted ${before} rows`)
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'unknown'
        results.push(`${table}: skipped (${msg})`)
      }
    }

    // Reset all user profile stats to zero (keeps accounts intact)
    try {
      const profileReset = await db.$executeRawUnsafe(`
        UPDATE "Profile" SET
          "league" = 'bronze',
          "leaguePoints" = 0,
          "totalTournamentsPlayed" = 0,
          "totalWins" = 0,
          "totalKills" = 0,
          "totalDeaths" = 0,
          "totalPrizeWon" = 0,
          "avatarUrl" = NULL,
          "bio" = ''
      `)
      results.push(`Profile stats reset to zero`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      results.push(`Profile reset: ${msg}`)
    }

    // Remove fake/seeded user profiles (keep only real admin with credentials)
    try {
      // Find IDs of users who have actual credentials (real registered users)
      const realUsers: { id: string }[] = await db.$queryRawUnsafe(`
        SELECT DISTINCT "userId" as id FROM "AccountCredential"
      `)
      const realIds = realUsers.map(u => u.id)

      if (realIds.length > 0) {
        const placeholders = realIds.map((_, i) => `$${i + 1}`).join(',')
        const deleteResult: { count: number }[] = await db.$queryRawUnsafe(
          `SELECT COUNT(*)::int as count FROM "Profile" WHERE "id" NOT IN (${placeholders})`,
          ...realIds
        )
        const fakeCount = deleteResult[0]?.count || 0

        if (fakeCount > 0) {
          await db.$executeRawUnsafe(
            `DELETE FROM "Profile" WHERE "id" NOT IN (${placeholders})`,
            ...realIds
          )
          results.push(`Fake profiles deleted: ${fakeCount} (kept ${realIds.length} real users)`)
        } else {
          results.push(`No fake profiles found (all ${realIds.length} users have credentials)`)
        }
      } else {
        results.push(`No real users found — skipping fake profile cleanup`)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown'
      results.push(`Fake profile cleanup: ${msg}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
