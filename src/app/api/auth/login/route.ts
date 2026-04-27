import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, getSessionCookieOptions } from '@/lib/auth'
import { authLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = authLimiter(`login:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Parse body ONCE before any try/catch
  let body: { identifier?: string; email?: string; username?: string; phone?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { identifier, email, username, phone, password } = body

  if (!password) {
    return NextResponse.json(
      { error: 'Password is required' },
      { status: 400 }
    )
  }

  // Resolve the identifier - could be email, username, or phone
  // Accept both `identifier` field and individual fields
  const resolvedIdentifier = identifier || email || username || phone;

  if (!resolvedIdentifier) {
    return NextResponse.json(
      { error: 'Email, username, or phone number is required' },
      { status: 400 }
    )
  }

  try {
    let cred = null;
    const trimmedIdentifier = resolvedIdentifier.trim();

    // Try to find credential by email, username, or phone
    // 1. Try email lookup
    if (trimmedIdentifier.includes('@')) {
      cred = await db.accountCredential.findUnique({
        where: { email: trimmedIdentifier.toLowerCase() },
        include: { user: true },
      });
    }

    // 2. Try phone lookup
    if (!cred && /^\d{10}$/.test(trimmedIdentifier.replace(/\D/g, ''))) {
      const cleanPhone = trimmedIdentifier.replace(/\D/g, '');
      cred = await db.accountCredential.findUnique({
        where: { phone: cleanPhone },
        include: { user: true },
      });
    }

    // 3. Try username lookup
    if (!cred) {
      const userProfile = await db.profile.findUnique({
        where: { username: trimmedIdentifier.toLowerCase() },
        include: { credentials: true },
      });
      if (userProfile?.credentials) {
        cred = {
          ...userProfile.credentials,
          user: userProfile,
        };
      }
    }

    if (!cred) {
      return NextResponse.json(
        { error: 'Invalid credentials. Check your email, username, or phone number.' },
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
        { error: 'Invalid password' },
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
        phone: cred.user.phone || cred.phone,
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
