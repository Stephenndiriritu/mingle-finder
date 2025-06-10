'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  // Check if PayPal credentials are configured
  if (!clientId || clientId === 'your_sandbox_client_id_here') {
    console.warn('PayPal Client ID is not configured or using placeholder value')
    return <>{children}</>
  }

  const initialOptions = {
    clientId,
    currency: 'USD',
    intent: 'capture',
    components: 'buttons,funding-eligibility',
    enableFunding: 'venmo,paylater',
    disableFunding: 'card'
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  )
}
