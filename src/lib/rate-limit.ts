// Distributed rate limiter using Vercel KV (Redis)
// Falls back to in-memory rate limiting for local development
// On Vercel, this works across ALL serverless function instances

import { kv } from '@vercel/kv'

// ─── In-Memory Fallback (for local dev) ──────────────────────

interface RateLimitEntry {
  count: number
  resetTime: number
}

const memoryStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// ─── Config ───────────────────────────────────────────────────

export interface RateLimitConfig {
  windowMs: number   // Time window in milliseconds
  maxRequests: number // Max requests per window
}

// ─── Main Rate Limit Function ─────────────────────────────────

export function rateLimit(config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 30 }) {
  return function checkLimit(identifier: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    // Use Vercel KV in production, in-memory fallback for local dev
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      return kvRateLimit(identifier, config)
    }
    return Promise.resolve(memoryRateLimit(identifier, config))
  }
}

// ─── Vercel KV Implementation ─────────────────────────────────
// Uses a Lua script for atomic fixed-window rate limiting.
// The expiry is only set on the first request (count=1), so the
// window doesn't slide on subsequent requests. This prevents
// attackers from bypassing the limit by pacing requests.

const RATE_LIMIT_SCRIPT = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  local ttl = redis.call('TTL', KEYS[1])
  return { count, ttl }
`

async function kvRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const key = `ratelimit:${identifier}`
  const windowSeconds = Math.ceil(config.windowMs / 1000)
  const now = Date.now()

  try {
    // Atomic Lua script: INCR + conditional EXPIRE + get TTL
    const result = await kv.eval(RATE_LIMIT_SCRIPT, [key], [windowSeconds]) as [number, number]
    const count = result[0]
    const ttl = result[1]

    // Compute actual reset time from TTL
    // TTL is in seconds; -1 = no expiry (shouldn't happen), -2 = key doesn't exist
    const resetTime = ttl > 0
      ? now + (ttl * 1000)
      : now + config.windowMs // fallback

    if (count > config.maxRequests) {
      return { success: false, remaining: 0, resetTime }
    }

    return { success: true, remaining: config.maxRequests - count, resetTime }
  } catch (error) {
    // If KV fails, fall back to in-memory to avoid blocking requests
    console.error('KV rate limit error, falling back to memory:', error)
    return memoryRateLimit(identifier, config)
  }
}

// ─── In-Memory Implementation ─────────────────────────────────

function memoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = memoryStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs
    memoryStore.set(identifier, { count: 1, resetTime })
    return { success: true, remaining: config.maxRequests - 1, resetTime }
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return { success: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime }
}

// ─── Pre-configured Limiters ──────────────────────────────────

export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 })   // 10 per 15 min
export const apiLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 60 })          // 60 per min
export const strictLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 5 })        // 5 per min
