// Shared Zod validation schemas for API endpoints
// Ensures consistent input validation across all write routes

import { z } from 'zod'

// ─── Profile ──────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().max(2000).optional().or(z.literal('')),
})

// ─── Payments ─────────────────────────────────────────────────

export const createOrderSchema = z.object({
  amount: z.number().int().positive(),
  tournamentId: z.string().cuid(),
  currency: z.string().length(3).default('INR'),
})

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  tournamentId: z.string().cuid(),
})

// ─── Tournament Registration ──────────────────────────────────

export const registerTournamentSchema = z.object({
  paymentMethod: z.enum(['razorpay', 'upi', 'manual', 'gpay']).optional(),
  paymentReference: z.string().max(200).optional(),
  paymentScreenshotUrl: z.string().url().max(2000).optional(),
})

// ─── Admin: Settings ──────────────────────────────────────────

export const ALLOWED_SETTINGS_KEYS = new Set([
  'site_name',
  'maintenance_mode',
  'razorpay_key_id',
  'registration_enabled',
  'max_tournaments_per_user',
  'default_entry_fee',
  'announcement',
  'discord_invite_url',
  'youtube_channel_url',
  'instagram_url',
  'twitter_url',
  'whatsapp_channel_url',
  'gpay_number',
  'gpay_upi_id',
  'razorpay_coming_soon',
])

export const updateSettingsSchema = z.object({
  settings: z.record(z.string(), z.string()).refine(
    (obj) => Object.keys(obj).every((key) => ALLOWED_SETTINGS_KEYS.has(key)),
    { message: 'One or more setting keys are not allowed' }
  ),
})

// ─── Admin: Aether Adjust ─────────────────────────────────────

export const aetherAdjustSchema = z.object({
  userId: z.string().cuid(),
  amount: z.number().int().min(-10000).max(10000).refine((n) => n !== 0, { message: 'Amount must be non-zero' }),
  reason: z.string().min(1).max(500),
})

// ─── Aether Redeem ────────────────────────────────────────────

export const redeemAetherSchema = z.object({
  upiId: z.string().regex(/^[a-zA-Z0-9._-]{1,100}@[a-zA-Z]{2,}$/, 'Invalid UPI ID format. Use format: name@bank'),
})

// ─── Helper: Safe parse with error formatting ─────────────────

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
}
