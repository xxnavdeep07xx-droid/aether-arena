import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request)

    const credential = await db.accountCredential.findUnique({
      where: { userId: auth.userId },
      select: {
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      email: credential?.email || null,
      hasPassword: !!credential,
      createdAt: credential?.createdAt || null,
    })
  } catch (error: unknown) {
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
