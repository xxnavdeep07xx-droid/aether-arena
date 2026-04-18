import { NextResponse } from 'next/server'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1493661620239601664'
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || ''

export async function GET(request: Request) {
  try {
    // Build redirect URI based on the request's origin
    const url = new URL(request.url)
    const origin = url.origin
    const redirectUri = REDIRECT_URI || `${origin}/api/auth/discord/callback`

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email',
    })

    return NextResponse.redirect(
      `https://discord.com/api/oauth2/authorize?${params.toString()}`
    )
  } catch (error) {
    console.error('Discord OAuth init error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Discord OAuth' },
      { status: 500 }
    )
  }
}
