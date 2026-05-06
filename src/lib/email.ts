// Email sending utility — uses Gmail SMTP (nodemailer)
// 500 free emails/day via Gmail — no custom domain needed!
//
// Gmail setup:
// 1. Go to https://myaccount.google.com/security
// 2. Enable 2-Step Verification
// 3. Go to https://myaccount.google.com/apppasswords
// 4. Create an App Password for "Mail" → use that as GMAIL_APP_PASSWORD

import nodemailer from 'nodemailer'

// ─── Gmail SMTP Transporter ──────────────────────────────────
// NOT a singleton — Vercel serverless functions need fresh connections
// because env vars can change between deployments and connections
// can go stale between cold starts.

function getGmailTransporter(): nodemailer.Transporter | null {
  if (typeof window !== 'undefined') return null

  const gmailUser = process.env.GMAIL_USER
  let gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailAppPassword) {
    console.warn('[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set')
    console.warn('[Email] GMAIL_USER:', gmailUser ? `set (${gmailUser})` : 'NOT SET')
    console.warn('[Email] GMAIL_APP_PASSWORD:', gmailAppPassword ? `set (length: ${gmailAppPassword.length})` : 'NOT SET')
    return null
  }

  // Strip spaces from app password — Gmail generates them as "xxxx xxxx xxxx xxxx"
  // but the actual password is the 16 chars without spaces
  gmailAppPassword = gmailAppPassword.replace(/\s/g, '')

  console.log('[Email] Creating Gmail transporter for:', gmailUser)
  console.log('[Email] App password length:', gmailAppPassword.length, 'preview:', gmailAppPassword.substring(0, 4) + '...')

  try {
    // Use explicit SMTP settings instead of service: 'gmail'
    // to avoid type errors with @types/nodemailer v8
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      // Connection timeouts for Vercel serverless
      connectionTimeout: 8000, // 8 seconds to connect
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
    return transporter
  } catch (error) {
    console.error('[Email] Failed to create transporter:', error)
    return null
  }
}

// ─── Email From Address ───────────────────────────────────────

function getFromEmail(): string {
  return process.env.EMAIL_FROM || 'Aether Arena <aetherarena.999@gmail.com>'
}

// ─── HTML Escape Utility ──────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// ─── Send Email Verification ──────────────────────────────────

export async function sendVerificationEmail(
  toEmail: string,
  username: string,
  verificationToken: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = getGmailTransporter()

  if (!transporter) {
    console.warn('[Email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping verification email')
    return { success: false, error: 'Email service not configured' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`

  try {
    // Skip transporter.verify() — it wastes time on Vercel serverless
    // by creating an extra SMTP connection. Just send directly.
    console.log('[Email] Sending verification email directly to:', toEmail)

    await transporter.sendMail({
      from: getFromEmail(),
      to: toEmail,
      subject: 'Verify your email — Aether Arena',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f23; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color: #1a1a3e; border-radius: 16px; border: 1px solid #2a2a5a; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px 40px;">
                      <h1 style="margin: 0; color: #a78bfa; font-size: 28px; font-weight: 700;">Aether Arena</h1>
                      <p style="margin: 8px 0 0 0; color: #8888aa; font-size: 14px;">Your Esports Battlefield</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 30px 40px;">
                      <p style="margin: 0 0 16px 0; color: #e0e0ff; font-size: 16px;">
                        Hey <strong style="color: #a78bfa;">${escapeHtml(username)}</strong>,
                      </p>
                      <p style="margin: 0 0 24px 0; color: #b0b0cc; font-size: 15px; line-height: 1.6;">
                        Welcome to Aether Arena! To get started, please verify your email address by clicking the button below. This link expires in <strong style="color: #e0e0ff;">24 hours</strong>.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #a78bfa);">
                            <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 24px 0 0 0; color: #8888aa; font-size: 13px; line-height: 1.5;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="${verificationUrl}" style="color: #a78bfa; word-break: break-all;">${verificationUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 30px 40px; border-top: 1px solid #2a2a5a;">
                      <p style="margin: 0; color: #666688; font-size: 12px; text-align: center;">
                        If you didn't create an account on Aether Arena, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log('[Email] Verification email sent successfully to:', toEmail)
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[Email] Failed to send verification email:', msg)
    console.error('[Email] Full error:', error)
    return { success: false, error: `Failed to send email: ${msg}` }
  } finally {
    try { transporter.close() } catch {}
  }
}

// ─── Send OTP Email ───────────────────────────────────────────

export async function sendOtpEmail(
  toEmail: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const transporter = getGmailTransporter()

  if (!transporter) {
    console.warn('[Email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping OTP email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    // Skip transporter.verify() — it wastes a full SMTP round-trip
    // on Vercel serverless. Just send directly; if auth fails,
    // sendMail will throw with a clear error message.
    console.log('[Email] Sending OTP email directly to:', toEmail)

    await transporter.sendMail({
      from: getFromEmail(),
      to: toEmail,
      subject: 'Your Aether Arena Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f23; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="500" cellpadding="0" cellspacing="0" style="background-color: #1a1a3e; border-radius: 16px; border: 1px solid #2a2a5a; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 40px 40px 20px 40px;">
                      <h1 style="margin: 0; color: #a78bfa; font-size: 28px; font-weight: 700;">Aether Arena</h1>
                      <p style="margin: 8px 0 0 0; color: #8888aa; font-size: 14px;">Your Esports Battlefield</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 30px 40px;">
                      <p style="margin: 0 0 16px 0; color: #b0b0cc; font-size: 15px; line-height: 1.6;">
                        Use the verification code below to complete your registration. This code expires in <strong style="color: #e0e0ff;">5 minutes</strong>.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td align="center" style="background-color: #0f0f23; border-radius: 12px; border: 2px dashed #7c3aed; padding: 20px 40px;">
                            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #a78bfa; font-family: 'Courier New', monospace;">${otp}</span>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 24px 0 0 0; color: #8888aa; font-size: 13px; line-height: 1.5; text-align: center;">
                        If you didn&apos;t request this code, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log('[Email] OTP email sent successfully to:', toEmail)
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[Email] Failed to send OTP email:', msg)
    console.error('[Email] Full error:', error)
    return { success: false, error: `Failed to send email: ${msg}` }
  } finally {
    try { transporter.close() } catch {}
  }
}
