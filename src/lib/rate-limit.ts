// Simple in-memory rate limiter for API routes
// For production, consider using Redis-based rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export function rateLimit(config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 30 }) {
  return function checkLimit(identifier: string): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + config.windowMs;
      store.set(identifier, { count: 1, resetTime });
      return { success: true, remaining: config.maxRequests - 1, resetTime };
    }

    if (entry.count >= config.maxRequests) {
      return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { success: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime };
  };
}

// Pre-configured limiters
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 }); // 10 per 15 min
export const apiLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 60 }); // 60 per min
export const strictLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 5 }); // 5 per min
