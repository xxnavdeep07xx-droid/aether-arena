import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params

    // Use updateMany with userId filter — combines ownership check and update in one query
    // Returns count=0 if notification doesn't exist or doesn't belong to user
    const result = await db.notification.updateMany({
      where: { id, userId: auth.userId, isRead: false },
      data: { isRead: true },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
