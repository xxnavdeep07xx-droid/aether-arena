import { NextResponse } from 'next/server'
import { sendOtpEmail } from '@/lib/email'

// Diagnostic endpoint to test email sending — REMOVE AFTER DEBUGGING
export async function POST(request: Request) {
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env_check: {
      GMAIL_USER: gmailUser ? `set (${gmailUser})` : 'NOT SET',
      GMAIL_APP_PASSWORD_set: !!gmailAppPassword,
      GMAIL_APP_PASSWORD_length: gmailAppPassword ? gmailAppPassword.length : 0,
      GMAIL_APP_PASSWORD_preview: gmailAppPassword ? `${gmailAppPassword.substring(0, 4)}...${gmailAppPassword.substring(gmailAppPassword.length - 4)}` : 'N/A',
      NODE_ENV: process.env.NODE_ENV,
    },
  }

  if (!gmailUser || !gmailAppPassword) {
    return NextResponse.json({
      error: 'GMAIL_USER or GMAIL_APP_PASSWORD not set',
      diagnostics,
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

  diagnostics.elapsed_ms = elapsed
  diagnostics.email_result = result
  diagnostics.test_email = testEmail

  return NextResponse.json(diagnostics)
}
