import { NextResponse } from 'next/server'
import { getSession, deleteSession, getSessionCookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession(request)

    if (session) {
      // Read token from cookie
      const cookieHeader = request.headers.get('cookie')
      let token: string | undefined
      if (cookieHeader) {
        const cookieOptions = getSessionCookieOptions()
        const match = cookieHeader.match(new RegExp(`${cookieOptions.name}=([^;]+)`))
        token = match ? match[1] : undefined
      }

      if (token) {
        await deleteSession(token)
      }
    }

    const response = NextResponse.json({ success: true })
    const cookieOptions = getSessionCookieOptions()
    response.cookies.set(cookieOptions.name, '', {
      ...cookieOptions,
      maxAge: 0,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
