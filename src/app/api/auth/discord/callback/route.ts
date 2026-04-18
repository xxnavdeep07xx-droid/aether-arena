import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession, getSessionCookieOptions } from '@/lib/auth'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1493661620239601664'
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://qrmsyjoaodtydjbwjlas.supabase.co/auth/v1/callback'

async function exchangeCode(code: string, redirectUri: string) {
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
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
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${url.origin}/?error=discord_oauth_cancelled`)
    }

    if (!code) {
      return NextResponse.redirect(`${url.origin}/?error=no_code`)
    }

    // Determine redirect URI
    const redirectUri = DISCORD_REDIRECT_URI

    // Exchange code for token
    const tokenData = await exchangeCode(code, redirectUri)

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

      return tx.profile.create({
        data: {
          username,
          displayName: discordUser.global_name || discordUser.username,
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          avatarUrl: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : null,
          isAdmin,
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
    console.error('Discord OAuth callback error:', error)
    const url = new URL(request.url)
    return NextResponse.redirect(`${url.origin}/?error=discord_oauth_failed`)
  }
}
