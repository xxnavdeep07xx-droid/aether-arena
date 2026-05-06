import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { strictLimiter } from '@/lib/rate-limit'
import crypto from 'crypto'

// POST /api/auth/resend-verification — Resend email verification link
export async function POST(request: Request) {
  // Rate limiting — strict to prevent email abuse
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { success: rateLimitOk } = await strictLimiter(`resend-verify:${clientIp}`)
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const { userId } = await requireAuth(request)

    // Get the user's credential
    const credential = await db.accountCredential.findUnique({
      where: { userId },
      include: { user: { select: { username: true } } },
    })

    if (!credential) {
      return NextResponse.json(
        { error: 'No email/password account found' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c: any = credential;
    // Already verified
    if (c.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      )
    }

    // Check cooldown: don't resend if last token was created < 60 seconds ago
    if (
      c.emailVerificationExpires &&
      new Date(Date.now() - 60 * 1000) < new Date(c.emailVerificationExpires.getTime() - 24 * 60 * 60 * 1000)
    ) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting another verification email.' },
        { status: 429 }
      )
    }

    // Generate a new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.accountCredential.update({
      where: { id: credential.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      } as any,
    })

    // Send the email
    const result = await sendVerificationEmail(
      credential.email,
      credential.user.username,
      verificationToken
    )

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent! Check your inbox.',
    })
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}
