-- Aether Arena Schema Migration
-- Run this SQL on Supabase to add phone number fields, 
-- PhoneVerification table, and update unique constraints

-- ============================================
-- 1. Add phone and phoneVerified columns to Profile table
-- ============================================
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- Add unique constraint on phone (allows NULL, enforces uniqueness for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_phone_key" ON "Profile"("phone") WHERE "phone" IS NOT NULL;

-- Add index on phone for lookups
CREATE INDEX IF NOT EXISTS "Profile_phone_idx" ON "Profile"("phone");

-- ============================================
-- 2. Add phone and phoneVerified columns to AccountCredential table
-- ============================================
ALTER TABLE "AccountCredential" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "AccountCredential" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- Add unique constraint on phone (allows NULL)
CREATE UNIQUE INDEX IF NOT EXISTS "AccountCredential_phone_key" ON "AccountCredential"("phone") WHERE "phone" IS NOT NULL;

-- Add index on phone for lookups
CREATE INDEX IF NOT EXISTS "AccountCredential_phone_idx" ON "AccountCredential"("phone");

-- ============================================
-- 3. Create PhoneVerification table for OTP verification
-- ============================================
CREATE TABLE IF NOT EXISTS "PhoneVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'signup',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneVerification_pkey" PRIMARY KEY ("id")
);

-- Indexes for PhoneVerification
CREATE INDEX IF NOT EXISTS "PhoneVerification_phone_idx" ON "PhoneVerification"("phone");
CREATE INDEX IF NOT EXISTS "PhoneVerification_expiresAt_idx" ON "PhoneVerification"("expiresAt");

-- ============================================
-- 4. Clean up expired OTP records periodically (optional)
-- ============================================
-- You can set up a cron job or pg_cron extension to run:
-- DELETE FROM "PhoneVerification" WHERE "expiresAt" < NOW();
