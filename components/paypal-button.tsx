'use client'

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface PayPalButtonProps {
  planId: string
  amount: string
  onSuccess?: () => void
  onError?: (error: any) => void
}

export function PayPalButton({ planId, amount, onSuccess, onError }: PayPalButtonProps) {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer()
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  // Check if PayPal is properly configured
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  if (!clientId || clientId === 'your_paypal_client_id_here') {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          PayPal setup required
        </p>
        <p className="text-xs text-gray-500 mt-1">
          See setup instructions above
        </p>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800 mb-2">
          <strong>PayPal Failed to Load</strong>
        </p>
        <p className="text-xs text-red-700">
          There was an error loading PayPal. Please check your credentials and try again.
        </p>
      </div>
    )
  }

  const createOrder = async () => {
    try {
      setIsProcessing(true)
      
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      return data.orderId
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create payment order')
      onError?.(error)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const onApprove = async (data: any) => {
    try {
      setIsProcessing(true)
      
      const response = await fetch('/api/payment/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: data.orderID }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment')
      }

      toast.success('Payment successful! Welcome to premium!')
      onSuccess?.()
      
      // Redirect to success page
      router.push(`/app/payment/success?plan=${planId}&amount=${amount}`)
    } catch (error) {
      console.error('Error capturing payment:', error)
      toast.error('Payment processing failed')
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const onErrorHandler = (err: any) => {
    console.error('PayPal error:', err)
    toast.error('Payment error occurred')
    onError?.(err)
  }

  const onCancel = () => {
    toast.info('Payment cancelled')
  }

  if (isPending) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading PayPal...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Processing...</span>
          </div>
        </div>
      )}
      
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 45,
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onErrorHandler}
        onCancel={onCancel}
        disabled={isProcessing}
      />
    </div>
  )
}
