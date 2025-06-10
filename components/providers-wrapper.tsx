'use client'

import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/components/theme-provider"
import { PayPalProvider } from "@/components/paypal-provider"

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <PayPalProvider>
        {children}
      </PayPalProvider>
      <Toaster />
    </ThemeProvider>
  )
}

