import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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

  const testEmail = body.email || gmailUser

  // Test 1: Create transporter
  let transporter: nodemailer.Transporter
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })
    diagnostics.step1_create_transporter = 'OK'
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    diagnostics.step1_create_transporter = `FAILED: ${msg}`
    return NextResponse.json({ error: 'Transporter creation failed', diagnostics }, { status: 500 })
  }

  // Test 2: Verify connection
  const verifyStart = Date.now()
  try {
    await transporter.verify()
    diagnostics.step2_verify = `OK (${Date.now() - verifyStart}ms)`
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    diagnostics.step2_verify = `FAILED (${Date.now() - verifyStart}ms): ${msg}`
    try { transporter.close() } catch {}
    return NextResponse.json({ error: 'SMTP verification failed', diagnostics }, { status: 500 })
  }

  // Test 3: Send email
  const sendStart = Date.now()
  try {
    const info = await transporter.sendMail({
      from: `"Aether Arena" <${gmailUser}>`,
      to: testEmail,
      subject: 'Test Email from Aether Arena',
      html: '<p>This is a test email. OTP: 123456</p>',
    })
    diagnostics.step3_send = {
      status: 'OK',
      elapsed_ms: Date.now() - sendStart,
      messageId: info.messageId,
      response: info.response,
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    diagnostics.step3_send = {
      status: 'FAILED',
      elapsed_ms: Date.now() - sendStart,
      error: msg,
    }
    try { transporter.close() } catch {}
    return NextResponse.json({ error: 'Email send failed', diagnostics }, { status: 500 })
  }

  try { transporter.close() } catch {}
  return NextResponse.json({ success: true, diagnostics })
}
