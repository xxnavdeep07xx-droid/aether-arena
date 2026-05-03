import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { strictLimiter } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Rate limiting: max 5 verification attempts per minute per IP
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { success: rateLimitOk } = await strictLimiter(`verify-email-otp:${clientIp}`)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  let body: { email?: string; otp?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, otp } = body

  if (!email || !otp || otp.length !== 6) {
    return NextResponse.json({ error: 'Email and 6-digit OTP are required' }, { status: 400 })
  }

  // Find the OTP record
  const verification = await db.phoneVerification.findFirst({
    where: {
      phone: email.toLowerCase(),
      purpose: 'email_otp',
      verified: false,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!verification) {
    return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
  }

  // Check if expired
  if (verification.expiresAt < new Date()) {
    await db.phoneVerification.delete({ where: { id: verification.id } })
    return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
  }

  // Check if OTP matches
  if (verification.otp !== otp) {
    // Increment failed attempt counter — after 5 wrong attempts, invalidate the OTP
    const failKey = `otp-fail:${email.toLowerCase()}`
    const { success: canAttempt } = await strictLimiter(failKey)
    if (!canAttempt) {
      // Too many failed attempts — invalidate the OTP
      await db.phoneVerification.delete({ where: { id: verification.id } })
      return NextResponse.json({ error: 'Too many wrong attempts. Please request a new OTP.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
  }

  // Mark as verified
  await db.phoneVerification.update({
    where: { id: verification.id },
    data: { verified: true },
  })

  return NextResponse.json({ success: true, verified: true })
}
