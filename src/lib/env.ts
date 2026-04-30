// Environment variable validation — runs at import time
// Fails fast if required variables are missing in production

function validateEnv() {
  // Only validate in production (allow missing vars in dev for convenience)
  if (process.env.NODE_ENV !== 'production') return

  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_BASE_URL',
    'CRON_SECRET',
    'SETUP_SECRET',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error(
      `[ENV] Missing required environment variables: ${missing.join(', ')}. ` +
      `Set these in your Vercel project settings.`
    )
    // Don't throw in serverless — just log loudly. The app will still start
    // but individual routes that need these vars will fail with clear errors.
  }

  // Warn about optional but important variables
  const optional = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'GMAIL_USER',
    'GMAIL_APP_PASSWORD',
    'REDIS_URL',
  ]

  const missingOptional = optional.filter((key) => !process.env[key])
  if (missingOptional.length > 0) {
    console.warn(
      `[ENV] Optional variables not set: ${missingOptional.join(', ')}. ` +
      `Some features may be disabled.`
    )
  }
}

// Run validation on import
validateEnv()
