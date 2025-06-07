'use client'

import { PayPalScriptProvider } from "@paypal/react-paypal-js"

const initialPayPalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
}

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={initialPayPalOptions}>
      {children}
    </PayPalScriptProvider>
  )
} 