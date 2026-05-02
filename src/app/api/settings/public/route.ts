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
const PUBLIC_KEYS = new Set([
  'site_name',
  'youtube_channel_url',
  'instagram_url',
  'discord_invite_url',
  'whatsapp_channel_url',
  'twitter_url',
  'gpay_number',
  'gpay_upi_id',
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
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({ settings: settingsMap })
  } catch {
    return NextResponse.json({ settings: {} })
  }
}
