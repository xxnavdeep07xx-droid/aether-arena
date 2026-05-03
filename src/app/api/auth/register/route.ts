import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { createSession, getSessionCookieOptions } from '@/lib/auth'
import { authLimiter, strictLimiter } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

// Ensure AetherTask seed data exists (idempotent)
async function ensureAetherTaskSeed() {
  try {
    const taskCount = await db.aetherTask.count()
    if (taskCount === 0) {
      const tasks = [
        { taskKey: 'daily_login', title: 'Daily Login', description: 'Open the app today', rewardAmount: 5, category: 'daily', resetType: 'daily', affiliateUrl: null, displayOrder: 1 },
        { taskKey: 'view_tournament', title: 'View Tournament', description: 'View any tournament details', rewardAmount: 3, category: 'daily', resetType: 'daily', affiliateUrl: null, displayOrder: 2 },
        { taskKey: 'check_leaderboard', title: 'Check Leaderboard', description: 'Visit the leaderboard page', rewardAmount: 3, category: 'daily', resetType: 'daily', affiliateUrl: null, displayOrder: 3 },
        { taskKey: 'register_tournament', title: 'Register for Tournament', description: 'Register for any tournament', rewardAmount: 10, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 4 },
        { taskKey: 'play_tournament', title: 'Play a Tournament', description: 'Complete a tournament match', rewardAmount: 25, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 5 },
        { taskKey: 'win_tournament', title: 'Win a Tournament', description: 'Win 1st place in a tournament', rewardAmount: 100, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 6 },
        { taskKey: 'win_2nd_place', title: 'Win 2nd Place', description: 'Get 2nd place in a tournament', rewardAmount: 60, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 7 },
        { taskKey: 'win_3rd_place', title: 'Win 3rd Place', description: 'Get 3rd place in a tournament', rewardAmount: 40, category: 'tournament', resetType: 'one_time', affiliateUrl: null, displayOrder: 8 },
        { taskKey: 'complete_profile', title: 'Complete Profile', description: 'Add bio and avatar to your profile', rewardAmount: 15, category: 'engagement', resetType: 'one_time', affiliateUrl: null, displayOrder: 9 },
        { taskKey: 'refer_friend', title: 'Refer a Friend', description: 'Share referral link, friend signs up', rewardAmount: 30, category: 'engagement', resetType: 'one_time', affiliateUrl: null, displayOrder: 10 },
        { taskKey: 'streak_7', title: '7-Day Streak', description: 'Log in 7 consecutive days', rewardAmount: 50, category: 'engagement', resetType: 'one_time', affiliateUrl: null, displayOrder: 11 },
        { taskKey: 'streak_30', title: '30-Day Streak', description: 'Log in 30 consecutive days', rewardAmount: 200, category: 'engagement', resetType: 'one_time', affiliateUrl: null, displayOrder: 12 },
        { taskKey: 'try_bgmi', title: 'Try BGMI', description: 'Download BGMI via our affiliate link', rewardAmount: 20, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/bgmi', displayOrder: 13 },
        { taskKey: 'try_freefire', title: 'Try Free Fire', description: 'Download Free Fire via our affiliate link', rewardAmount: 20, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/freefire', displayOrder: 14 },
        { taskKey: 'try_codm', title: 'Try COD Mobile', description: 'Download COD Mobile via our affiliate link', rewardAmount: 20, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/call-of-duty-mobile', displayOrder: 15 },
        { taskKey: 'try_clashroyale', title: 'Try Clash Royale', description: 'Download Clash Royale via our affiliate link', rewardAmount: 15, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/clash-royale', displayOrder: 16 },
        { taskKey: 'try_valorant', title: 'Try Valorant Mobile', description: 'Download Valorant Mobile via our affiliate link', rewardAmount: 15, category: 'affiliate', resetType: 'one_time', affiliateUrl: 'https://www.codashop.com/in/valorant-mobile', displayOrder: 17 },
      ]
      for (const t of tasks) {
        await db.aetherTask.upsert({
          where: { taskKey: t.taskKey },
          create: t,
          update: {},
        })
      }
      console.log('[Register] Seeded AetherTask data (first registration)')
    }
  } catch (err) {
    console.error('[Register] Failed to seed AetherTask data:', err)
  }
}

export async function POST(request: Request) {
  // Request body size limit
  const contentLength = parseInt(request.headers.get('content-length') || '0')
  if (contentLength > 100_000) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await authLimiter(`register:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Anti-abuse: limit to 3 accounts per IP per 24-hour window
  const { success: dailyLimitOk } = await strictLimiter(`register_daily:${clientIp}`);
  if (!dailyLimitOk) {
    return NextResponse.json(
      { error: 'Daily registration limit reached. Please try again tomorrow.' },
      { status: 429 }
    );
  }

  // Parse body ONCE before any try/catch
  let body: {
    email?: string;
    password?: string;
    username?: string;
    displayName?: string;
    phone?: string;
    referralCode?: string;
    ref?: string;
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { email, password, username, displayName, phone, referralCode, ref } = body

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
  if (email.length > 254) {
    return NextResponse.json(
      { error: 'Email is too long' },
      { status: 400 }
    )
  }

  // Validate password
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }
  if (password.length > 128) {
    return NextResponse.json(
      { error: 'Password must be 128 characters or less' },
      { status: 400 }
    )
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
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

  // Validate displayName length if provided
  if (displayName && displayName.length > 50) {
    return NextResponse.json(
      { error: 'Display name must be 50 characters or less' },
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

  // Validate phone if provided
  if (phone && phone.trim().length > 0) {
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid Indian phone number. Must be 10 digits starting with 6-9' },
        { status: 400 }
      )
    }
  }

  // Resolve referral code (accept both referralCode and ref)
  const resolvedRefCode = referralCode || ref || null;

  // Ensure AetherTask seed data exists before the transaction
  await ensureAetherTaskSeed()

  try {
    // Check if email already exists
    const existingCred = await db.accountCredential.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existingCred) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try logging in instead.' },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingUser = await db.profile.findUnique({
      where: { username },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'This username is not available. Please choose a different one.' },
        { status: 409 }
      )
    }

    // Check if phone already exists (if provided)
    if (phone && phone.trim().length > 0) {
      const cleanPhone = phone.replace(/\D/g, '');
      const existingPhone = await db.profile.findUnique({
        where: { phone: cleanPhone },
      })
      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Clean phone number
    const cleanPhone = phone && phone.trim().length > 0 ? phone.replace(/\D/g, '') : null;

    // Create profile with credential atomically
    const profile = await db.$transaction(async (tx) => {
      const initialized = await tx.platformSetting.findUnique({ where: { key: 'system_initialized' } })
      const isAdmin = !initialized

      const created = tx.profile.create({
        data: {
          username,
          displayName: displayName || username,
          phone: cleanPhone,
          phoneVerified: false,
          isAdmin,
          referredByCode: resolvedRefCode || null,
          credentials: {
            create: {
              email: email.toLowerCase(),
              password: hashedPassword,
              phone: cleanPhone,
              phoneVerified: false,
              emailVerified: false,
              emailVerificationToken: crypto.randomBytes(32).toString('hex'),
              emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            } as any,
          },
        },
        include: {
          credentials: {
            select: { email: true, phone: true, emailVerificationToken: true } as any,
          },
        },
      })

      // Wait for the profile to be created before creating related records
      const profile = await created

      // Mark system as initialized so no future user gets admin
      if (isAdmin) {
        await tx.platformSetting.upsert({
          where: { key: 'system_initialized' },
          create: { key: 'system_initialized', value: 'true' },
          update: { value: 'true' },
        })
      }

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

      // Auto-complete daily_login task for today (best-effort — skip if AetherTask not seeded)
      try {
        const dailyTask = await tx.aetherTask.findUnique({ where: { taskKey: 'daily_login' } })
        if (dailyTask) {
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
        } else {
          console.warn('[Register] daily_login AetherTask not found — skipping task progress creation')
        }
      } catch (taskErr) {
        // Non-critical: don't fail registration over task progress
        console.error('[Register] Failed to create daily_login task progress (non-critical):', taskErr)
      }

      // Handle referral: if ref code provided, award 30 Aether to the referrer
      if (resolvedRefCode && resolvedRefCode.trim().length > 0) {
        const referrer = await tx.profile.findFirst({
          where: { username: resolvedRefCode.trim().toLowerCase() },
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

    // Send verification email (non-blocking — don't fail registration if email fails)
    if (profile.credentials?.emailVerificationToken) {
      sendVerificationEmail(
        profile.credentials.email,
        profile.username,
        profile.credentials.emailVerificationToken
      ).catch((err) => {
        console.error('[Register] Failed to send verification email:', err)
      })
    }

    // Build response
    const response = NextResponse.json({
      user: {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        email: profile.credentials?.email,
        phone: profile.credentials?.phone || profile.phone,
        isAdmin: profile.isAdmin,
        emailVerified: false,
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
      // Generic message — avoid revealing which specific field caused the conflict
      // to prevent account enumeration attacks
      return NextResponse.json(
        { error: 'Registration failed. The email, username, or phone you entered is already in use. Try logging in or use different details.' },
        { status: 409 }
      )
    }

    // Return more descriptive error for debugging (strip in production later)
    const debugMsg = process.env.NODE_ENV === 'development'
      ? `Registration failed: ${msg}`
      : 'Registration failed. Please try again later.'

    return NextResponse.json(
      { error: debugMsg },
      { status: 500 }
    )
  }
}
