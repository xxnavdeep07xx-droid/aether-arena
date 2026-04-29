import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// POST /api/profiles/me/cancel-deletion — Cancel scheduled account deletion
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request)
    const userId = auth.userId

    const profile = await db.profile.findUnique({
      where: { id: userId },
      select: { id: true, username: true, scheduledDeletionAt: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.scheduledDeletionAt) {
      return NextResponse.json({
        message: 'No scheduled deletion found. Your account is safe.',
      })
    }

    // Check if deletion period has already passed
    const deletionDate = new Date(profile.scheduledDeletionAt)
    if (deletionDate <= new Date()) {
      return NextResponse.json({
        error: 'The recovery period has passed. Your account cannot be restored.' },
        { status: 400 }
      )
    }

    // Cancel deletion
    await db.profile.update({
      where: { id: userId },
      data: { scheduledDeletionAt: null },
    })

    return NextResponse.json({
      message: 'Account deletion cancelled! Your account has been fully restored.',
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
