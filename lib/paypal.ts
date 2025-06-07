import fetch from "node-fetch"

const PAYPAL_API_URL = process.env.NODE_ENV === "production"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com"

const SUBSCRIPTION_PLANS = {
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

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64")

  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()
  return data.access_token
}

async function createOrder(planId: keyof typeof SUBSCRIPTION_PLANS) {
  const plan = SUBSCRIPTION_PLANS[planId]
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
    }),
  })

  return response.json()
}

async function capturePayment(orderId: string) {
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

  return response.json()
}

export { SUBSCRIPTION_PLANS, createOrder, capturePayment } 