import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ── Simple in-memory rate limiter ──────────────────────────────────────
// Tracks request counts per IP. Resets every RATE_WINDOW_MS milliseconds.
const RATE_WINDOW_MS = 60_000 // 1 minute
const RATE_MAX_REQUESTS = 30   // 30 requests per minute per IP

const ipCounts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }

  entry.count++
  if (entry.count > RATE_MAX_REQUESTS) {
    return true
  }
  return false
}

// Periodically purge stale entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of ipCounts) {
      if (now > entry.resetAt) ipCounts.delete(ip)
    }
  }, RATE_WINDOW_MS)
}

// Public settings that are safe to expose without authentication
// NOTE: gpay_number and gpay_upi_id are NOT included here — they are only
// visible to authenticated admins via /api/admin/settings. Users see
// payment instructions without any bank/account details as per privacy policy.
const PUBLIC_KEYS = new Set([
  'site_name',
  'youtube_channel_url',
  'instagram_url',
  'discord_invite_url',
  'whatsapp_channel_url',
  'twitter_url',
  'gpay_payment_enabled',  // boolean flag — whether GPay payments are active
  'razorpay_coming_soon',
  'maintenance_mode',
  'maintenance_message',
  'seo_description',
  'seo_og_image',
])

export async function GET(request: Request) {
  // ── Rate limiting ────────────────────────────────────────────────
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  // ── Fetch public settings ────────────────────────────────────────
  try {
    const settings = await db.platformSetting.findMany({
      where: { key: { in: Array.from(PUBLIC_KEYS) } },
    })

    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      // Extra safety: never leak payment credentials even if somehow in the DB result
      if (setting.key === 'gpay_number' || setting.key === 'gpay_upi_id' || setting.key === 'razorpay_key_secret' || setting.key === 'razorpay_key_id') {
        continue
      }
      settingsMap[setting.key] = setting.value
    }

    // Default: if gpay_payment_enabled is not set, check if gpay_number exists
    // to determine if GPay is available (without exposing the number)
    if (!settingsMap['gpay_payment_enabled']) {
      const gpayNumber = await db.platformSetting.findUnique({ where: { key: 'gpay_number' } })
      settingsMap['gpay_payment_enabled'] = gpayNumber?.value ? 'true' : 'false'
    }

    return NextResponse.json({ settings: settingsMap }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ settings: {} })
  }
}
