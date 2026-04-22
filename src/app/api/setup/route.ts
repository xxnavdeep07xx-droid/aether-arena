import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Database setup endpoint — creates missing tables/columns and seeds data.
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

    // ── Seed top-up packs if table is empty ─────────────────────
    try {
      const countResult: { count: number }[] = await db.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "TopupPack"`)
      const rowCount = countResult[0]?.count || 0

      if (rowCount === 0) {
        const packs = [
          { id: 'tp_bgmi_uc60', gameName: 'BGMI', gameSlug: 'bgmi', packName: '60 UC', description: '60 Unknown Cash for in-game purchases', price: 75, originalPrice: 80, affiliateUrl: 'https://www.codashop.com/in/bgmi', isPopular: false, sortOrder: 1 },
          { id: 'tp_bgmi_uc325', gameName: 'BGMI', gameSlug: 'bgmi', packName: '325 UC', description: '325 Unknown Cash — most popular top-up', price: 400, originalPrice: 430, affiliateUrl: 'https://www.codashop.com/in/bgmi', isPopular: true, sortOrder: 2 },
          { id: 'tp_bgmi_uc660', gameName: 'BGMI', gameSlug: 'bgmi', packName: '660 UC', description: '660 Unknown Cash for premium items', price: 800, originalPrice: 850, affiliateUrl: 'https://www.codashop.com/in/bgmi', isPopular: true, sortOrder: 3 },
          { id: 'tp_ff_100d', gameName: 'Free Fire', gameSlug: 'free-fire', packName: '100 Diamonds', description: '100 Diamonds for skins and characters', price: 80, originalPrice: 90, affiliateUrl: 'https://www.codashop.com/in/freefire', isPopular: false, sortOrder: 4 },
          { id: 'tp_ff_310d', gameName: 'Free Fire', gameSlug: 'free-fire', packName: '310 Diamonds', description: '310 Diamonds — best value pack', price: 240, originalPrice: 260, affiliateUrl: 'https://www.codashop.com/in/freefire', isPopular: true, sortOrder: 5 },
          { id: 'tp_ff_520d', gameName: 'Free Fire', gameSlug: 'free-fire', packName: '520 Diamonds', description: '520 Diamonds for elite pass and bundles', price: 400, originalPrice: 430, affiliateUrl: 'https://www.codashop.com/in/freefire', isPopular: true, sortOrder: 6 },
          { id: 'tp_codm_80cp', gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '80 CP', description: '80 COD Points for battle pass tiers', price: 75, originalPrice: 80, affiliateUrl: 'https://www.codashop.com/in/call-of-duty-mobile', isPopular: false, sortOrder: 7 },
          { id: 'tp_codm_400cp', gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '400 CP', description: '400 COD Points — premium weapon skins', price: 380, originalPrice: 400, affiliateUrl: 'https://www.codashop.com/in/call-of-duty-mobile', isPopular: true, sortOrder: 8 },
          { id: 'tp_cr_80g', gameName: 'Clash Royale', gameSlug: 'clash-royale', packName: '80 Gems', description: '80 Gems for chests and challenges', price: 75, originalPrice: 80, affiliateUrl: 'https://www.codashop.com/in/clash-royale', isPopular: false, sortOrder: 9 },
          { id: 'tp_cr_500g', gameName: 'Clash Royale', gameSlug: 'clash-royale', packName: '500 Gems', description: '500 Gems — unlock legendary chest', price: 450, originalPrice: 500, affiliateUrl: 'https://www.codashop.com/in/clash-royale', isPopular: true, sortOrder: 10 },
        ]

        for (const pack of packs) {
          await db.$executeRawUnsafe(
            `INSERT INTO "TopupPack" ("id","gameName","gameSlug","packName","description","price","originalPrice","imageUrl","affiliateUrl","isPopular","isActive","sortOrder") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT ("id") DO NOTHING`,
            pack.id, pack.gameName, pack.gameSlug, pack.packName, pack.description, pack.price, pack.originalPrice, '', pack.affiliateUrl, pack.isPopular, true, pack.sortOrder
          )
        }
        results.push(`Seeded ${packs.length} top-up packs`)
      } else {
        results.push(`TopupPack already has ${rowCount} rows`)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'error'
      results.push(`Seed topup packs: ${msg}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
