import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, getSessionCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

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

    // If the AccountCredential table doesn't exist, trigger setup and retry once
    if (msg.includes('"AccountCredential"') || msg.includes('accountcredential') || msg.includes('does not exist') || msg.includes('relation')) {
      console.log('AccountCredential table may be missing — triggering setup...')
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/setup`).catch(() => {})
        // Try the login again after setup
        const body = await request.json()
        const { email, password } = body
        const cred = await db.accountCredential.findUnique({
          where: { email: email.toLowerCase() },
          include: { user: true },
        })
        if (!cred) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }
        if (cred.user.isBanned) {
          return NextResponse.json({ error: 'Account has been banned' }, { status: 403 })
        }
        const isValid = await bcrypt.compare(password, cred.password)
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
        }
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
        const cookieOptions = getSessionCookieOptions()
        response.cookies.set(cookieOptions.name, token, {
          ...cookieOptions,
          maxAge: cookieOptions.maxAge,
        })
        return response
      } catch (retryError) {
        console.error('Login retry after setup also failed:', retryError)
        return NextResponse.json(
          { error: 'Service is starting up. Please try again in a few seconds.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
