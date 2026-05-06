import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if current user is authenticated
    const session = await getSession(request)
    const isAdmin = session?.profile.isAdmin ?? false

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
        registrations: isAdmin
          ? {
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
            }
          : undefined,
        createdBy: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: !isAdmin
          ? { select: { registrations: true } }
          : undefined,
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
    let userRegistration: {
      id: string
      paymentStatus: string
      paymentMethod: string | null
      createdAt: Date
    } | null = null

    if (session) {
      const reg = await db.tournamentRegistration.findUnique({
        where: {
          tournamentId_playerId: {
            tournamentId: id,
            playerId: session.userId,
          },
        },
        select: {
          id: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
        },
      })
      if (reg) {
        isRegistered = true
        userRegistration = reg
      }
    }

    // Determine whether to show room credentials
    // Only show to: (1) admins, or (2) registered users with verified payment
    const showRoomCredentials = isAdmin || (isRegistered && userRegistration?.paymentStatus === 'verified')

    // Build response — strip sensitive fields unless authorized
    const { roomId, roomPassword, ...safeTournament } = tournament

    return NextResponse.json({
      ...safeTournament,
      roomId: showRoomCredentials ? roomId : null,
      roomPassword: showRoomCredentials ? roomPassword : null,
      entryFeeDisplay: (tournament.entryFee / 100).toFixed(2),
      prizePoolDisplay: (tournament.prizePool / 100).toFixed(2),
      registrationCount: isAdmin
        ? tournament.registrations!.length
        : (tournament as unknown as { _count: { registrations: number } })._count?.registrations ?? 0,
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
