import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, getSessionCookieOptions } from '@/lib/auth'
import { authLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk, remaining } = authLimiter(`login:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Parse body ONCE before any try/catch
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  try {
    // Find credential
    const cred = await db.accountCredential.findUnique({
      where: { email: email.toLowerCase() },
      include: { user: true },
    })

    if (!cred) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if banned
    if (cred.user.isBanned) {
      return NextResponse.json(
        { error: 'Account has been banned' },
        { status: 403 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, cred.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Clean up old sessions and create new one
    await db.session.deleteMany({ where: { userId: cred.userId } })
    const token = await createSession(cred.userId)

    const response = NextResponse.json({
      user: {
        id: cred.user.id,
        username: cred.user.username,
        displayName: cred.user.displayName,
        avatarUrl: cred.user.avatarUrl,
        email: cred.email,
        isAdmin: cred.user.isAdmin,
      },
    })

    // Set session cookie
    const cookieOptions = getSessionCookieOptions()
    response.cookies.set(cookieOptions.name, token, {
      ...cookieOptions,
      maxAge: cookieOptions.maxAge,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Login failed: ${msg}` },
      { status: 500 }
    )
  }
}
