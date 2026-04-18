import { db } from '@/lib/db'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'aether_session'
const SESSION_MAX_AGE_DAYS = 30

export interface AuthUser {
  userId: string
  profile: {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    isAdmin: boolean
    isBanned: boolean
  }
}

/**
 * Read session token from cookie and return user info (or null)
 */
export async function getSession(request?: Request): Promise<AuthUser | null> {
  try {
    let token: string | undefined

    if (request) {
      // From request headers (for API routes)
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`))
        token = match ? match[1] : undefined
      }
    } else {
      // From next/headers cookies (for server components)
      const cookieStore = await cookies()
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    }

    if (!token) return null

    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isAdmin: true,
            isBanned: true,
          },
        },
      },
    })

    if (!session) return null

    // Check if session expired
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } })
      return null
    }

    return {
      userId: session.user.id,
      profile: session.user,
    }
  } catch {
    return null
  }
}

/**
 * Require authentication or throw error
 */
export async function requireAuth(request?: Request): Promise<AuthUser> {
  const session = await getSession(request)
  if (!session) {
    throw new AuthError('Authentication required', 401)
  }
  return session
}

/**
 * Require admin access or throw error
 */
export async function requireAdmin(request?: Request): Promise<AuthUser> {
  const session = await requireAuth(request)
  if (!session.profile.isAdmin) {
    throw new AuthError('Admin access required', 403)
  }
  return session
}

/**
 * Create a session for a user and return the token
 */
export async function createSession(userId: string): Promise<string> {
  // Use crypto.randomUUID() for a secure token
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS)

  await db.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  return token
}

/**
 * Delete a session by token
 */
export async function deleteSession(token: string): Promise<void> {
  await db.session.deleteMany({ where: { token } })
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } })
}

/**
 * Clean up expired sessions
 */
export async function cleanExpiredSessions(): Promise<number> {
  const result = await db.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  return result.count
}

/**
 * Get session cookie options
 */
export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60, // in seconds
  }
}

/**
 * Custom error class for auth errors
 */
export class AuthError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 401) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AuthError'
  }
}
