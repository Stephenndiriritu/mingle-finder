"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Crown, Zap, Heart, Star, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { PayPalButtons } from "@paypal/react-paypal-js"

export default function PremiumPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderId, setOrderId] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ planId })
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const data = await response.json()
      setOrderId(data.orderId)
    } catch (error) {
      console.error("Failed to create order:", error)
      toast.error("Failed to start subscription process. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentCapture = async () => {
    if (!orderId) return

    try {
      const response = await fetch("/api/subscription", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "capture",
          orderId
        })
      })

      if (!response.ok) {
        throw new Error("Failed to complete subscription")
      }

      toast.success("Successfully subscribed!")
      router.push("/app/settings")
    } catch (error) {
      console.error("Failed to complete subscription:", error)
      toast.error("Failed to complete subscription. Please try again.")
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "10 likes per day",
        "Basic matching",
        "Standard messaging",
        "Profile creation",
        "Basic search filters"
      ],
      popular: false,
      planId: "free",
      cta: "Current Plan",
      disabled: true
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "month",
      features: [
        "Unlimited likes",
        "See who liked you",
        "Priority matching",
        "Advanced filters",
        "Read receipts",
      ],
      popular: true,
      planId: "premium",
      cta: "Go Premium",
      disabled: false
    },
    {
      name: "Platinum",
      price: "$19.99",
      period: "month",
      features: [
        "All Premium features",
        "Boost your profile",
        "Super likes",
        "Passport (swipe anywhere)",
        "Background check verified",
      ],
      popular: false,
      planId: "platinum",
      cta: "Go Platinum",
      disabled: false
    }
  ]

  const benefits = [
    {
      icon: Crown,
      title: "Premium Features",
      description: "Access exclusive features like seeing who liked you, advanced filters, and read receipts.",
      color: "text-yellow-500"
    },
    {
      icon: Zap,
      title: "Boost Your Profile",
      description: "Get up to 10x more profile views with regular profile boosts in your area.",
      color: "text-purple-500"
    },
    {
      icon: Heart,
      title: "More Matches",
      description: "Increase your chances of finding the perfect match with unlimited likes and super likes.",
      color: "text-red-500"
    },
    {
      icon: Star,
      title: "Priority Matching",
      description: "Your profile gets shown to more users and appears at the top of search results.",
      color: "text-orange-500"
    },
    {
      icon: Shield,
      title: "Premium Support",
      description: "Get priority support from our dedicated customer service team.",
      color: "text-green-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Premium Plans</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Upgrade Your Dating
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 block">
              Experience
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get access to premium features and increase your chances of finding the perfect match.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-5 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <benefit.icon className={`h-12 w-12 ${benefit.color} mx-auto mb-4`} />
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular 
                  ? "border-2 border-purple-500 shadow-2xl md:scale-105 transform transition-transform duration-200" 
                  : "border-0 shadow-lg"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl md:text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {plan.price}
                  <span className="text-base md:text-lg font-normal text-gray-500">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2 text-sm md:text-base">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                {!orderId ? (
                  <Button
                    className={`w-full mt-6 ${
                      plan.popular 
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90" 
                        : ""
                    }`}
                    size="lg"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={plan.disabled || isLoading}
                    onClick={() => handleSubscribe(plan.planId)}
                  >
                    {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                    {plan.cta}
                  </Button>
                ) : (
                  <PayPalButtons
                    createOrder={() => Promise.resolve(orderId)}
                    onApprove={handlePaymentCapture}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <div className="mt-4 text-center text-red-600 bg-red-50 p-4 rounded-md max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: "How do I upgrade to premium?",
                a: "Simply select your preferred plan and follow the payment process. You can pay using credit card, PayPal, or other available payment methods."
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes, you can cancel your premium subscription at any time. Your premium features will remain active until the end of your billing period."
              },
              {
                q: "What happens after I upgrade?",
                a: "Your account will be immediately upgraded with premium features. You'll get access to all the features included in your chosen plan."
              },
              {
                q: "Is my payment information secure?",
                a: "Yes, we use industry-standard encryption to protect your payment information. We never store your complete credit card details."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 