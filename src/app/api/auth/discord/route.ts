import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      throw new Error('DISCORD_CLIENT_ID and DISCORD_REDIRECT_URI environment variables are required');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email',
    })

    return NextResponse.redirect(
      `https://discord.com/api/oauth2/authorize?${params.toString()}`
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to initiate Discord OAuth' },
      { status: 500 }
    )
  }
}
