import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const settings = await db.platformSetting.findMany({
      orderBy: { key: 'asc' },
    })

    // Convert to key-value object
    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({ settings: settingsMap })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin(request)
    const body = await request.json()
    const { settings } = body as { settings: Record<string, string> }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object is required' }, { status: 400 })
    }

    // Upsert each setting
    const results = await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        db.platformSetting.upsert({
          where: { key },
          update: { value, updatedById: auth.userId },
          create: { key, value, updatedById: auth.userId },
        })
      )
    )

    return NextResponse.json({ settings: results })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const authError = error as { statusCode: number; message: string }
      return NextResponse.json({ error: authError.message }, { status: authError.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
