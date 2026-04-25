import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)

    const profile = await db.profile.findUnique({
      where: { id: auth.userId },
      select: {
        notificationPrefs: true,
        privacyPrefs: true,
        language: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const defaults = {
      notificationPrefs: {
        pushEnabled: true,
        tournamentAlerts: true,
        resultUpdates: true,
        promoOffers: false,
        communityUpdates: true,
      },
      privacyPrefs: {
        profileVisibility: 'public',
        showLeaderboard: true,
        showActivity: true,
      },
      language: 'en',
    }

    // Parse JSON fields, falling back to defaults
    const notificationPrefs = typeof profile.notificationPrefs === 'string'
      ? JSON.parse(profile.notificationPrefs)
      : (profile.notificationPrefs || defaults.notificationPrefs)
    const privacyPrefs = typeof profile.privacyPrefs === 'string'
      ? JSON.parse(profile.privacyPrefs)
      : (profile.privacyPrefs || defaults.privacyPrefs)

    return NextResponse.json({
      notificationPrefs,
      privacyPrefs,
      language: profile.language || defaults.language,
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
    const { notificationPrefs, privacyPrefs, language } = body

    const updateData: Record<string, unknown> = {}

    if (notificationPrefs !== undefined) {
      updateData.notificationPrefs = JSON.stringify(notificationPrefs)
    }
    if (privacyPrefs !== undefined) {
      updateData.privacyPrefs = JSON.stringify(privacyPrefs)
    }
    if (language !== undefined) {
      updateData.language = language
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const profile = await db.profile.update({
      where: { id: auth.userId },
      data: updateData,
      select: {
        notificationPrefs: true,
        privacyPrefs: true,
        language: true,
      },
    })

    const notificationPrefsResult = typeof profile.notificationPrefs === 'string'
      ? JSON.parse(profile.notificationPrefs)
      : profile.notificationPrefs
    const privacyPrefsResult = typeof profile.privacyPrefs === 'string'
      ? JSON.parse(profile.privacyPrefs)
      : profile.privacyPrefs

    return NextResponse.json({
      notificationPrefs: notificationPrefsResult,
      privacyPrefs: privacyPrefsResult,
      language: profile.language,
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
