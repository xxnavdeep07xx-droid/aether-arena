import { NextResponse } from 'next/server'
import { sendOtpEmail } from '@/lib/email'

// Diagnostic endpoint to test email sending — REMOVE AFTER DEBUGGING
export async function POST(request: Request) {
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailAppPassword) {
    return NextResponse.json({
      error: 'GMAIL_USER or GMAIL_APP_PASSWORD not set',
      gmailUserSet: !!gmailUser,
      gmailAppPasswordSet: !!gmailAppPassword,
      gmailUserValue: gmailUser || 'NOT SET',
      gmailAppPasswordLength: gmailAppPassword ? gmailAppPassword.length : 0,
      gmailAppPasswordFirst4: gmailAppPassword ? gmailAppPassword.substring(0, 4) : 'N/A',
    }, { status: 500 })
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const testEmail = body.email || gmailUser // Send to self by default
  const testOtp = '123456'

  const startTime = Date.now()
  const result = await sendOtpEmail(testEmail, testOtp)
  const elapsed = Date.now() - startTime

  return NextResponse.json({
    ...result,
    elapsed_ms: elapsed,
    testEmail,
    gmailUserSet: true,
    gmailAppPasswordSet: true,
    gmailUserValue: gmailUser,
    gmailAppPasswordLength: gmailAppPassword.length,
    gmailAppPasswordPreview: gmailAppPassword.substring(0, 4) + '...' + gmailAppPassword.substring(gmailAppPassword.length - 4),
  })
}
