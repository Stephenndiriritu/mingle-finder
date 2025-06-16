export function validateEnv() {
  // Safe environment validation - logs warnings but doesn't crash
  const requiredEnvVars = [
    'NEXT_PUBLIC_APP_URL',
    'JWT_SECRET',
    'DATABASE_URL',
  ]

  const recommendedEnvVars = [
    'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
    'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
    'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
  ]

  const optionalEnvVars = [
    'REDIS_URL',
    'CLOUDINARY_CLOUD_NAME',
    'PESAPAL_CONSUMER_KEY',
  ]

  // Check required variables
  const missingRequired = requiredEnvVars.filter(env => !process.env[env])
  if (missingRequired.length > 0) {
    console.warn('⚠️  Missing required environment variables:', missingRequired.join(', '))
    console.warn('   Some core features may not work properly.')
  }

  // Check recommended variables
  const missingRecommended = recommendedEnvVars.filter(env => !process.env[env])
  if (missingRecommended.length > 0) {
    console.info('ℹ️  Missing recommended environment variables:', missingRecommended.join(', '))
    console.info('   Email notifications and payments may not work.')
  }

  // Check optional variables
  const missingOptional = optionalEnvVars.filter(env => !process.env[env])
  if (missingOptional.length > 0) {
    console.info('💡 Missing optional environment variables:', missingOptional.join(', '))
    console.info('   Advanced features like caching and file uploads may not work.')
  }

  // Log successful configuration
  const configuredVars = [...requiredEnvVars, ...recommendedEnvVars, ...optionalEnvVars]
    .filter(env => process.env[env])

  if (configuredVars.length > 0) {
    console.log('✅ Configured environment variables:', configuredVars.length, 'of',
      requiredEnvVars.length + recommendedEnvVars.length + optionalEnvVars.length)
  }
}