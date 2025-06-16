export function validateEnv() {
  // Only validate in development to avoid production crashes
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const requiredEnvVars = [
    'NEXT_PUBLIC_APP_URL',
    'JWT_SECRET',
    'DATABASE_URL',
  ]

  const optionalEnvVars = [
    'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
    'REDIS_URL',
    'REDIS_TOKEN',
    'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
    'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
  ]

  const missingRequired = requiredEnvVars.filter(env => !process.env[env])
  const missingOptional = optionalEnvVars.filter(env => !process.env[env])

  if (missingRequired.length > 0) {
    console.warn(`Missing required environment variables: ${missingRequired.join(', ')}`)
    console.warn('Some features may not work properly without these variables.')
  }

  if (missingOptional.length > 0) {
    console.info(`Missing optional environment variables: ${missingOptional.join(', ')}`)
  }
}