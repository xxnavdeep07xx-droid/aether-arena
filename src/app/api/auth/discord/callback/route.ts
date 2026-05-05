import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession, getSessionCookieOptions } from '@/lib/auth'
import { authLimiter } from '@/lib/rate-limit'
import { Prisma } from '@prisma/client'

function getDiscordEnv() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, and DISCORD_REDIRECT_URI environment variables are required');
  }
  return { clientId, clientSecret, redirectUri };
}

async function exchangeCode(code: string, redirectUri: string, clientId: string, clientSecret: string) {
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    const errText = await tokenRes.text()
    console.error('[Discord Callback] Token exchange failed:', tokenRes.status, errText)
    throw new Error(`Token exchange failed: ${errText}`)
  }

  return tokenRes.json()
}

async function getDiscordUser(accessToken: string) {
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!userRes.ok) {
    throw new Error('Failed to fetch Discord user')
  }

  return userRes.json()
}

export async function GET(request: Request) {
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await authLimiter(`discord:${clientIp}`);
  if (!rateLimitOk) {
    const url = new URL(request.url);
    return NextResponse.redirect(`${url.origin}/?error=rate_limited`);
  }

  try {
    const { clientId, clientSecret, redirectUri } = getDiscordEnv();

    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${url.origin}/?error=discord_oauth_cancelled`)
    }

    if (!code) {
      return NextResponse.redirect(`${url.origin}/?error=no_code`)
    }

    // Exchange code for token
    const tokenData = await exchangeCode(code, redirectUri, clientId, clientSecret)

    // Get Discord user info
    const discordUser = await getDiscordUser(tokenData.access_token)

    // Check if a profile with this Discord ID already exists
    const existingProfile = await db.profile.findFirst({
      where: { discordId: discordUser.id },
    })

    if (existingProfile) {
      // User already linked - log them in
      if (existingProfile.isBanned) {
        return NextResponse.redirect(`${url.origin}/?error=account_banned`)
      }

      // Update Discord info
      await db.profile.update({
        where: { id: existingProfile.id },
        data: {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          avatarUrl: existingProfile.avatarUrl || (discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null),
        },
      })

      // Create session
      await db.session.deleteMany({ where: { userId: existingProfile.id } })
      const token = await createSession(existingProfile.id)

      // Build the frontend URL
      const frontendUrl = `${url.origin}/`

      const response = NextResponse.redirect(frontendUrl)

      // Set session cookie
      const cookieOptions = getSessionCookieOptions()
      response.cookies.set(cookieOptions.name, token, {
        ...cookieOptions,
        maxAge: cookieOptions.maxAge,
      })

      return response
    }

    // New Discord user - create profile
    // Generate unique username from Discord username
    let baseUsername = discordUser.username.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 18)
    if (!baseUsername || baseUsername.length < 3) baseUsername = `user_${discordUser.id.slice(0, 6)}`

    // Check if username exists and add suffix if needed
    let username = baseUsername
    let suffix = 0
    while (await db.profile.findUnique({ where: { username } })) {
      suffix++
      username = `${baseUsername}${suffix}`
    }

    // Create profile atomically
    // Retry on P2002 (username collision from concurrent registrations)
    let profile
    let retries = 0
    const MAX_RETRIES = 3
    while (retries < MAX_RETRIES) {
      try {
        profile = await db.$transaction(async (tx) => {
          const userCount = await tx.profile.count()
          const isAdmin = userCount === 0

          // Check for ref parameter
          const ref = url.searchParams.get('ref')

          const created = await tx.profile.create({
            data: {
              username,
              displayName: discordUser.global_name || discordUser.username,
              discordId: discordUser.id,
              discordUsername: discordUser.username,
              avatarUrl: discordUser.avatar
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : null,
              isAdmin,
              referredByCode: ref || null,
            },
          })

          // Create AetherBalance with 50 welcome bonus
          await tx.aetherBalance.create({
            data: {
              userId: created.id,
              balance: 50,
              totalEarned: 50,
              totalRedeemed: 0,
            },
          })

          // Create welcome bonus transaction
          await tx.aetherTransaction.create({
            data: {
              userId: created.id,
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
              userId: created.id,
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
              userId: created.id,
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
            if (referrer && referrer.id !== created.id) {
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
                  description: `Referral Bonus: ${created.username} signed up using your link`,
                  amount: 30,
                  balanceAfter: newReferrerBalance,
                },
              })
            }
          }

          return created
        })

        // Transaction succeeded, break out of retry loop
        break
      } catch (txError: unknown) {
        // Handle P2002 unique constraint violation (username collision)
        if (txError instanceof Prisma.PrismaClientKnownRequestError && txError.code === 'P2002') {
          retries++
          suffix++
          username = `${baseUsername}${suffix}`
          if (retries >= MAX_RETRIES) {
            throw new Error('Failed to create unique username after multiple attempts')
          }
          continue
        }
        throw txError
      }
    }

    if (!profile) {
      throw new Error('Failed to create account')
    }

    // Create session
    const sessionToken = await createSession(profile.id)

    // Build the frontend URL
    const frontendUrl = `${url.origin}/`

    const response = NextResponse.redirect(frontendUrl)

    // Set session cookie
    const cookieOptions = getSessionCookieOptions()
    response.cookies.set(cookieOptions.name, sessionToken, {
      ...cookieOptions,
      maxAge: cookieOptions.maxAge,
    })

    return response
  } catch (error) {
    console.error('Discord OAuth error:', error)
    const url = new URL(request.url)
    return NextResponse.redirect(`${url.origin}/?error=discord_oauth_failed`)
  }
}
