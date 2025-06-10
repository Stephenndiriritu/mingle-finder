'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Crown, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const planDetails = {
  premium: {
    name: 'Premium',
    icon: Crown,
    color: 'text-blue-500',
    features: [
      'Unlimited messaging',
      'Unlimited likes',
      '5 Super Likes per day',
      'See who liked you',
      'Advanced filters',
      'Read receipts'
    ]
  },
  premium_plus: {
    name: 'Premium Plus',
    icon: Star,
    color: 'text-purple-500',
    features: [
      'Everything in Premium',
      'Unlimited Super Likes',
      'Boost your profile',
      'See who viewed your profile',
      'Incognito mode',
      'Priority matching'
    ]
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const plan = searchParams.get('plan') as keyof typeof planDetails
  const amount = searchParams.get('amount')

  useEffect(() => {
    // Simulate processing delay
    const timer = setTimeout(() => {
      setLoading(false)
      toast.success('🎉 Payment successful! Welcome to premium!')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold mb-2">Processing your payment...</h1>
          <p className="text-gray-600">Please wait while we confirm your subscription.</p>
        </div>
      </div>
    )
  }

  if (!plan || !planDetails[plan]) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Payment Error</h1>
          <p className="text-gray-600 mb-6">There was an issue processing your payment.</p>
          <Button asChild>
            <Link href="/app/payment">Return to Payment Page</Link>
          </Button>
        </div>
      </div>
    )
  }

  const planInfo = planDetails[plan]
  const IconComponent = planInfo.icon

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">
            Welcome to {planInfo.name}! Your subscription is now active.
          </p>
        </div>

        {/* Payment Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconComponent className={`h-6 w-6 ${planInfo.color} mr-2`} />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Plan:</span>
                <Badge variant="secondary">{planInfo.name}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span className="font-semibold">${amount} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Billing Cycle:</span>
                <span>Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Next Billing Date:</span>
                <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Unlocked */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎉 Features Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {planInfo.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <MessageCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Start Messaging</h4>
                  <p className="text-sm text-gray-600">
                    You can now send unlimited messages to your matches!
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Star className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Use Super Likes</h4>
                  <p className="text-sm text-gray-600">
                    Stand out with Super Likes to get noticed by your ideal matches.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Crown className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Explore Premium Features</h4>
                  <p className="text-sm text-gray-600">
                    Check out advanced filters, read receipts, and more in your settings.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/app/matches">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Messaging
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/app/discover">
              <Star className="h-4 w-4 mr-2" />
              Discover Matches
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Need help? Contact our support team at{' '}
            <a href="mailto:support@minglefinder.com" className="text-primary hover:underline">
              support@minglefinder.com
            </a>
          </p>
          <p className="mt-2">
            You can manage your subscription anytime in your{' '}
            <Link href="/app/profile" className="text-primary hover:underline">
              account settings
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
