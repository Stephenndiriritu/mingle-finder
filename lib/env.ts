export function validateEnv() {
  const requiredEnvVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ]

  const optionalEnvVars = [
    'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
    'REDIS_URL',
    'REDIS_TOKEN',
  ]

  const missingRequired = requiredEnvVars.filter(env => !process.env[env])
  const missingOptional = optionalEnvVars.filter(env => !process.env[env])

  if (missingRequired.length > 0) {
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`)
  }

  if (missingOptional.length > 0) {
    console.warn(`Missing optional environment variables: ${missingOptional.join(', ')}`)
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DB_CA_CERT) {
      throw new Error('DB_CA_CERT must be set in production')
    }
  }
} 