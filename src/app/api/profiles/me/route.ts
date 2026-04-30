import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { updateProfileSchema, formatZodError } from '@/lib/validations'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)

    const profile = await db.profile.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        discordId: true,
        discordUsername: true,
        league: true,
        leaguePoints: true,
        totalTournamentsPlayed: true,
        totalWins: true,
        totalKills: true,
        totalDeaths: true,
        totalPrizeWon: true,
        createdAt: true,
        credentials: {
          select: { email: true },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const kdRatio = profile.totalDeaths > 0
      ? (profile.totalKills / profile.totalDeaths).toFixed(2)
      : profile.totalKills > 0
        ? '∞'
        : '0'

    const winRate = profile.totalTournamentsPlayed > 0
      ? ((profile.totalWins / profile.totalTournamentsPlayed) * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      ...profile,
      email: profile.credentials?.email || null,
      credentials: undefined,
      kdRatio,
      winRate,
      totalPrizeWonDisplay: (profile.totalPrizeWon / 100).toFixed(2),
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()

    // Zod validation (validates types, lengths, and URL format)
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
    }

    const { displayName, bio, avatarUrl } = parsed.data

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (displayName !== undefined) updateData.displayName = displayName
    if (bio !== undefined) updateData.bio = bio
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null

    const profile = await db.profile.update({
      where: { id: auth.userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        league: true,
        leaguePoints: true,
      },
    })

    return NextResponse.json({ profile })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
