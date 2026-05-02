import { type NextRequest, NextResponse } from 'next/server'

// Next.js middleware — validates admin API routes and adds CSRF protection.
// Actual admin role verification happens in each route handler via requireAdmin().
export function middleware(request: NextRequest) {
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

  // CSRF Protection for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const host = request.headers.get('host') || request.headers.get('x-forwarded-host')

    // Allow if no origin/referer (mobile apps, server-to-server) but has session cookie
    // Block if origin/referer exists but doesn't match our domain
    const sourceUrl = origin || referer
    if (sourceUrl && host) {
      // Parse the origin to extract the hostname for strict comparison
      // This prevents bypasses like evil-aether-arena.com matching aether-arena.com
      try {
        const sourceHost = new URL(sourceUrl).hostname
        const isExactMatch = sourceHost === host
        const isSubdomainMatch = sourceHost.endsWith(`.${host}`)
        if (!isExactMatch && !isSubdomainMatch) {
          return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 })
        }
      } catch {
        // Invalid URL in origin/referer header — block it
        return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
