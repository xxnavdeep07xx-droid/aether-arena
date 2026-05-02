import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { updateSettingsSchema, formatZodError } from '@/lib/validations'

// Keys whose values should never be returned in GET responses (sensitive credentials)
const SENSITIVE_KEYS = new Set([
  'razorpay_key_secret',
  'razorpay_webhook_secret',
  'gpay_number',   // Sensitive — only shown to admin via redacted indicator
  'gpay_upi_id',   // Sensitive — only shown to admin via redacted indicator
])

export async function GET(request: Request) {
  try {
    await requireAdmin(request)

    const settings = await db.platformSetting.findMany({
      orderBy: { key: 'asc' },
    })

    // Convert to key-value object, redacting sensitive values
    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      if (SENSITIVE_KEYS.has(setting.key)) {
        settingsMap[setting.key] = setting.value ? '••••••••' : '' // redact but indicate if set
      } else {
        settingsMap[setting.key] = setting.value
      }
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
    // Request body size limit
    const contentLength = parseInt(request.headers.get('content-length') || '0')
    if (contentLength > 100_000) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
    }

    const auth = await requireAdmin(request)
    const body = await request.json()

    // Zod validation with setting key whitelist
    const parsed = updateSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 })
    }

    const { settings } = parsed.data

    // Upsert each setting (keys are already validated against whitelist)
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
