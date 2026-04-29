import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request)
    if (auth.profile.isBanned) {
      return NextResponse.json({ error: 'Account banned' }, { status: 403 })
    }

    const body = await request.json()
    const { amount, tournamentId, currency = 'INR' } = body

    if (!amount || !tournamentId) {
      return NextResponse.json({ error: 'Amount and tournament ID required' }, { status: 400 })
    }

    // Check tournament exists and registration is open
    const tournament = await db.tournament.findUnique({ where: { id: tournamentId } })
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }
    if (tournament.status !== 'upcoming' && tournament.status !== 'registration_open') {
      return NextResponse.json({ error: 'Registration is not open' }, { status: 400 })
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
    // Note: In production, use the razorpay SDK: npm install razorpay
    // For now, we'll create a placeholder order
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
    } catch (rzpError: any) {
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
