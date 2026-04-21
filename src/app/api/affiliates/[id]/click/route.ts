import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const affiliate = await db.affiliateLink.update({
      where: { id, isActive: true },
      data: { clicks: { increment: 1 } },
    })

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate link not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, url: affiliate.url })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
