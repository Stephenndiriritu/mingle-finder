"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// import { PayPalButtons } from "@paypal/react-paypal-js" // Disabled for demo
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Zap, Heart, Star, Shield, Check } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { toast } from "react-hot-toast"

const SUBSCRIPTION_PLANS = {
  premium: {
    id: "premium",
    name: "Premium",
    price: "$9.99/mo",
    color: "from-pink-500 to-purple-600",
    features: [
      "Advanced matching",
      "Unlimited swipes",
      "See who likes you",
      "Priority support",
      "No ads",
      "Profile boosts"
    ]
  },
  platinum: {
    id: "platinum",
    name: "Platinum",
    price: "$19.99/mo",
    color: "from-purple-500 to-indigo-600",
    features: [
      "All Premium features",
      "Background verification",
      "Premium badge",
      "Top profile placement",
      "Read receipts",
      "Advanced filters",
      "Exclusive events"
    ]
  }
}

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paypalError, setPaypalError] = useState<string | null>(null)
  const router = useRouter()

  // Create order for PayPal
  const createOrder = async (planId: string) => {
    setIsLoading(true)
    setPaypalError(null)
    
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ planId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create order")
      }

      const data = await response.json()
      setOrderId(data.orderId)
      return data.orderId
    } catch (error) {
      console.error("Failed to create order:", error)
      setPaypalError(error instanceof Error ? error.message : "Failed to create order")
      toast.error("Failed to start subscription process. Please try again.")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Handle PayPal approval
  const onApprove = async (data: { orderID: string }) => {
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/subscription", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "capture",
          orderId: data.orderID
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete payment")
      }

      toast.success("Successfully subscribed!")
      router.push("/app/settings")
    } catch (error) {
      console.error("Failed to complete payment:", error)
      setPaypalError(error instanceof Error ? error.message : "Failed to complete payment")
      toast.error("Failed to complete subscription. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle PayPal errors
  const onError = (err: Record<string, unknown>) => {
    console.error("PayPal error:", err)
    setPaypalError("PayPal encountered an error. Please try again.")
    toast.error("Payment processing error. Please try again.")
  }

  // Handle subscription selection
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setOrderId(null)
    setPaypalError(null)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Premium Membership</h1>
      
      {paypalError && (
        <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {paypalError}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
        {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
          <Card 
            key={plan.id}
            className={`overflow-hidden ${
              selectedPlan === plan.id ? 'ring-2 ring-pink-500' : ''
            }`}
          >
            <CardHeader className={`bg-gradient-to-r ${plan.color} text-white`}>
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                <span>{plan.price}</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full bg-gradient-to-r ${plan.color} text-white hover:opacity-90`}
                disabled={isLoading}
              >
                Select {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedPlan && (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-lg font-medium mb-2">
                  Selected Plan: {SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS].name}
                </p>
                <p className="text-gray-600">
                  Price: {SUBSCRIPTION_PLANS[selectedPlan as keyof typeof SUBSCRIPTION_PLANS].price}
                </p>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    This page is deprecated. Please use the new payment system.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/app/payment'}
                    className="bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    Go to New Payment Page
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="mt-16 space-y-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have access to premium features
              until the end of your billing period.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards, debit cards, and PayPal. All payments are processed securely.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">When will I be charged?</h3>
            <p className="text-gray-600">
              Your subscription will begin immediately after payment is processed. You'll be charged the subscription 
              amount monthly until you cancel.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
