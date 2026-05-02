import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { strictLimiter } from '@/lib/rate-limit'
import { createOrderSchema, formatZodError } from '@/lib/validations'

export async function POST(request: Request) {
  // Request body size limit
  const contentLength = parseInt(request.headers.get('content-length') || '0')
  if (contentLength > 100_000) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
  }

  // Rate limiting — strict because payments are sensitive
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await strictLimiter(`payment:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many payment attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const auth = await requireAuth(request)

    const body = await request.json()

    // Zod validation
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
    }
    const { amount, tournamentId, currency } = parsed.data

    // Check tournament exists and registration is open
    const tournament = await db.tournament.findUnique({ where: { id: tournamentId } })
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }
    if (tournament.status !== 'upcoming' && tournament.status !== 'registration_open') {
      return NextResponse.json({ error: 'Registration is not open' }, { status: 400 })
    }

    // Validate amount matches tournament entry fee (prevent amount manipulation)
    if (amount !== tournament.entryFee) {
      return NextResponse.json({ error: 'Amount does not match tournament entry fee' }, { status: 400 })
    }

    // Check if already registered
    const existingReg = await db.tournamentRegistration.findUnique({
      where: { tournamentId_playerId: { tournamentId, playerId: auth.userId } }
    })
    if (existingReg) {
      return NextResponse.json({ error: 'Already registered' }, { status: 409 })
    }

    // Get Razorpay credentials — prefer env vars, fall back to DB settings
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || (await db.platformSetting.findUnique({ where: { key: 'razorpay_key_id' } }))?.value
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || (await db.platformSetting.findUnique({ where: { key: 'razorpay_key_secret' } }))?.value

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: 'Payment gateway not configured. Please contact admin.' }, { status: 503 })
    }

    // Create Razorpay order
    try {
      const Razorpay = require('razorpay')
      const razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })

      const order = await razorpay.orders.create({
        amount: Math.round(amount),
        currency,
        receipt: `txn_${tournamentId.slice(0, 8)}_${Date.now()}`,
        notes: {
          tournamentId,
          playerId: auth.userId,
        },
      })

      return NextResponse.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpayKey: razorpayKeyId,
      })
    } catch (rzpError: unknown) {
      console.error('Razorpay order creation error:', rzpError)
      return NextResponse.json({ error: 'Payment gateway error. Please try again later.' }, { status: 500 })
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
