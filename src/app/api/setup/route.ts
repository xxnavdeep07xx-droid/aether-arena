import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    // Still perform a comparison to avoid leaking length via timing
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

// Database setup endpoint — creates missing tables/columns.
// DELETE handler clears all data from tables (for admin cleanup).
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
// NOTE: This function is ONLY called from the setup endpoint which is protected by SETUP_SECRET.
// The table and column names are hardcoded constants in the codebase, NOT user input.
// The parameters are validated through a whitelist approach.
const ALLOWED_TABLES = new Set(['Profile', 'Tournament', 'AccountCredential', 'ContactSubmission', 'AetherBalance', 'AetherTransaction', 'AetherTask', 'AetherTaskProgress', 'UserStreak', 'RedemptionRequest', 'TopupPack', 'Announcement', 'PlatformSetting'])
const ALLOWED_COLUMNS: Record<string, Set<string>> = {
  'Profile': new Set(['bio', 'discordId', 'discordUsername', 'league', 'leaguePoints', 'totalTournamentsPlayed', 'totalWins', 'totalKills', 'totalDeaths', 'totalPrizeWon', 'scheduledDeletionAt', 'referredByCode', 'notificationPrefs', 'privacyPrefs', 'language', 'phone']),
  'Tournament': new Set(['bannerImageUrl', 'streamScheduled', 'streamPlatform', 'streamUrl', 'streamStartTime', 'streamViewers', 'isFeatured']),
}

async function safeAddColumn(table: string, column: string, type: string, nullable: boolean, defaultVal?: string) {
  // Validate table and column names against whitelist to prevent SQL injection
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`Invalid table name: ${table}`)
  }
  const allowedCols = ALLOWED_COLUMNS[table]
  if (allowedCols && !allowedCols.has(column)) {
    throw new Error(`Invalid column name: ${column} for table: ${table}`)
  }

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
  // Always require setup secret
  if (!SETUP_SECRET) {
    return NextResponse.json({ error: 'Setup secret not configured. Set SETUP_SECRET env variable.' }, { status: 401 });
  }
  const authHeader = request.headers.get('authorization');
  if (!timingSafeEqual(authHeader || '', `Bearer ${SETUP_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // ── Profile column: referredByCode ────────────────────────
    try {
      await safeAddColumn('Profile', 'referredByCode', 'TEXT', true)
      results.push('Profile column referredByCode: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`Profile column referredByCode: ${msg}`)
    }

    try {
      await safeCreateIndex('Profile', 'referredByCode')
      results.push('Profile referredByCode index: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`Profile referredByCode index: ${msg}`)
    }

    // ── AetherBalance table ───────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AetherBalance" (
          "user_id" TEXT NOT NULL,
          "balance" INTEGER NOT NULL DEFAULT 0,
          "total_earned" INTEGER NOT NULL DEFAULT 0,
          "total_redeemed" INTEGER NOT NULL DEFAULT 0,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AetherBalance_pkey" PRIMARY KEY ("user_id")
        )
      `)
      results.push('AetherBalance table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherBalance table: ${msg}`)
    }

    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'AetherBalance_user_id_fkey'
            AND table_name = 'AetherBalance'
          ) THEN
            ALTER TABLE "AetherBalance"
              ADD CONSTRAINT "AetherBalance_user_id_fkey"
              FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('AetherBalance FK → Profile: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherBalance FK: ${msg}`)
    }

    // ── AetherTransaction table ───────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AetherTransaction" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "user_id" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "source" TEXT,
          "description" TEXT NOT NULL,
          "amount" INTEGER NOT NULL,
          "balance_after" INTEGER NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AetherTransaction_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('AetherTransaction table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTransaction table: ${msg}`)
    }

    try {
      await safeCreateIndex('AetherTransaction', 'user_id')
      await safeCreateIndex('AetherTransaction', 'created_at')
      await safeCreateIndex('AetherTransaction', 'type')
      results.push('AetherTransaction indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTransaction indexes: ${msg}`)
    }

    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'AetherTransaction_user_id_fkey'
            AND table_name = 'AetherTransaction'
          ) THEN
            ALTER TABLE "AetherTransaction"
              ADD CONSTRAINT "AetherTransaction_user_id_fkey"
              FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('AetherTransaction FK → Profile: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTransaction FK → Profile: ${msg}`)
    }

    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'AetherTransaction_balance_fkey'
            AND table_name = 'AetherTransaction'
          ) THEN
            ALTER TABLE "AetherTransaction"
              ADD CONSTRAINT "AetherTransaction_balance_fkey"
              FOREIGN KEY ("user_id") REFERENCES "AetherBalance"("user_id") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('AetherTransaction FK → AetherBalance: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTransaction FK → AetherBalance: ${msg}`)
    }

    // ── AetherTask table ──────────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AetherTask" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "task_key" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "reward_amount" INTEGER NOT NULL,
          "category" TEXT NOT NULL,
          "reset_type" TEXT NOT NULL,
          "affiliate_url" TEXT,
          "is_active" BOOLEAN NOT NULL DEFAULT true,
          "display_order" INTEGER NOT NULL DEFAULT 0,
          CONSTRAINT "AetherTask_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('AetherTask table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTask table: ${msg}`)
    }

    try {
      await safeCreateIndex('AetherTask', 'task_key', true)
      await safeCreateIndex('AetherTask', 'category')
      await safeCreateIndex('AetherTask', 'is_active')
      await safeCreateIndex('AetherTask', 'display_order')
      results.push('AetherTask indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTask indexes: ${msg}`)
    }

    // ── AetherTaskProgress table ───────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AetherTaskProgress" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "user_id" TEXT NOT NULL,
          "task_key" TEXT NOT NULL,
          "completed" BOOLEAN NOT NULL DEFAULT false,
          "completed_at" TIMESTAMP(3),
          "reset_date" DATE,
          "times_completed" INTEGER NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AetherTaskProgress_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('AetherTaskProgress table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTaskProgress table: ${msg}`)
    }

    try {
      await safeCreateIndex('AetherTaskProgress', 'user_id')
      await safeCreateIndex('AetherTaskProgress', 'task_key')
      results.push('AetherTaskProgress indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTaskProgress indexes: ${msg}`)
    }

    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'AetherTaskProgress_user_id_fkey'
            AND table_name = 'AetherTaskProgress'
          ) THEN
            ALTER TABLE "AetherTaskProgress"
              ADD CONSTRAINT "AetherTaskProgress_user_id_fkey"
              FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('AetherTaskProgress FK → Profile: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTaskProgress FK → Profile: ${msg}`)
    }

    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'AetherTaskProgress_task_key_fkey'
            AND table_name = 'AetherTaskProgress'
          ) THEN
            ALTER TABLE "AetherTaskProgress"
              ADD CONSTRAINT "AetherTaskProgress_task_key_fkey"
              FOREIGN KEY ("task_key") REFERENCES "AetherTask"("task_key") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('AetherTaskProgress FK → AetherTask: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTaskProgress FK → AetherTask: ${msg}`)
    }

    // ── UserStreak table ──────────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "UserStreak" (
          "user_id" TEXT NOT NULL,
          "current_streak" INTEGER NOT NULL DEFAULT 0,
          "longest_streak" INTEGER NOT NULL DEFAULT 0,
          "last_login_date" TIMESTAMP(3),
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("user_id")
        )
      `)
      results.push('UserStreak table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`UserStreak table: ${msg}`)
    }

    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'UserStreak_user_id_fkey'
            AND table_name = 'UserStreak'
          ) THEN
            ALTER TABLE "UserStreak"
              ADD CONSTRAINT "UserStreak_user_id_fkey"
              FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('UserStreak FK → Profile: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`UserStreak FK: ${msg}`)
    }

    // ── RedemptionRequest table ───────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "RedemptionRequest" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "user_id" TEXT NOT NULL,
          "amount_aether" INTEGER NOT NULL,
          "amount_inr" DOUBLE PRECISION NOT NULL,
          "upi_id" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "admin_note" TEXT,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "processed_at" TIMESTAMP(3),
          CONSTRAINT "RedemptionRequest_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('RedemptionRequest table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`RedemptionRequest table: ${msg}`)
    }

    try {
      await safeCreateIndex('RedemptionRequest', 'user_id')
      await safeCreateIndex('RedemptionRequest', 'status')
      await safeCreateIndex('RedemptionRequest', 'created_at')
      results.push('RedemptionRequest indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`RedemptionRequest indexes: ${msg}`)
    }

    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'RedemptionRequest_user_id_fkey'
            AND table_name = 'RedemptionRequest'
          ) THEN
            ALTER TABLE "RedemptionRequest"
              ADD CONSTRAINT "RedemptionRequest_user_id_fkey"
              FOREIGN KEY ("user_id") REFERENCES "Profile"("id") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('RedemptionRequest FK → Profile: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`RedemptionRequest FK → Profile: ${msg}`)
    }

    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'RedemptionRequest_balance_fkey'
            AND table_name = 'RedemptionRequest'
          ) THEN
            ALTER TABLE "RedemptionRequest"
              ADD CONSTRAINT "RedemptionRequest_balance_fkey"
              FOREIGN KEY ("user_id") REFERENCES "AetherBalance"("user_id") ON DELETE CASCADE;
          END IF;
        END $$
      `)
      results.push('RedemptionRequest FK → AetherBalance: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`RedemptionRequest FK → AetherBalance: ${msg}`)
    }

    // ── TopupPack table ───────────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TopupPack" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "gameName" TEXT NOT NULL DEFAULT '',
          "gameSlug" TEXT NOT NULL DEFAULT '',
          "packName" TEXT NOT NULL DEFAULT '',
          "description" TEXT,
          "price" INTEGER NOT NULL DEFAULT 0,
          "originalPrice" INTEGER NOT NULL DEFAULT 0,
          "affiliateUrl" TEXT,
          "iconUrl" TEXT,
          "isPopular" BOOLEAN NOT NULL DEFAULT false,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "TopupPack_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('TopupPack table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`TopupPack table: ${msg}`)
    }

    // ── Announcement table ────────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Announcement" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "type" TEXT NOT NULL DEFAULT 'info',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('Announcement table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`Announcement table: ${msg}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

// DELETE /api/setup — Clear ALL data from every data table.
// Keeps only real user profiles (those with AccountCredential) and their credentials.
export async function DELETE(request: Request) {
  // Always require setup secret
  if (!SETUP_SECRET) {
    return NextResponse.json({ error: 'Setup secret not configured. Set SETUP_SECRET env variable.' }, { status: 401 });
  }
  const authHeader = request.headers.get('authorization');
  if (!timingSafeEqual(authHeader || '', `Bearer ${SETUP_SECRET}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      'StreamSchedule',
      'AffiliateLink',
      'PlatformSetting',
      'Announcement',
      'ContactSubmission',
      'Game',
      'AetherTaskProgress',
      'AetherTransaction',
      'RedemptionRequest',
      'AetherBalance',
      'UserStreak',
      'AetherTask',
      'TopupPack',
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
