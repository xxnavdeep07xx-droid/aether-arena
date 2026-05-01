import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/auth/verify-email?token=xxx — Verify email address via token
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/verify-email?error=missing_token`
    )
  }

  try {
    // Find the credential with this verification token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const credential: any = await db.accountCredential.findUnique({
      where: { emailVerificationToken: token } as any,
    })

    if (!credential) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/verify-email?error=invalid_token`
      )
    }

    // Check if already verified
    if (credential.emailVerified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/verify-email?status=already_verified`
      )
    }

    // Check if token has expired
    if (
      credential.emailVerificationExpires &&
      new Date() > credential.emailVerificationExpires
    ) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/verify-email?error=expired`
      )
    }

    // Mark email as verified and clear the token
    await db.accountCredential.update({
      where: { id: credential.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      } as any,
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/verify-email?status=success`
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/verify-email?error=server_error`
    )
  }
}
