import crypto from 'crypto'

// Pesapal API Configuration
const PESAPAL_API_URL = process.env.NODE_ENV === "production"
  ? "https://pay.pesapal.com/v3"
  : "https://cybqa.pesapal.com/pesapalv3"

// Environment variables for Pesapal
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET
const PESAPAL_IPN_ID = process.env.PESAPAL_IPN_ID

if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
  console.warn('Pesapal credentials not configured')
}

// Subscription plans with local currency pricing
export const PESAPAL_SUBSCRIPTION_PLANS = {
  premium: {
    name: "Premium Plan",
    description: "Premium features including unlimited likes and priority matching",
    priceKES: 1299,
    priceUGX: 37000,
    priceTZS: 23000,
    priceUSD: 9.99,
    currency: "KES", // Default to Kenyan Shillings
  },
  premium_plus: {
    name: "Premium Plus Plan", 
    description: "All Premium features plus profile boost and background verification",
    priceKES: 2599,
    priceUGX: 74000,
    priceTZS: 46000,
    priceUSD: 19.99,
    currency: "KES", // Default to Kenyan Shillings
  },
}

// Get price based on currency
export function getPlanPrice(planId: string, currency: string = 'KES'): number {
  const plan = PESAPAL_SUBSCRIPTION_PLANS[planId as keyof typeof PESAPAL_SUBSCRIPTION_PLANS]
  if (!plan) throw new Error('Invalid plan ID')

  switch (currency.toUpperCase()) {
    case 'KES':
      return plan.priceKES
    case 'UGX':
      return plan.priceUGX
    case 'TZS':
      return plan.priceTZS
    case 'USD':
      return plan.priceUSD
    default:
      return plan.priceKES // Default to KES
  }
}

// Get access token from Pesapal
export async function getPesapalAccessToken(): Promise<string> {
  if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
    throw new Error('Pesapal credentials not configured')
  }

  try {
    const response = await fetch(`${PESAPAL_API_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: PESAPAL_CONSUMER_KEY,
        consumer_secret: PESAPAL_CONSUMER_SECRET,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get Pesapal access token: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.token) {
      throw new Error('No access token received from Pesapal')
    }

    return data.token
  } catch (error) {
    console.error('Error getting Pesapal access token:', error)
    throw error
  }
}

// Register IPN URL (Instant Payment Notification)
export async function registerIPN(ipnUrl: string): Promise<string> {
  const accessToken = await getPesapalAccessToken()

  try {
    const response = await fetch(`${PESAPAL_API_URL}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: 'GET',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to register IPN: ${response.statusText}`)
    }

    const data = await response.json()
    return data.ipn_id
  } catch (error) {
    console.error('Error registering IPN:', error)
    throw error
  }
}

// Create payment order with Pesapal
export async function createPesapalOrder(
  planId: string,
  userId: string,
  userEmail: string,
  userPhone: string,
  currency: string = 'KES'
) {
  const plan = PESAPAL_SUBSCRIPTION_PLANS[planId as keyof typeof PESAPAL_SUBSCRIPTION_PLANS]
  if (!plan) {
    throw new Error('Invalid plan selected')
  }

  const accessToken = await getPesapalAccessToken()
  const amount = getPlanPrice(planId, currency)
  const orderId = `MINGLE_${Date.now()}_${userId.slice(-8)}`

  const orderData = {
    id: orderId,
    currency: currency.toUpperCase(),
    amount: amount,
    description: plan.description,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/pesapal/callback`,
    notification_id: PESAPAL_IPN_ID,
    billing_address: {
      email_address: userEmail,
      phone_number: userPhone,
      country_code: currency === 'KES' ? 'KE' : currency === 'UGX' ? 'UG' : currency === 'TZS' ? 'TZ' : 'KE',
      first_name: 'User',
      last_name: 'Name',
    },
  }

  try {
    const response = await fetch(`${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create Pesapal order: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.redirect_url) {
      throw new Error('No redirect URL received from Pesapal')
    }

    return {
      orderId: orderId,
      redirectUrl: data.redirect_url,
      trackingId: data.order_tracking_id,
    }
  } catch (error) {
    console.error('Error creating Pesapal order:', error)
    throw error
  }
}

// Get transaction status from Pesapal
export async function getPesapalTransactionStatus(orderTrackingId: string) {
  const accessToken = await getPesapalAccessToken()

  try {
    const response = await fetch(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting transaction status:', error)
    throw error
  }
}

// Verify payment signature (for webhook security)
export function verifyPesapalSignature(
  orderId: string,
  trackingId: string,
  signature: string
): boolean {
  if (!PESAPAL_CONSUMER_SECRET) {
    throw new Error('Pesapal consumer secret not configured')
  }

  const message = `${orderId}${trackingId}`
  const expectedSignature = crypto
    .createHmac('sha256', PESAPAL_CONSUMER_SECRET)
    .update(message)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

// Get supported currencies for user's location
export function getSupportedCurrencies(countryCode?: string): Array<{code: string, name: string, symbol: string}> {
  const currencies = [
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
  ]

  // Return all currencies, but prioritize based on country
  if (countryCode) {
    const priorityMap: Record<string, string> = {
      'KE': 'KES',
      'UG': 'UGX', 
      'TZ': 'TZS',
    }
    
    const priority = priorityMap[countryCode.toUpperCase()]
    if (priority) {
      const priorityCurrency = currencies.find(c => c.code === priority)
      const others = currencies.filter(c => c.code !== priority)
      return priorityCurrency ? [priorityCurrency, ...others] : currencies
    }
  }

  return currencies
}
