import { type NextRequest, NextResponse } from 'next/server'

// Next.js 16 proxy convention — replaces deprecated middleware.ts
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    const sessionCookie = request.cookies.get('aether_session')
    if (!sessionCookie?.value || sessionCookie.value.length < 10) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
