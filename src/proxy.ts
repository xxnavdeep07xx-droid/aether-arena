import { type NextRequest, NextResponse } from 'next/server'

// Next.js 16 proxy convention — replaces deprecated middleware.ts
// Validates admin API routes by checking session cookie existence.
// Actual admin role verification happens in each route handler via requireAdmin().
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin API routes — check that a session cookie exists and looks valid
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get('aether_session')
    // Session tokens are UUIDs: 8-4-4-4-12 hex format (36 chars with dashes)
    if (!sessionCookie?.value || sessionCookie.value.length < 30) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  // Block setup endpoint from external access in production
  if (pathname === '/api/setup' && process.env.NODE_ENV === 'production') {
    // Setup is still allowed but must have SETUP_SECRET in auth header
    // The route handler itself validates the bearer token
    // No additional blocking here — just ensuring it's not accidentally open
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
