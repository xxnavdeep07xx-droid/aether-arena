import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth(request)

    // Get or create balance
    const balance = await db.aetherBalance.upsert({
      where: { userId },
      create: { userId },
      update: {},
    })

    return NextResponse.json({
      balance: balance.balance,
      totalEarned: balance.totalEarned,
      totalRedeemed: balance.totalRedeemed,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Aether balance error:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
