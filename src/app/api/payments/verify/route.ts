import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { strictLimiter } from '@/lib/rate-limit'
import { verifyPaymentSchema, formatZodError } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  // Rate limiting — strict because payment verification is sensitive
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await strictLimiter(`verify:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const auth = await requireAuth(request)

    const body = await request.json()

    // Zod validation
    const parsed = verifyPaymentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, tournamentId } = parsed.data

    // Get Razorpay secret — prefer env vars, fall back to DB settings
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || (await db.platformSetting.findUnique({ where: { key: 'razorpay_key_secret' } }))?.value
    if (!razorpaySecret) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 })
    }

    // Verify signature
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Check tournament
    const tournament = await db.tournament.findUnique({ where: { id: tournamentId } })
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Create registration with verified payment inside transaction
    // P2002 unique constraint handling prevents duplicate registrations from race conditions
    try {
      const registration = await db.$transaction(async (tx) => {
        const freshTournament = await tx.tournament.findUnique({
          where: { id: tournamentId },
          select: { registeredPlayers: true, maxPlayers: true },
        })
        if (!freshTournament || freshTournament.registeredPlayers >= freshTournament.maxPlayers) {
          throw new Error('TOURNAMENT_FULL')
        }

        const reg = await tx.tournamentRegistration.create({
          data: {
            tournamentId,
            playerId: auth.userId,
            paymentStatus: 'verified',
            paymentMethod: 'razorpay',
            paymentReference: razorpayPaymentId,
            paidAmount: tournament.entryFee,
          },
        })

        await tx.tournament.update({
          where: { id: tournamentId },
          data: { registeredPlayers: { increment: 1 } },
        })

        return reg
      })

      // Create notification
      await db.notification.create({
        data: {
          userId: auth.userId,
          title: 'Payment Successful',
          message: `Your payment for "${tournament.title}" has been verified. You are registered!`,
          type: 'registration',
          link: `/tournaments/${tournamentId}`,
        },
      })

      return NextResponse.json({
        success: true,
        registration: { id: registration.id, paymentStatus: 'verified' },
        message: 'Payment verified! You are registered for the tournament.',
      })
    } catch (txError: unknown) {
      // Handle P2002 unique constraint violation (duplicate registration race condition)
      if (txError instanceof Prisma.PrismaClientKnownRequestError && txError.code === 'P2002') {
        return NextResponse.json({ error: 'Already registered for this tournament' }, { status: 409 })
      }
      if (txError instanceof Error && txError.message === 'TOURNAMENT_FULL') {
        return NextResponse.json({ error: 'Tournament is full' }, { status: 400 })
      }
      throw txError
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Payment verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
