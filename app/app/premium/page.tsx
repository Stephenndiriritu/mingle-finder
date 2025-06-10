"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Heart, Star, Zap, Eye, Check } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

const plans = [
  {
    id: "free_premium",
    name: "Free Premium",
    price: "$0",
    period: "forever",
    color: "from-gray-400 to-gray-600",
    features: [
      "50 likes per day",
      "3 super likes per day",
      "2 rewinds per day",
      "See who liked you",
      "Advanced filters",
      "No messaging capability",
      "Basic customer support",
    ],
    popular: false,
  },
  {
    id: "gold",
    name: "Gold",
    price: "$9.99",
    period: "month",
    color: "from-yellow-400 to-yellow-600",
    features: [
      "100 likes per day",
      "5 super likes per day",
      "5 rewinds per day",
      "1 boost per month",
      "See who liked you",
      "Read receipts",
      "Unlimited messaging",
      "No ads",
      "Priority customer support",
    ],
    popular: false,
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "$19.99",
    period: "month",
    color: "from-purple-400 to-purple-600",
    features: [
      "Unlimited likes",
      "10 super likes per day",
      "Unlimited rewinds",
      "5 boosts per month",
      "See who liked you",
      "Read receipts",
      "No ads",
      "Priority customer support",
      "Message before matching",
      "Priority profile visibility",
      "Advanced filters",
      "Incognito mode",
    ],
    popular: true,
  },
]

const freeFeatures = ["10 likes per day", "1 super like per day", "Basic matching", "Standard messaging"]

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
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
        throw new Error("Failed to subscribe")
      }

      const data = await response.json()
      toast.success("Successfully subscribed!")
      router.push("/app/settings")
    } catch (error) {
      console.error("Failed to subscribe:", error)
      toast.error("Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900">Upgrade to Premium</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Unlock unlimited features and find your perfect match faster with our premium plans
        </p>
      </div>

      {/* Current Plan Status */}
      {user?.subscription_type !== "free" && (
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're on {user.subscription_type} Plan</h2>
            <p className="text-gray-600">Enjoying premium features? Thank you for being a valued member!</p>
          </CardContent>
        </Card>
      )}

      {/* Features Comparison */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Compare Plans</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Free</CardTitle>
              <div className="text-3xl font-bold text-gray-900">$0</div>
              <CardDescription>Basic features to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              <div className="pt-4">
                <Button variant="outline" className="w-full" disabled={user?.subscription_type === "free"}>
                  {user?.subscription_type === "free" ? "Current Plan" : "Downgrade"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plans */}
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-purple-300 shadow-lg" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  {plan.price}
                  <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
                </div>
                <CardDescription>
                  {plan.id === "gold" ? "Enhanced dating experience" : "Ultimate dating experience"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}

                <div className="pt-4">
                  <Button
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading || user?.subscription_type === plan.id}
                  >
                    {isLoading && selectedPlan === plan.id
                      ? "Processing..."
                      : user?.subscription_type === plan.id
                        ? "Current Plan"
                        : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Unlimited Likes</h3>
            <p className="text-sm text-gray-600">Like as many profiles as you want without daily limits</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Star className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Super Likes</h3>
            <p className="text-sm text-gray-600">Stand out with super likes to get noticed first</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Profile Boosts</h3>
            <p className="text-sm text-gray-600">Get 10x more profile views with monthly boosts</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Eye className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">See Who Likes You</h3>
            <p className="text-sm text-gray-600">Skip the guessing and see who's interested in you</p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>

        <div className="space-y-6">
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
                We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through
                Stripe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                We offer a 7-day free trial for new premium subscribers. You can cancel anytime during the trial period
                without being charged.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">What happens to my matches if I downgrade?</h3>
              <p className="text-gray-600">
                Your existing matches and conversations will remain intact. You'll just have limited access to premium
                features like unlimited likes and super likes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="p-8">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Find Your Perfect Match?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of premium members who have found meaningful relationships. Upgrade today and start your
              journey to love.
            </p>
            <div className="space-x-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                onClick={() => handleSubscribe("platinum")}
              >
                Start Premium Trial
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
