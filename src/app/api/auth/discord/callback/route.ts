import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession, getSessionCookieOptions } from '@/lib/auth'
import { authLimiter } from '@/lib/rate-limit'

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
    const err = await tokenRes.text()
    throw new Error(`Token exchange failed: ${err}`)
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

    // Check if an account with this Discord ID already exists
    const existingAccount = await db.account.findFirst({
      where: {
        provider: 'discord',
        providerAccountId: discordUser.id,
      },
      include: { user: true },
    })

    if (existingAccount) {
      // User already linked - log them in
      if (existingAccount.user.isBanned) {
        return NextResponse.redirect(`${url.origin}/?error=account_banned`)
      }

      // Update Discord info
      await db.profile.update({
        where: { id: existingAccount.userId },
        data: {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          avatarUrl: existingAccount.user.avatarUrl || `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
        },
      })

      // Create session
      await db.session.deleteMany({ where: { userId: existingAccount.userId } })
      const token = await createSession(existingAccount.userId)

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

    // New Discord user - create account
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

    // Create profile with Discord account atomically to prevent race condition
    const profile = await db.$transaction(async (tx) => {
      const userCount = await tx.profile.count()
      const isAdmin = userCount === 0

      // Check for ref parameter
      const ref = url.searchParams.get('ref')

      const created = tx.profile.create({
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
          accounts: {
            create: {
              type: 'oauth',
              provider: 'discord',
              providerAccountId: discordUser.id,
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token || null,
              expires_at: tokenData.expires_in
                ? Math.floor(Date.now() / 1000) + tokenData.expires_in
                : null,
              scope: tokenData.scope || 'identify email',
              token_type: tokenData.token_type || 'Bearer',
            },
          },
        },
      })

      // Wait for the profile to be created before creating related records
      const newProfile = await created

      // Create AetherBalance with 50 welcome bonus
      await tx.aetherBalance.create({
        data: {
          userId: newProfile.id,
          balance: 50,
          totalEarned: 50,
          totalRedeemed: 0,
        },
      })

      // Create welcome bonus transaction
      await tx.aetherTransaction.create({
        data: {
          userId: newProfile.id,
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
          userId: newProfile.id,
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
          userId: newProfile.id,
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
        if (referrer && referrer.id !== newProfile.id) {
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
              description: `Referral Bonus: ${newProfile.username} signed up using your link`,
              amount: 30,
              balanceAfter: newReferrerBalance,
            },
          })
        }
      }

      return newProfile
    })

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
