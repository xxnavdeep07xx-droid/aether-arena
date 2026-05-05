import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { strictLimiter, authLimiter } from '@/lib/rate-limit'
import { sendOtpEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  // Rate limit: 5 OTP requests per 15 min per IP
  const { success: ipLimitOk } = await authLimiter(`email-otp:${clientIp}`)
  if (!ipLimitOk) {
    return NextResponse.json({ error: 'Too many OTP requests. Please try again later.' }, { status: 429 })
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email } = body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  // Rate limit: 1 OTP per email per 60 seconds
  const { success: emailLimitOk } = await strictLimiter(`email-otp-addr:${email.toLowerCase()}`)
  if (!emailLimitOk) {
    return NextResponse.json({ error: 'Please wait before requesting another OTP' }, { status: 429 })
  }

  // Check if email is already registered
  const existingCred = await db.accountCredential.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (existingCred) {
    // Don't reveal that the email exists - return success anyway
    return NextResponse.json({ success: true, message: 'If this email is not registered, an OTP has been sent.' })
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  // Delete any existing OTP for this email
  await db.phoneVerification.deleteMany({
    where: { phone: email.toLowerCase(), purpose: 'email_otp' },
  })

  // Store OTP
  await db.phoneVerification.create({
    data: {
      phone: email.toLowerCase(),
      otp,
      purpose: 'email_otp',
      verified: false,
      expiresAt,
    },
  })

  // Send OTP email — AWAIT the result
  const emailResult = await sendOtpEmail(email, otp)

  if (!emailResult.success) {
    console.error('[SendEmailOTP] Email failed to send:', emailResult.error)
    // Return an error so the user knows the OTP wasn't sent
    // They can try again — the OTP is stored in DB so verify will still work
    // if the email was actually delivered but we got a false error
    return NextResponse.json({
      error: 'Failed to send OTP email. Please try again.',
      _debug: emailResult.error,
    }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
