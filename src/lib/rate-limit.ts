// Distributed rate limiter using Redis (ioredis)
// Falls back to in-memory rate limiting for local development
// On Vercel, this works across ALL serverless function instances

import Redis from 'ioredis'

// ─── Redis Connection (lazy singleton) ────────────────────────
// Supports both Vercel KV env vars AND pure Redis env vars

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  if (typeof window !== 'undefined') return null // don't run on client

  // Try Vercel KV env vars first (Upstash REST API compatible)
  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN
  if (kvUrl && kvToken) {
    // Vercel KV uses Upstash REST API — ioredis can connect via REDIS_URL
    // The KV_REST_API_URL is like https://xxx.upstash.io
    // We need the native Redis URL instead: rediss://default:token@xxx.upstash.io:6379
    const host = kvUrl.replace('https://', '').replace('.upstash.io', '')
    redis = new Redis({
      host: `${host}.upstash.io`,
      port: 6379,
      password: kvToken,
      tls: { servername: `${host}.upstash.io` },
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    })
    return redis
  }

  // Try pure Redis URL (redis:// or rediss://)
  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    })
    return redis
  }

  // Try individual Redis env vars (Vercel's pure Redis integration)
  const redisHost = process.env.REDIS_HOST
  const redisPort = process.env.REDIS_PORT
  const redisPassword = process.env.REDIS_PASSWORD
  if (redisHost) {
    redis = new Redis({
      host: redisHost,
      port: redisPort ? parseInt(redisPort, 10) : 6379,
      password: redisPassword || undefined,
      tls: redisUrl?.startsWith('rediss://') ? {} : undefined,
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    })
    return redis
  }

  return null // No Redis configured — use in-memory fallback
}

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
  return async function checkLimit(identifier: string): Promise<{ success: boolean; remaining: number; resetTime: number }> {
    const client = getRedis()
    if (client) {
      return redisRateLimit(client, identifier, config)
    }
    return memoryRateLimit(identifier, config)
  }
}

// ─── Redis Implementation ─────────────────────────────────────
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

async function redisRateLimit(
  client: Redis,
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const key = `ratelimit:${identifier}`
  const windowSeconds = Math.ceil(config.windowMs / 1000)
  const now = Date.now()

  try {
    // Atomic Lua script: INCR + conditional EXPIRE + get TTL
    const result = await client.eval(RATE_LIMIT_SCRIPT, 1, key, windowSeconds) as [number, number]
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
    // If Redis fails, fall back to in-memory to avoid blocking requests
    console.error('Redis rate limit error, falling back to memory:', error)
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
