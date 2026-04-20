import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// One-time database setup — creates missing tables/columns and seeds data.
// This is needed because prisma db push cannot be run from Vercel.
// After successful setup, this endpoint returns current DB status.
export async function GET() {
  try {
    const results: string[] = []

    // 1. Add bannerImageUrl column to Tournament table if missing
    try {
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'Tournament' AND column_name = 'bannerImageUrl'
          ) THEN
            ALTER TABLE "Tournament" ADD COLUMN "bannerImageUrl" TEXT NOT NULL DEFAULT '';
          END IF;
        END $$
      `)
      results.push('Tournament.bannerImageUrl: OK')
    } catch (e: any) {
      results.push(`Tournament.bannerImageUrl: ${e.message || 'error'}`)
    }

    // 2. Create TopupPack table if missing
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
        );
      `)
      results.push('TopupPack table: OK')
    } catch (e: any) {
      results.push(`TopupPack table: ${e.message || 'error'}`)
    }

    // 3. Create indexes for TopupPack
    try {
      await db.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "TopupPack_gameSlug_idx" ON "TopupPack"("gameSlug");
        CREATE INDEX IF NOT EXISTS "TopupPack_isActive_idx" ON "TopupPack"("isActive");
        CREATE INDEX IF NOT EXISTS "TopupPack_sortOrder_idx" ON "TopupPack"("sortOrder");
      `)
      results.push('TopupPack indexes: OK')
    } catch (e: any) {
      results.push(`TopupPack indexes: ${e.message || 'error'}`)
    }

    // 4. Seed top-up packs if table is empty
    try {
      const countResult: any[] = await db.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "TopupPack"`)
      const rowCount = countResult[0]?.count || 0

      if (rowCount === 0) {
        const packs = [
          // BGMI
          { id: 'tp_bgmi_uc60', gameName: 'BGMI', gameSlug: 'bgmi', packName: '60 UC', description: '60 Unknown Cash for in-game purchases', price: 75, originalPrice: 80, affiliateUrl: 'https://www.codashop.com/in/bgmi', isPopular: false, sortOrder: 1 },
          { id: 'tp_bgmi_uc325', gameName: 'BGMI', gameSlug: 'bgmi', packName: '325 UC', description: '325 Unknown Cash — most popular top-up', price: 400, originalPrice: 430, affiliateUrl: 'https://www.codashop.com/in/bgmi', isPopular: true, sortOrder: 2 },
          { id: 'tp_bgmi_uc660', gameName: 'BGMI', gameSlug: 'bgmi', packName: '660 UC', description: '660 Unknown Cash for premium items', price: 800, originalPrice: 850, affiliateUrl: 'https://www.codashop.com/in/bgmi', isPopular: true, sortOrder: 3 },

          // Free Fire
          { id: 'tp_ff_100d', gameName: 'Free Fire', gameSlug: 'free-fire', packName: '100 Diamonds', description: '100 Diamonds for skins and characters', price: 80, originalPrice: 90, affiliateUrl: 'https://www.codashop.com/in/freefire', isPopular: false, sortOrder: 4 },
          { id: 'tp_ff_310d', gameName: 'Free Fire', gameSlug: 'free-fire', packName: '310 Diamonds', description: '310 Diamonds — best value pack', price: 240, originalPrice: 260, affiliateUrl: 'https://www.codashop.com/in/freefire', isPopular: true, sortOrder: 5 },
          { id: 'tp_ff_520d', gameName: 'Free Fire', gameSlug: 'free-fire', packName: '520 Diamonds', description: '520 Diamonds for elite pass and bundles', price: 400, originalPrice: 430, affiliateUrl: 'https://www.codashop.com/in/freefire', isPopular: true, sortOrder: 6 },

          // COD Mobile
          { id: 'tp_codm_80cp', gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '80 CP', description: '80 COD Points for battle pass tiers', price: 75, originalPrice: 80, affiliateUrl: 'https://www.codashop.com/in/call-of-duty-mobile', isPopular: false, sortOrder: 7 },
          { id: 'tp_codm_400cp', gameName: 'COD Mobile', gameSlug: 'cod-mobile', packName: '400 CP', description: '400 COD Points — premium weapon skins', price: 380, originalPrice: 400, affiliateUrl: 'https://www.codashop.com/in/call-of-duty-mobile', isPopular: true, sortOrder: 8 },

          // Clash Royale
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
    } catch (e: any) {
      results.push(`Seed topup packs: ${e.message || 'error'}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
