import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, AuthError } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)
    const { id } = await params

    let body: { action?: string; adminNote?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { action, adminNote } = body

    if (!action || !['approve', 'reject', 'mark_paid'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve", "reject", or "mark_paid"' },
        { status: 400 }
      )
    }

    // Get the redemption request
    const redemption = await db.redemptionRequest.findUnique({
      where: { id },
    })

    if (!redemption) {
      return NextResponse.json({ error: 'Redemption not found' }, { status: 404 })
    }

    if (redemption.status === 'paid') {
      return NextResponse.json({ error: 'Already paid, cannot modify' }, { status: 400 })
    }

    if (action === 'approve') {
      if (redemption.status !== 'pending') {
        return NextResponse.json({ error: 'Can only approve pending requests' }, { status: 400 })
      }

      const updated = await db.redemptionRequest.update({
        where: { id },
        data: {
          status: 'approved',
          adminNote: adminNote || null,
          processedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, redemption: updated })
    }

    if (action === 'reject') {
      if (redemption.status !== 'pending') {
        return NextResponse.json({ error: 'Can only reject pending requests' }, { status: 400 })
      }

      // Refund Aether back to user
      const result = await db.$transaction(async (tx) => {
        // Atomic balance increment for refund
        await tx.aetherBalance.update({
          where: { userId: redemption.userId },
          data: {
            balance: { increment: redemption.amountAether },
            totalRedeemed: { decrement: redemption.amountAether },
          },
        })

        // Read updated balance for transaction record
        const updatedBalance = await tx.aetherBalance.findUnique({ where: { userId: redemption.userId } })
        const newBalance = updatedBalance!.balance

        await tx.aetherTransaction.create({
          data: {
            userId: redemption.userId,
            type: 'refunded',
            source: 'redemption_reject',
            description: `Refund: Redemption rejected (${redemption.amountAether} Aether)`,
            amount: redemption.amountAether,
            balanceAfter: newBalance,
          },
        })

        const updated = await tx.redemptionRequest.update({
          where: { id },
          data: {
            status: 'rejected',
            adminNote: adminNote || null,
            processedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        })

        return updated
      })

      return NextResponse.json({ success: true, redemption: result })
    }

    if (action === 'mark_paid') {
      if (redemption.status !== 'approved') {
        return NextResponse.json({ error: 'Can only mark approved requests as paid' }, { status: 400 })
      }

      const updated = await db.redemptionRequest.update({
        where: { id },
        data: {
          status: 'paid',
          adminNote: adminNote || null,
          processedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      })

      return NextResponse.json({ success: true, redemption: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Admin redemption update error:', error)
    return NextResponse.json({ error: 'Failed to update redemption' }, { status: 500 })
  }
}
