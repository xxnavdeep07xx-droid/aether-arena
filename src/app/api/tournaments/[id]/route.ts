import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tournament = await db.tournament.findUnique({
      where: { id },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            bannerUrl: true,
            maxTeamSize: true,
            description: true,
          },
        },
        registrations: {
          include: {
            player: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                league: true,
                leaguePoints: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Check if current user is registered
    let isRegistered = false
    let userRegistration: any = null
    try {
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const match = cookieHeader.match(/aether_session=([^;]+)/)
        if (match) {
          const session = await db.session.findUnique({
            where: { token: match[1] },
            select: { userId: true, expiresAt: true },
          })
          if (session && session.expiresAt >= new Date()) {
            const reg = await db.tournamentRegistration.findUnique({
              where: {
                tournamentId_playerId: {
                  tournamentId: id,
                  playerId: session.userId,
                },
              },
            })
            if (reg) {
              isRegistered = true
              userRegistration = reg
            }
          }
        }
      }
    } catch {
      // Ignore session errors
    }

    return NextResponse.json({
      ...tournament,
      entryFeeDisplay: (tournament.entryFee / 100).toFixed(2),
      prizePoolDisplay: (tournament.prizePool / 100).toFixed(2),
      registrationCount: tournament.registrations.length,
      isRegistered,
      userRegistration,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
