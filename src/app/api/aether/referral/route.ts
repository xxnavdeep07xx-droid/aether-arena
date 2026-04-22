import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { userId, profile } = await requireAuth(request)

    // Generate referral code from username
    const referralCode = profile.username.toLowerCase()

    // Count referrals
    const referralCount = await db.profile.count({
      where: {
        referredByCode: referralCode,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aetherarena.com'

    return NextResponse.json({
      referralCode,
      referralUrl: `${baseUrl}?ref=${referralCode}`,
      referralCount,
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Referral error:', error)
    return NextResponse.json({ error: 'Failed to fetch referral info' }, { status: 500 })
  }
}
