import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PgBouncer-safe: add a column if it doesn't exist
async function safeAddColumn(table: string, column: string, type: string, nullable: boolean, defaultVal?: string) {
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

async function safeCreateIndex(table: string, column: string, unique = false) {
  const idxName = `${table}_${column}_idx`
  const op = unique ? 'CREATE UNIQUE INDEX' : 'CREATE INDEX'
  await db.$executeRawUnsafe(
    `${op} IF NOT EXISTS "${idxName}" ON "${table}"("${column}")`
  )
}

/**
 * Auto-setup endpoint — ensures all required database columns exist.
 *
 * SAFE: This endpoint only adds missing columns and seed data.
 * It never drops or alters existing data.
 * No authentication required — it's idempotent and safe to call.
 */
export async function GET() {
  const results: string[] = []

  try {
    // ── AccountCredential missing columns ──────────────────────────
    try {
      await safeAddColumn('AccountCredential', 'phone', 'TEXT', true)
      await safeAddColumn('AccountCredential', 'phoneVerified', 'BOOLEAN', false, 'false')
      await safeAddColumn('AccountCredential', 'emailVerified', 'BOOLEAN', false, 'false')
      await safeAddColumn('AccountCredential', 'emailVerificationToken', 'TEXT', true)
      await safeAddColumn('AccountCredential', 'emailVerificationExpires', 'TIMESTAMP(3)', true)
      results.push('AccountCredential columns: OK')
    } catch (e: unknown) {
      results.push(`AccountCredential columns: ${e instanceof Error ? e.message : 'error'}`)
    }

    try {
      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "AccountCredential_phone_key" ON "AccountCredential"("phone") WHERE "phone" IS NOT NULL
      `)
      await safeCreateIndex('AccountCredential', 'phone')
      await safeCreateIndex('AccountCredential', 'emailVerificationToken', true)
      results.push('AccountCredential indexes: OK')
    } catch (e: unknown) {
      results.push(`AccountCredential indexes: ${e instanceof Error ? e.message : 'error'}`)
    }

    // ── Profile missing columns ────────────────────────────────────
    try {
      await safeAddColumn('Profile', 'phone', 'TEXT', true)
      await safeAddColumn('Profile', 'phoneVerified', 'BOOLEAN', false, 'false')
      await safeAddColumn('Profile', 'referredByCode', 'TEXT', true)
      await safeAddColumn('Profile', 'notification_prefs', 'JSONB', false, "'{\"pushEnabled\":true,\"tournamentAlerts\":true,\"resultUpdates\":true,\"promoOffers\":false,\"communityUpdates\":true}'")
      await safeAddColumn('Profile', 'privacy_prefs', 'JSONB', false, "'{\"profileVisibility\":\"public\",\"showLeaderboard\":true,\"showActivity\":true}'")
      await safeAddColumn('Profile', 'language', 'TEXT', false, "'en'")
      results.push('Profile columns: OK')
    } catch (e: unknown) {
      results.push(`Profile columns: ${e instanceof Error ? e.message : 'error'}`)
    }

    try {
      await safeCreateIndex('Profile', 'referredByCode')
      await safeCreateIndex('Profile', 'phone')
      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Profile_phone_key" ON "Profile"("phone") WHERE "phone" IS NOT NULL
      `)
      results.push('Profile indexes: OK')
    } catch (e: unknown) {
      results.push(`Profile indexes: ${e instanceof Error ? e.message : 'error'}`)
    }

    // ── Create missing tables if needed ────────────────────────────
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
      await safeCreateIndex('AetherTask', 'task_key', true)
      results.push('AetherTask table: OK')
    } catch (e: unknown) {
      results.push(`AetherTask table: ${e instanceof Error ? e.message : 'error'}`)
    }

    // ── AetherTask seed data ───────────────────────────────────────
    try {
      const taskCount = await db.aetherTask.count()
      if (taskCount === 0) {
        const tasks = [
          { taskKey: 'daily_login', title: 'Daily Login', description: 'Open the app today', rewardAmount: 5, category: 'daily', resetType: 'daily', affiliateUrl: null, displayOrder: 1 },
          { taskKey: 'view_tournament', title: 'View Tournament', description: 'View any tournament details', rewardAmount: 3, category: 'daily', resetType: 'daily', affiliateUrl: null, displayOrder: 2 },
          { taskKey: 'check_leaderboard', title: 'Check Leaderboard', description: 'Visit the leaderboard page', rewardAmount: 3, category: 'daily', resetType: 'daily', affiliateUrl: null, displayOrder: 3 },
          { taskKey: 'register_tournament', title: 'Register for Tournament', description: 'Register for any tournament', rewardAmount: 10, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 4 },
          { taskKey: 'play_tournament', title: 'Play a Tournament', description: 'Complete a tournament match', rewardAmount: 25, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 5 },
          { taskKey: 'win_tournament', title: 'Win a Tournament', description: 'Win 1st place in a tournament', rewardAmount: 100, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 6 },
          { taskKey: 'win_2nd_place', title: 'Win 2nd Place', description: 'Get 2nd place in a tournament', rewardAmount: 60, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 7 },
          { taskKey: 'win_3rd_place', title: 'Win 3rd Place', description: 'Get 3rd place in a tournament', rewardAmount: 40, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 8 },
          { taskKey: 'complete_profile', title: 'Complete Profile', description: 'Add bio and avatar to your profile', rewardAmount: 15, category: 'engagement', resetType: 'one_time', affiliateUrl: null, displayOrder: 9 },
          { taskKey: 'refer_friend', title: 'Refer a Friend', description: 'Share referral link, friend signs up', rewardAmount: 30, category: 'engagement', resetType: 'one_time', affiliateUrl: null, displayOrder: 10 },
          { taskKey: 'streak_7', title: '7-Day Streak', description: 'Log in 7 consecutive days', rewardAmount: 50, category: 'engagement', resetType: 'one_time', affiliateUrl: null, displayOrder: 11 },
          { taskKey: 'streak_30', title: '30-Day Streak', description: 'Log in 30 consecutive days', rewardAmount: 200, category: 'engagement', resetType: 'one_time', affiliateUrl: null, displayOrder: 12 },
          { taskKey: 'try_bgmi', title: 'Try BGMI', description: 'Download BGMI via our affiliate link', rewardAmount: 20, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/bgmi', displayOrder: 13 },
          { taskKey: 'try_freefire', title: 'Try Free Fire', description: 'Download Free Fire via our affiliate link', rewardAmount: 20, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/freefire', displayOrder: 14 },
          { taskKey: 'try_codm', title: 'Try COD Mobile', description: 'Download COD Mobile via our affiliate link', rewardAmount: 20, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/call-of-duty-mobile', displayOrder: 15 },
          { taskKey: 'try_clashroyale', title: 'Try Clash Royale', description: 'Download Clash Royale via our affiliate link', rewardAmount: 15, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/clash-royale', displayOrder: 16 },
          { taskKey: 'try_valorant', title: 'Try Valorant Mobile', description: 'Download Valorant Mobile via our affiliate link', rewardAmount: 15, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/valorant-mobile', displayOrder: 17 },
        ]
        for (const t of tasks) {
          await db.aetherTask.upsert({
            where: { taskKey: t.taskKey },
            create: t,
            update: {},
          })
        }
        results.push(`AetherTask seed: inserted ${tasks.length} tasks`)
      } else {
        results.push(`AetherTask seed: already has ${taskCount} tasks, skipping`)
      }
    } catch (e: unknown) {
      results.push(`AetherTask seed: ${e instanceof Error ? e.message : 'error'}`)
    }

    // ── AetherTaskProgress missing columns ─────────────────────────
    try {
      await safeAddColumn('AetherTaskProgress', 'reset_date', 'DATE', true)
      results.push('AetherTaskProgress columns: OK')
    } catch (e: unknown) {
      results.push(`AetherTaskProgress columns: ${e instanceof Error ? e.message : 'error'}`)
    }

    // ── TopupPack missing columns ──────────────────────────────────
    try {
      await safeAddColumn('TopupPack', 'imageUrl', 'TEXT', false, "''")
      await safeAddColumn('TopupPack', 'affiliateUrl', 'TEXT', false, "''")
      await safeAddColumn('TopupPack', 'description', 'TEXT', false, "''")
      await safeAddColumn('TopupPack', 'originalPrice', 'INTEGER', false, '0')
      results.push('TopupPack columns: OK')
    } catch (e: unknown) {
      results.push(`TopupPack columns: ${e instanceof Error ? e.message : 'error'}`)
    }

    // ── Announcement missing columns ───────────────────────────────
    try {
      await safeAddColumn('Announcement', 'createdById', 'TEXT', true)
      await safeAddColumn('Announcement', 'expiresAt', 'TIMESTAMP(3)', true)
      results.push('Announcement columns: OK')
    } catch (e: unknown) {
      results.push(`Announcement columns: ${e instanceof Error ? e.message : 'error'}`)
    }

    return NextResponse.json({ success: true, results })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg, results }, { status: 500 })
  }
}
