'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Heart, MessageCircle, Star, Zap } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PayPalButton } from '@/components/paypal-button'
import { PayPalSetupNotice } from '@/components/paypal-setup-notice'

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Basic features to get started',
    features: [
      'Browse profiles',
      'Limited likes per day (5)',
      'Basic filters',
      'View who liked you (blurred)',
      'No messaging'
    ],
    limitations: [
      'Cannot send messages',
      'Limited daily likes',
      'No super likes',
      'No read receipts'
    ],
    color: 'gray',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    period: 'month',
    description: 'Unlock messaging and premium features',
    features: [
      'Unlimited messaging',
      'Unlimited likes',
      '5 Super Likes per day',
      'See who liked you',
      'Advanced filters',
      'Read receipts',
      'Priority support'
    ],
    color: 'blue',
    popular: true
  },
  {
    id: 'premium_plus',
    name: 'Premium Plus',
    price: 19.99,
    period: 'month',
    description: 'All premium features plus exclusive perks',
    features: [
      'Everything in Premium',
      'Unlimited Super Likes',
      'Boost your profile',
      'See who viewed your profile',
      'Incognito mode',
      'Priority matching',
      'VIP customer support'
    ],
    color: 'purple',
    popular: false
  }
]

export default function PaymentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Check if PayPal is configured
  const isPayPalConfigured = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !== 'your_paypal_client_id_here'

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe')
      router.push('/login')
      return
    }

    if (planId === 'free') {
      toast.info('You are already on the free plan')
      return
    }

    setLoading(planId)
    setSelectedPlan(planId)

    try {
      // Create PayPal payment
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id
        })
      })

      const data = await response.json()

      if (data.success && data.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl
      } else {
        throw new Error(data.error || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment. Please try again.')
    } finally {
      setLoading(null)
      setSelectedPlan(null)
    }
  }

  const currentPlan = user?.subscriptionType || 'free'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 mb-2">
          Unlock premium features and start meaningful conversations
        </p>
        <div className="text-sm text-gray-500">
          Current plan: <Badge variant="outline">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</Badge>
        </div>
        {currentPlan === 'free' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <p className="text-sm text-pink-700">
              🚀 <strong>Limited Time:</strong> Get 50% more matches with Premium! Join thousands of successful couples.
            </p>
          </div>
        )}
      </div>

      {/* PayPal Setup Notice */}
      {!isPayPalConfigured && (
        <div className="mb-8">
          <PayPalSetupNotice />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${
              currentPlan === plan.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            
            {currentPlan === plan.id && (
              <Badge className="absolute -top-3 right-4 bg-green-500">
                Current Plan
              </Badge>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {plan.id === 'free' && <Heart className="h-8 w-8 text-gray-500" />}
                {plan.id === 'premium' && <Crown className="h-8 w-8 text-blue-500" />}
                {plan.id === 'premium_plus' && <Star className="h-8 w-8 text-purple-500" />}
              </div>
              
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500">/{plan.period}</span>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.limitations && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Limitations:</p>
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-500">
                        <span className="w-2 h-2 bg-gray-300 rounded-full mr-2 flex-shrink-0"></span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.price === 0 ? (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Free Forever
                </Button>
              ) : currentPlan === plan.id ? (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <div className="space-y-3">
                  {/* PayPal Payment Option */}
                  <div className="space-y-2">
                    <PayPalButton
                      planId={plan.id}
                      amount={plan.price.toString()}
                      onSuccess={() => {
                        toast.success('Payment successful!')
                        window.location.reload()
                      }}
                      onError={(error) => {
                        console.error('Payment error:', error)
                        toast.error('Payment failed. Please try again.')
                      }}
                    />
                    <p className="text-xs text-gray-500 text-center">
                      International payments via PayPal
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-3 text-xs text-gray-500 bg-white">OR</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  {/* Pesapal Payment Option */}
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                      onClick={() => toast.info('Pesapal integration coming soon!')}
                    >
                      Pay with Pesapal (Coming Soon)
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      Local payments via Mobile Money & Cards
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-2xl font-semibold mb-4">Why Upgrade?</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-2">Unlimited Messaging</h4>
            <p className="text-sm text-gray-600">
              Connect with your matches and start meaningful conversations
            </p>
          </div>
          <div className="text-center">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-2">Super Likes</h4>
            <p className="text-sm text-gray-600">
              Stand out from the crowd and get noticed by your ideal matches
            </p>
          </div>
          <div className="text-center">
            <Crown className="h-12 w-12 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold mb-2">Premium Features</h4>
            <p className="text-sm text-gray-600">
              Advanced filters, read receipts, and priority support
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>All subscriptions auto-renew. Cancel anytime in your account settings.</p>
        <p>Secure payments powered by PayPal & Pesapal. Your data is protected.</p>
        <p className="mt-2">
          <span className="font-medium">PayPal:</span> International cards & PayPal balance •
          <span className="font-medium"> Pesapal:</span> M-Pesa, Airtel Money, Bank transfers & Local cards
        </p>
      </div>
    </div>
  )
}
