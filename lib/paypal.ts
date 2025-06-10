import fetch from "node-fetch"

const PAYPAL_API_URL = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com"

export const SUBSCRIPTION_PLANS = {
  premium: {
    name: "Premium Plan",
    description: "Premium features including unlimited likes and priority matching",
    price: "9.99",
    currency: "USD",
  },
  platinum: {
    name: "Platinum Plan",
    description: "All Premium features plus profile boost and background verification",
    price: "19.99",
    currency: "USD",
  },
}

/**
 * Get PayPal access token for API calls
 */
export async function getAccessToken(): Promise<string> {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials are not configured")
  }

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64")

  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`PayPal auth error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Failed to get PayPal access token:", error)
    throw new Error("Failed to authenticate with PayPal")
  }
}

/**
 * Create a PayPal order for a subscription plan
 */
export async function createOrder(planId: keyof typeof SUBSCRIPTION_PLANS) {
  const plan = SUBSCRIPTION_PLANS[planId]
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`)
  }

  try {
    const accessToken = await getAccessToken()

    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: plan.currency,
              value: plan.price,
            },
            description: plan.description,
          },
        ],
        application_context: {
          brand_name: "Mingle Finder",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`PayPal order creation error: ${JSON.stringify(errorData)}`)
    }

    return response.json()
  } catch (error) {
    console.error("Failed to create PayPal order:", error)
    throw error
  }
}

/**
 * Capture payment for a PayPal order
 */
export async function capturePayment(orderId: string) {
  if (!orderId) {
    throw new Error("Order ID is required")
  }

  try {
    const accessToken = await getAccessToken()

    const response = await fetch(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`PayPal capture error: ${JSON.stringify(errorData)}`)
    }

    return response.json()
  } catch (error) {
    console.error("Failed to capture PayPal payment:", error)
    throw error
  }
}

/**
 * Verify a PayPal webhook event
 */
export async function verifyWebhookSignature(
  body: string,
  headers: Record<string, string>
) {
  try {
    const accessToken = await getAccessToken()

    const response = await fetch(
      `${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auth_algo: headers["paypal-auth-algo"],
          cert_url: headers["paypal-cert-url"],
          transmission_id: headers["paypal-transmission-id"],
          transmission_sig: headers["paypal-transmission-sig"],
          transmission_time: headers["paypal-transmission-time"],
          webhook_id: process.env.PAYPAL_WEBHOOK_ID,
          webhook_event: JSON.parse(body),
        }),
      }
    )

    const data = await response.json()
    return data.verification_status === "SUCCESS"
  } catch (error) {
    console.error("Failed to verify PayPal webhook:", error)
    return false
  }
}
