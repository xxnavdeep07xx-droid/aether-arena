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
      await safeAddColumn('Profile', 'phone', 'TEXT', true)
      await safeAddColumn('Profile', 'phoneVerified', 'BOOLEAN', false, 'false')
      await safeAddColumn('Profile', 'referredByCode', 'TEXT', true)
      await safeAddColumn('Profile', 'notification_prefs', 'JSONB', false, "'{\"pushEnabled\":true,\"tournamentAlerts\":true,\"resultUpdates\":true,\"promoOffers\":false,\"communityUpdates\":true}'")
      await safeAddColumn('Profile', 'privacy_prefs', 'JSONB', false, "'{\"profileVisibility\":\"public\",\"showLeaderboard\":true,\"showActivity\":true}'")
      await safeAddColumn('Profile', 'language', 'TEXT', false, "'en'")
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

    // ── AccountCredential columns: phone, phoneVerified ──────────
    try {
      await safeAddColumn('AccountCredential', 'phone', 'TEXT', true)
      await safeAddColumn('AccountCredential', 'phoneVerified', 'BOOLEAN', false, 'false')
      await safeAddColumn('AccountCredential', 'emailVerified', 'BOOLEAN', false, 'false')
      await safeAddColumn('AccountCredential', 'emailVerificationToken', 'TEXT', true)
      await safeAddColumn('AccountCredential', 'emailVerificationExpires', 'TIMESTAMP(3)', true)
      results.push('AccountCredential phone/email verification columns: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AccountCredential columns: ${msg}`)
    }

    // ── AccountCredential phone unique index ────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "AccountCredential_phone_key" ON "AccountCredential"("phone") WHERE "phone" IS NOT NULL
      `)
      await safeCreateIndex('AccountCredential', 'phone')
      results.push('AccountCredential phone indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AccountCredential phone indexes: ${msg}`)
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

    // ── Profile indexes (new columns) ──────────────────────────
    try {
      await safeCreateIndex('Profile', 'referredByCode')
      await safeCreateIndex('Profile', 'league')
      await safeCreateIndex('Profile', 'leaguePoints')
      await safeCreateIndex('Profile', 'phone')
      // Phone unique index (allows NULL)
      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Profile_phone_key" ON "Profile"("phone") WHERE "phone" IS NOT NULL
      `)
      results.push('Profile extra indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`Profile extra indexes: ${msg}`)
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

    // ── AetherTaskProgress unique constraint ─────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "AetherTaskProgress_user_id_task_key_reset_date_key" ON "AetherTaskProgress"("user_id", "task_key", "reset_date")
      `)
      results.push('AetherTaskProgress unique constraint: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTaskProgress unique constraint: ${msg}`)
    }

    // ── AetherTaskProgress missing columns ───────────────────
    try {
      await safeAddColumn('AetherTaskProgress', 'reset_date', 'DATE', true)
      results.push('AetherTaskProgress reset_date column: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTaskProgress reset_date column: ${msg}`)
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
          "description" TEXT NOT NULL DEFAULT '',
          "price" INTEGER NOT NULL DEFAULT 0,
          "originalPrice" INTEGER NOT NULL DEFAULT 0,
          "imageUrl" TEXT NOT NULL DEFAULT '',
          "affiliateUrl" TEXT NOT NULL DEFAULT '',
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

    // ── TopupPack missing columns (for existing tables) ────────
    try {
      await safeAddColumn('TopupPack', 'imageUrl', 'TEXT', false, "''")
      await safeAddColumn('TopupPack', 'affiliateUrl', 'TEXT', false, "''")
      await safeAddColumn('TopupPack', 'description', 'TEXT', false, "''")
      await safeAddColumn('TopupPack', 'originalPrice', 'INTEGER', false, '0')
      results.push('TopupPack extra columns: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`TopupPack extra columns: ${msg}`)
    }

    // ── TopupPack indexes ──────────────────────────────────────
    try {
      await safeCreateIndex('TopupPack', 'gameSlug')
      await safeCreateIndex('TopupPack', 'isActive')
      await safeCreateIndex('TopupPack', 'sortOrder')
      results.push('TopupPack indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`TopupPack indexes: ${msg}`)
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

    // ── Announcement missing columns ─────────────────────────
    try {
      await safeAddColumn('Announcement', 'createdById', 'TEXT', true)
      await safeAddColumn('Announcement', 'expiresAt', 'TIMESTAMP(3)', true)
      await safeCreateIndex('Announcement', 'isActive')
      await safeCreateIndex('Announcement', 'createdAt')
      results.push('Announcement extra columns/indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`Announcement extra columns: ${msg}`)
    }

    // ── AffiliateLink table ───────────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AffiliateLink" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "name" TEXT NOT NULL,
          "platform" TEXT NOT NULL DEFAULT '',
          "url" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "description" TEXT NOT NULL DEFAULT '',
          "category" TEXT NOT NULL DEFAULT '',
          "imageUrl" TEXT NOT NULL DEFAULT '',
          "price" INTEGER NOT NULL DEFAULT 0,
          "originalPrice" INTEGER NOT NULL DEFAULT 0,
          "clicks" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('AffiliateLink table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AffiliateLink table: ${msg}`)
    }

    try {
      await safeCreateIndex('AffiliateLink', 'slug', true)
      await safeCreateIndex('AffiliateLink', 'isActive')
      await safeCreateIndex('AffiliateLink', 'category')
      await safeCreateIndex('AffiliateLink', 'sortOrder')
      results.push('AffiliateLink indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AffiliateLink indexes: ${msg}`)
    }

    // ── PhoneVerification table ──────────────────────────────
    try {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PhoneVerification" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "phone" TEXT NOT NULL,
          "otp" TEXT NOT NULL,
          "purpose" TEXT NOT NULL DEFAULT 'signup',
          "verified" BOOLEAN NOT NULL DEFAULT false,
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "PhoneVerification_pkey" PRIMARY KEY ("id")
        )
      `)
      results.push('PhoneVerification table: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`PhoneVerification table: ${msg}`)
    }

    try {
      await safeCreateIndex('PhoneVerification', 'phone')
      await safeCreateIndex('PhoneVerification', 'expiresAt')
      results.push('PhoneVerification indexes: OK')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`PhoneVerification indexes: ${msg}`)
    }

    // ── AetherTask seed data ──────────────────────────────────
    try {
      const taskCount: { count: number }[] = await db.$queryRawUnsafe(`
        SELECT COUNT(*)::int as count FROM "AetherTask"
      `)
      if (taskCount[0]?.count === 0) {
        const tasks = [
          // Daily tasks
          { task_key: 'daily_login', title: 'Daily Login', description: 'Open the app today', reward_amount: 5, category: 'daily', reset_type: 'daily', affiliate_url: null, display_order: 1 },
          { task_key: 'view_tournament', title: 'View Tournament', description: 'View any tournament details', reward_amount: 3, category: 'daily', reset_type: 'daily', affiliate_url: null, display_order: 2 },
          { task_key: 'check_leaderboard', title: 'Check Leaderboard', description: 'Visit the leaderboard page', reward_amount: 3, category: 'daily', reset_type: 'daily', affiliate_url: null, display_order: 3 },
          // Tournament tasks
          { task_key: 'register_tournament', title: 'Register for Tournament', description: 'Register for any tournament', reward_amount: 10, category: 'tournament', reset_type: 'one_time', affiliate_url: null, display_order: 4 },
          { task_key: 'play_tournament', title: 'Play a Tournament', description: 'Complete a tournament match', reward_amount: 25, category: 'tournament', reset_type: 'one_time', affiliate_url: null, display_order: 5 },
          { task_key: 'win_tournament', title: 'Win a Tournament', description: 'Win 1st place in a tournament', reward_amount: 100, category: 'tournament', reset_type: 'one_time', affiliate_url: null, display_order: 6 },
          { task_key: 'win_2nd_place', title: 'Win 2nd Place', description: 'Get 2nd place in a tournament', reward_amount: 60, category: 'tournament', reset_type: 'one_time', affiliate_url: null, display_order: 7 },
          { task_key: 'win_3rd_place', title: 'Win 3rd Place', description: 'Get 3rd place in a tournament', reward_amount: 40, category: 'tournament', reset_type: 'one_time', affiliate_url: null, display_order: 8 },
          // Engagement tasks
          { task_key: 'complete_profile', title: 'Complete Profile', description: 'Add bio and avatar to your profile', reward_amount: 15, category: 'engagement', reset_type: 'one_time', affiliate_url: null, display_order: 9 },
          { task_key: 'refer_friend', title: 'Refer a Friend', description: 'Share referral link, friend signs up', reward_amount: 30, category: 'engagement', reset_type: 'one_time', affiliate_url: null, display_order: 10 },
          { task_key: 'streak_7', title: '7-Day Streak', description: 'Log in 7 consecutive days', reward_amount: 50, category: 'engagement', reset_type: 'one_time', affiliate_url: null, display_order: 11 },
          { task_key: 'streak_30', title: '30-Day Streak', description: 'Log in 30 consecutive days', reward_amount: 200, category: 'engagement', reset_type: 'one_time', affiliate_url: null, display_order: 12 },
          // Affiliate tasks
          { task_key: 'try_bgmi', title: 'Try BGMI', description: 'Download BGMI via our affiliate link', reward_amount: 20, category: 'affiliate', reset_type: 'one_time', affiliate_url: 'https://www.codashop.com/in/bgmi', display_order: 13 },
          { task_key: 'try_freefire', title: 'Try Free Fire', description: 'Download Free Fire via our affiliate link', reward_amount: 20, category: 'affiliate', reset_type: 'one_time', affiliate_url: 'https://www.codashop.com/in/freefire', display_order: 14 },
          { task_key: 'try_codm', title: 'Try COD Mobile', description: 'Download COD Mobile via our affiliate link', reward_amount: 20, category: 'affiliate', reset_type: 'one_time', affiliate_url: 'https://www.codashop.com/in/call-of-duty-mobile', display_order: 15 },
          { task_key: 'try_clashroyale', title: 'Try Clash Royale', description: 'Download Clash Royale via our affiliate link', reward_amount: 15, category: 'affiliate', reset_type: 'one_time', affiliate_url: 'https://www.codashop.com/in/clash-royale', display_order: 16 },
          { task_key: 'try_valorant', title: 'Try Valorant Mobile', description: 'Download Valorant Mobile via our affiliate link', reward_amount: 15, category: 'affiliate', reset_type: 'one_time', affiliate_url: 'https://www.codashop.com/in/valorant-mobile', display_order: 17 },
        ]

        for (const t of tasks) {
          await db.$executeRawUnsafe(`
            INSERT INTO "AetherTask" ("task_key", "title", "description", "reward_amount", "category", "reset_type", "affiliate_url", "display_order")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, t.task_key, t.title, t.description, t.reward_amount, t.category, t.reset_type, t.affiliate_url, t.display_order)
        }
        results.push(`AetherTask seed: inserted ${tasks.length} tasks`)
      } else {
        results.push('AetherTask seed: already has data, skipping')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`AetherTask seed: ${msg}`)
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
