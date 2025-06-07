'use client'

import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "react-hot-toast"

const initialPayPalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
}

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PayPalScriptProvider options={initialPayPalOptions}>
        {children}
        <Toaster />
      </PayPalScriptProvider>
    </AuthProvider>
  )
} 