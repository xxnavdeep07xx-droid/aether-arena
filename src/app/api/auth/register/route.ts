import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, getSessionCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  // Parse body ONCE before any try/catch
  let body: { email?: string; password?: string; username?: string; displayName?: string; ref?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { email, password, username, displayName, ref } = body

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

  try {
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

    // Create profile with credential atomically
    const profile = await db.$transaction(async (tx) => {
      const userCount = await tx.profile.count()
      const isAdmin = userCount === 0

      const created = tx.profile.create({
        data: {
          username,
          displayName: displayName || username,
          isAdmin,
          referredByCode: ref || null,
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

      // Wait for the profile to be created before creating related records
      const profile = await created

      // Create AetherBalance with 50 welcome bonus
      await tx.aetherBalance.create({
        data: {
          userId: profile.id,
          balance: 50,
          totalEarned: 50,
          totalRedeemed: 0,
        },
      })

      // Create welcome bonus transaction
      await tx.aetherTransaction.create({
        data: {
          userId: profile.id,
          type: 'bonus',
          source: 'welcome_bonus',
          description: 'Welcome Bonus! 50 Aether to get you started',
          amount: 50,
          balanceAfter: 50,
        },
      })

      // Create UserStreak with current streak 1
      await tx.userStreak.create({
        data: {
          userId: profile.id,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: new Date(),
        },
      })

      // Auto-complete daily_login task for today
      const now = new Date()
      const istOffset = 5.5 * 60 * 60 * 1000
      const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000
      const ist = new Date(utc + istOffset)
      ist.setHours(0, 0, 0, 0)

      await tx.aetherTaskProgress.create({
        data: {
          userId: profile.id,
          taskKey: 'daily_login',
          completed: true,
          completedAt: new Date(),
          resetDate: ist,
          timesCompleted: 1,
        },
      })

      // Handle referral: if ref code provided, award 30 Aether to the referrer
      if (ref && ref.trim().length > 0) {
        const referrer = await tx.profile.findFirst({
          where: { username: ref.trim().toLowerCase() },
        })
        if (referrer && referrer.id !== profile.id) {
          const referrerBalance = await tx.aetherBalance.upsert({
            where: { userId: referrer.id },
            create: { userId: referrer.id, balance: 0, totalEarned: 0, totalRedeemed: 0 },
            update: {},
          })
          const newReferrerBalance = referrerBalance.balance + 30
          await tx.aetherBalance.update({
            where: { userId: referrer.id },
            data: {
              balance: newReferrerBalance,
              totalEarned: { increment: 30 },
            },
          })
          await tx.aetherTransaction.create({
            data: {
              userId: referrer.id,
              type: 'referral',
              source: 'referral',
              description: `Referral Bonus: ${profile.username} signed up using your link`,
              amount: 30,
              balanceAfter: newReferrerBalance,
            },
          })
        }
      }

      return profile
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
    const msg = error instanceof Error ? error.message : String(error)

    // Only catch known unique constraint violations — everything else surfaces the real error
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: `Registration failed: ${msg}` },
      { status: 500 }
    )
  }
}
