import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, getSessionCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, username, displayName } = body

    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Validate username
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      )
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingCred = await db.accountCredential.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existingCred) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingUser = await db.profile.findUnique({
      where: { username },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if first user and create profile atomically to prevent race condition
    const profile = await db.$transaction(async (tx) => {
      const userCount = await tx.profile.count()
      const isAdmin = userCount === 0

      return tx.profile.create({
        data: {
          username,
          displayName: displayName || username,
          isAdmin,
          credentials: {
            create: {
              email: email.toLowerCase(),
              password: hashedPassword,
            },
          },
        },
        include: {
          credentials: {
            select: { email: true },
          },
        },
      })
    })

    // Create session
    const token = await createSession(profile.id)

    // Build response
    const response = NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        email: profile.credentials?.email,
        isAdmin: profile.isAdmin,
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
    console.error('Register error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    // If it's a unique constraint violation, give a helpful error
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
