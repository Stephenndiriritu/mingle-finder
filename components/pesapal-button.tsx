'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getSupportedCurrencies, getPlanPrice } from '@/lib/pesapal'
import { CreditCard, Smartphone, Banknote } from 'lucide-react'
import { toast } from 'sonner'

interface PesapalButtonProps {
  planId: string
  onSuccess?: () => void
  onError?: (error: any) => void
  disabled?: boolean
}

export function PesapalButton({ planId, onSuccess, onError, disabled }: PesapalButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [currency, setCurrency] = useState('KES')
  
  const currencies = getSupportedCurrencies()
  const amount = (() => {
    try {
      return getPlanPrice(planId, currency)
    } catch (error) {
      console.error('Error getting plan price:', error)
      return 0
    }
  })()

  // Check if Pesapal is configured
  const isPesapalConfigured = typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY &&
    process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY !== 'your_pesapal_consumer_key_here'

  if (!isPesapalConfigured) {
    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          Pesapal setup required
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Configure Pesapal credentials in environment variables
        </p>
      </div>
    )
  }

  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    // Basic phone number validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number')
      return
    }

    setIsProcessing(true)

    try {
      // Create Pesapal payment order
      const response = await fetch('/api/payment/pesapal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          currency,
          userPhone: phoneNumber
        })
      })

      const data = await response.json()

      if (data.success && data.redirectUrl) {
        // Close dialog and redirect to Pesapal
        setIsOpen(false)
        toast.success('Redirecting to Pesapal payment...')
        
        // Redirect to Pesapal payment page
        window.location.href = data.redirectUrl
      } else {
        throw new Error(data.error || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Pesapal payment error:', error)
      toast.error('Failed to process payment. Please try again.')
      onError?.(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode)
    return `${currency?.symbol || currencyCode} ${amount.toLocaleString()}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
          disabled={disabled || isProcessing}
        >
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Pay with Pesapal</span>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <CreditCard className="h-5 w-5 text-green-600" />
              <Smartphone className="h-5 w-5 text-blue-600" />
              <Banknote className="h-5 w-5 text-purple-600" />
            </div>
            <span>Pay with Pesapal</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Secure payment via Mobile Money, Cards & Bank Transfer
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name} ({curr.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. +254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Enter your mobile money number or phone number for payment notifications
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !phoneNumber.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Pay ${formatCurrency(amount, currency)}`
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              You will be redirected to Pesapal to complete your payment
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Smartphone className="h-3 w-3" />
                <span>M-Pesa</span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="h-3 w-3" />
                <span>Cards</span>
              </div>
              <div className="flex items-center space-x-1">
                <Banknote className="h-3 w-3" />
                <span>Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
