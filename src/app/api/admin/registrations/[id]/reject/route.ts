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
        tournament: { select: { title: true, registeredPlayers: true } },
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

    // Delete registration and decrement tournament count in transaction
    await db.$transaction(async (tx) => {
      await tx.tournamentRegistration.delete({ where: { id } })
      // Guard against negative registeredPlayers
      if (registration.tournament.registeredPlayers > 0) {
        await tx.tournament.update({
          where: { id: registration.tournamentId },
          data: { registeredPlayers: { decrement: 1 } },
        })
      }
    })

    // Notify the player
    await db.notification.create({
      data: {
        userId: registration.playerId,
        title: 'Payment Rejected',
        message: `Your payment for "${registration.tournament.title}" has been rejected. Please contact support for more information.`,
        type: 'payment',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Admin reject registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
