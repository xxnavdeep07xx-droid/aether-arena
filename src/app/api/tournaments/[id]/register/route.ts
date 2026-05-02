import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { apiLimiter } from '@/lib/rate-limit'
import { Prisma } from '@prisma/client'
import { registerTournamentSchema, formatZodError } from '@/lib/validations'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Request body size limit
  const contentLength = parseInt(request.headers.get('content-length') || '0')
  if (contentLength > 100_000) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await apiLimiter(`register:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const auth = await requireAuth(request)
    const { id: tournamentId } = await params

    // Check if user is banned
    if (auth.profile.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned. You cannot register for tournaments.' },
        { status: 403 }
      )
    }

    // Find tournament
    const tournament = await db.tournament.findUnique({
      where: { id: tournamentId },
    })

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      )
    }

    // Check if registration is open
    if (tournament.status !== 'upcoming' && tournament.status !== 'registration_open') {
      return NextResponse.json(
        { error: 'Registration is not open for this tournament' },
        { status: 400 }
      )
    }

    // Check if registration period is valid
    const now = new Date()
    if (now < tournament.registrationStart) {
      return NextResponse.json(
        { error: 'Registration has not started yet' },
        { status: 400 }
      )
    }
    if (tournament.registrationEnd && now > tournament.registrationEnd) {
      return NextResponse.json(
        { error: 'Registration has ended' },
        { status: 400 }
      )
    }

    // Check if already registered
    const existingRegistration = await db.tournamentRegistration.findUnique({
      where: {
        tournamentId_playerId: {
          tournamentId,
          playerId: auth.userId,
        },
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this tournament' },
        { status: 409 }
      )
    }

    // Parse request body for payment info
    let body = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    // Zod validation for payment fields
    const parsed = registerTournamentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      )
    }

    const { paymentMethod, paymentReference, paymentScreenshotUrl } = parsed.data

    // Determine payment status
    const paymentStatus = tournament.entryFee === 0 ? 'verified' : (paymentMethod === 'razorpay' ? 'verified' : 'pending')

    // Create registration and update tournament count in transaction
    // The capacity check is inside the transaction to prevent race conditions
    const registration = await db.$transaction(async (tx) => {
      // Re-read tournament inside transaction for atomic capacity check
      const freshTournament = await tx.tournament.findUnique({
        where: { id: tournamentId },
        select: { registeredPlayers: true, maxPlayers: true },
      })

      if (!freshTournament) {
        throw new Error('Tournament not found')
      }

      if (freshTournament.registeredPlayers >= freshTournament.maxPlayers) {
        throw new Error('TOURNAMENT_FULL')
      }

      const reg = await tx.tournamentRegistration.create({
        data: {
          tournamentId,
          playerId: auth.userId,
          paymentStatus,
          paymentMethod: paymentMethod || null,
          paymentReference: paymentReference || null,
          paymentScreenshotUrl: paymentScreenshotUrl || null,
          paidAmount: tournament.entryFee,
        },
        include: {
          player: {
            select: {
              username: true,
              displayName: true,
            },
          },
          tournament: {
            select: {
              title: true,
            },
          },
        },
      })

      await tx.tournament.update({
        where: { id: tournamentId },
        data: { registeredPlayers: { increment: 1 } },
      })

      return reg
    })

    // Create notification for user
    await db.notification.create({
      data: {
        userId: auth.userId,
        title: 'Tournament Registration',
        message: `You have been registered for "${registration.tournament.title}". ${
          paymentStatus === 'pending'
            ? 'Your payment is pending verification.'
            : 'Your free registration is confirmed!'
        }`,
        type: 'registration',
        link: `/tournaments/${tournamentId}`,
      },
    })

    // Notify all admins about the new registration
    const admins = await db.profile.findMany({
      where: { isAdmin: true },
      select: { id: true },
    });
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: 'New Tournament Registration',
          message: `${registration.player.username || 'A player'} registered for "${registration.tournament.title}". Entry: ${tournament.entryFee === 0 ? 'FREE' : `₹${(tournament.entryFee / 100).toFixed(2)}`}. Status: ${paymentStatus}.`,
          type: 'admin_registration',
          link: `/admin-registrations`,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      registration: {
        ...registration,
        paidAmountDisplay: (registration.paidAmount / 100).toFixed(2),
        tournament: undefined,
        player: undefined,
      },
      message:
        paymentStatus === 'pending'
          ? 'Registration successful! Your payment is pending verification.'
          : 'Registration successful! You are confirmed for this tournament.',
    })
  } catch (error: unknown) {
    // Handle P2002 unique constraint violation (duplicate registration race condition)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'You are already registered for this tournament' }, { status: 409 })
    }
    if (error instanceof Error && error.message === 'TOURNAMENT_FULL') {
      return NextResponse.json({ error: 'Tournament is full' }, { status: 400 })
    }
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
