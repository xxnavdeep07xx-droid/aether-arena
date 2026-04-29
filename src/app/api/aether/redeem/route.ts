import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'
import { strictLimiter } from '@/lib/rate-limit'

const MIN_REDEEM_AMOUNT = 500
const AETHER_TO_INR_RATE = 10 / 100 // 100 Aether = ₹10

export async function POST(request: Request) {
  // Rate limiting — strict because redemptions involve money
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await strictLimiter(`redeem:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many redemption attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const { userId } = await requireAuth(request)

    let body: { upiId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { upiId } = body

    if (!upiId || upiId.trim().length === 0) {
      return NextResponse.json({ error: 'UPI ID is required' }, { status: 400 })
    }

    // Validate UPI ID format: name@bank (e.g., user@paytm, name@oksbi)
    const upiRegex = /^[a-zA-Z0-9._-]{1,100}@[a-zA-Z]{2,}$/
    if (!upiRegex.test(upiId.trim())) {
      return NextResponse.json({ error: 'Invalid UPI ID format. Use format: name@bank' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      // Get balance
      const balance = await tx.aetherBalance.findUnique({
        where: { userId },
      })

      if (!balance) {
        throw new Error('Balance not found')
      }

      if (balance.balance < MIN_REDEEM_AMOUNT) {
        throw new Error(`Minimum redemption is ${MIN_REDEEM_AMOUNT} Aether (₹${(MIN_REDEEM_AMOUNT * AETHER_TO_INR_RATE).toFixed(0)})`)
      }

      // Deduct from balance
      const newBalance = balance.balance - MIN_REDEEM_AMOUNT
      const amountInr = (MIN_REDEEM_AMOUNT * AETHER_TO_INR_RATE)

      await tx.aetherBalance.update({
        where: { userId },
        data: {
          balance: newBalance,
          totalRedeemed: { increment: MIN_REDEEM_AMOUNT },
        },
      })

      // Create transaction record
      await tx.aetherTransaction.create({
        data: {
          userId,
          type: 'redeemed',
          source: 'redemption',
          description: `Redeemed ${MIN_REDEEM_AMOUNT} Aether for ₹${amountInr.toFixed(0)} via UPI`,
          amount: -MIN_REDEEM_AMOUNT,
          balanceAfter: newBalance,
        },
      })

      // Create redemption request
      const redemption = await tx.redemptionRequest.create({
        data: {
          userId,
          amountAether: MIN_REDEEM_AMOUNT,
          amountInr,
          upiId: upiId.trim(),
          status: 'pending',
        },
        select: {
          id: true,
          amountAether: true,
          amountInr: true,
          status: true,
          createdAt: true,
        },
      })

      return { newBalance, redemption }
    })

    return NextResponse.json({
      success: true,
      balance: result.newBalance,
      redemption: result.redemption,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    if (error instanceof Error && error.message.includes('Minimum redemption')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof Error && error.message.includes('Balance not found')) {
      return NextResponse.json({ error: 'Balance not found. Complete tasks to earn Aether first.' }, { status: 400 })
    }
    console.error('Aether redeem error:', error)
    return NextResponse.json({ error: 'Failed to process redemption' }, { status: 500 })
  }
}
