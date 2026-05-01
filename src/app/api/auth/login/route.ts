import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, getSessionCookieOptions } from '@/lib/auth'
import { authLimiter } from '@/lib/rate-limit';

// Per-account lockout: after 5 failed attempts, lock for 15 minutes
const MAX_FAILED_ATTEMPTS = 5
const ACCOUNT_LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

// Generic error message to prevent account enumeration
const INVALID_CREDENTIALS_MSG = 'Invalid credentials. Please check your login details and try again.'

export async function POST(request: Request) {
  // Rate limiting per IP
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await authLimiter(`login:${clientIp}`);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cred: any = null;
    let resolvedKey = ''; // key for per-account lockout tracking
    const trimmedIdentifier = resolvedIdentifier.trim();

    // Try to find credential by email, username, or phone
    // 1. Try email lookup
    if (trimmedIdentifier.includes('@')) {
      resolvedKey = `login_acct:${trimmedIdentifier.toLowerCase()}`
      cred = await db.accountCredential.findUnique({
        where: { email: trimmedIdentifier.toLowerCase() },
        include: { user: true },
      });
    }

    // 2. Try phone lookup
    if (!cred && /^\d{10}$/.test(trimmedIdentifier.replace(/\D/g, ''))) {
      const cleanPhone = trimmedIdentifier.replace(/\D/g, '');
      resolvedKey = `login_acct:phone:${cleanPhone}`
      cred = await db.accountCredential.findUnique({
        where: { phone: cleanPhone },
        include: { user: true },
      });
    }

    // 3. Try username lookup
    if (!cred) {
      resolvedKey = `login_acct:user:${trimmedIdentifier.toLowerCase()}`
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

    // Per-account brute-force lockout check
    // Even if account doesn't exist, we still check the lockout to prevent enumeration
    const { success: accountRateOk } = await authLimiter(resolvedKey);
    if (!accountRateOk) {
      return NextResponse.json(
        { error: 'Too many failed attempts for this account. Please try again later.' },
        { status: 429 }
      );
    }

    if (!cred) {
      // Use same generic message — don't reveal whether account exists
      return NextResponse.json(
        { error: INVALID_CREDENTIALS_MSG },
        { status: 401 }
      )
    }

    // Check if banned — use generic message to avoid confirming account existence
    if (cred.user.isBanned) {
      return NextResponse.json(
        { error: INVALID_CREDENTIALS_MSG },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, cred.password)
    if (!isValid) {
      // Increment the per-account failed attempt counter
      // The authLimiter will track this — after MAX_FAILED_ATTEMPTS it will block
      await authLimiter(resolvedKey)

      // Use same generic message — don't reveal that the account was found
      return NextResponse.json(
        { error: INVALID_CREDENTIALS_MSG },
        { status: 401 }
      )
    }

    // Login successful — reset per-account lockout counter by consuming remaining quota
    // (The authLimiter window will expire naturally, no need to explicitly reset)

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
        emailVerified: cred.emailVerified ?? false,
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
    return NextResponse.json(
      { error: 'Login failed. Please try again later.' },
      { status: 500 }
    )
  }
}
