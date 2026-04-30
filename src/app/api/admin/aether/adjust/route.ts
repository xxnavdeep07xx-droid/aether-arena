import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth'
import { aetherAdjustSchema, formatZodError } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    await requireAdmin(request)

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Zod validation with amount bounds
    const parsed = aetherAdjustSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
    }

    const { userId, amount, reason } = parsed.data

    // Verify target user exists
    const targetUser = await db.profile.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const result = await db.$transaction(async (tx) => {
      // Get or create balance
      const balance = await tx.aetherBalance.upsert({
        where: { userId },
        create: { userId, balance: 0, totalEarned: 0, totalRedeemed: 0 },
        update: {},
      })

      // If negative, check sufficient balance
      if (amount < 0 && balance.balance + amount < 0) {
        throw new Error(`Insufficient balance. Current: ${balance.balance}, Attempting to deduct: ${Math.abs(amount)}`)
      }

      // Atomic balance update — prevents race conditions
      if (amount > 0) {
        await tx.aetherBalance.update({
          where: { userId },
          data: {
            balance: { increment: amount },
            totalEarned: { increment: amount },
          },
        })
      } else {
        await tx.aetherBalance.update({
          where: { userId },
          data: {
            balance: { decrement: Math.abs(amount) },
            totalRedeemed: { increment: Math.abs(amount) },
          },
        })
      }

      // Read updated balance for transaction record
      const updatedBalance = await tx.aetherBalance.findUnique({ where: { userId } })
      const newBalance = updatedBalance!.balance

      await tx.aetherTransaction.create({
        data: {
          userId,
          type: 'admin_adjustment',
          source: 'admin',
          description: `Admin: ${reason.trim()}`,
          amount,
          balanceAfter: newBalance,
        },
      })

      return { newBalance }
    })

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    if (error instanceof Error && error.message.includes('Insufficient balance')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Admin aether adjust error:', error)
    return NextResponse.json({ error: 'Failed to adjust Aether balance' }, { status: 500 })
  }
}
