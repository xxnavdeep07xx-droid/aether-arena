import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, getSessionCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  // Parse body ONCE before any try/catch that might retry
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body. Please check your input and try again.' },
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
    const msg = error instanceof Error ? error.message : 'Unknown error'

    // Classify the error for a helpful user-facing message
    // Use SPECIFIC patterns only — avoid broad words like 'connect' or 'relation'
    const isTableMissing = msg.includes('"AccountCredential"') ||
      msg.includes('accountcredential') ||
      msg.includes('does not exist')

    const isDbConnection = msg.includes('ECONNREFUSED') ||
      msg.includes('ENOTFOUND') ||
      msg.includes('could not connect') ||
      msg.includes('Connection refused') ||
      msg.includes('Unable to connect') ||
      msg.includes('P1001') ||
      msg.includes('P1000')

    if (isTableMissing || isDbConnection) {
      // Try to trigger database setup
      console.log('Database issue detected — triggering setup...')
      try {
        const setupUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/setup`
        const setupHeaders: Record<string, string> = {}
        if (process.env.SETUP_SECRET) {
          setupHeaders['Authorization'] = `Bearer ${process.env.SETUP_SECRET}`
        }
        await fetch(setupUrl, { headers: setupHeaders }).catch(() => {})
      } catch {
        // Setup call failed, continue to user error
      }
      return NextResponse.json(
        { error: 'Service is starting up. Please try again in a few seconds.' },
        { status: 503 }
      )
    }

    // Return the actual error for debugging — will be cleaned up once issue is resolved
    return NextResponse.json(
      { error: `Login failed: ${msg}` },
      { status: 500 }
    )
  }
}
