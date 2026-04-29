import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { authLimiter } from '@/lib/rate-limit'

// PUT /api/profiles/me/password — Change password for email/password users
export async function PUT(request: Request) {
  // Rate limiting — same as auth routes to prevent brute-force password changes
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const { success: rateLimitOk } = await authLimiter(`password:${clientIp}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many password change attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const auth = await requireAuth(request)

    let body: { currentPassword?: string; newPassword?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }
    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'New password must be 128 characters or less' },
        { status: 400 }
      )
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'New password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      )
    }

    // Get the user's credential
    const credential = await db.accountCredential.findUnique({
      where: { userId: auth.userId },
    })

    if (!credential) {
      return NextResponse.json(
        { error: 'No password account found. You may have signed in with Discord.' },
        { status: 400 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, credential.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await db.accountCredential.update({
      where: { userId: auth.userId },
      data: { password: hashedPassword },
    })

    // Delete all other sessions (keep current one) for security
    const currentSession = request.headers.get('cookie')?.match(/aether_session=([^;]+)/)?.[1]
    if (currentSession) {
      await db.session.deleteMany({
        where: {
          userId: auth.userId,
          token: { not: currentSession },
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
