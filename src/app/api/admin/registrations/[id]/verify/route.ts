import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    const registration = await db.tournamentRegistration.findUnique({
      where: { id },
      include: {
        player: { select: { username: true, displayName: true } },
        tournament: { select: { title: true } },
      },
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    if (registration.paymentStatus !== 'pending') {
      return NextResponse.json(
        { error: `Registration is already ${registration.paymentStatus}` },
        { status: 400 }
      )
    }

    const updated = await db.tournamentRegistration.update({
      where: { id },
      data: { paymentStatus: 'verified' },
    })

    // Notify the player
    await db.notification.create({
      data: {
        userId: registration.playerId,
        title: 'Payment Verified',
        message: `Your payment for "${registration.tournament.title}" has been verified. You are confirmed!`,
        type: 'payment',
        link: `/tournaments/${registration.tournamentId}`,
      },
    })

    return NextResponse.json({
      registration: {
        ...updated,
        paidAmountDisplay: (updated.paidAmount / 100).toFixed(2),
      },
    })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
