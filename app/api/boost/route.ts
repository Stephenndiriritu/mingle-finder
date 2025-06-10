import { NextRequest, NextResponse } from 'next/server'

// Mock user boosts storage
const userBoosts = new Map()

// Boost pricing
const BOOST_PRICES = {
  single: 4.99,
  pack_5: 19.99,
  pack_10: 34.99
}

export async function POST(request: NextRequest) {
  try {
    const { userId, boostType = 'single' } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check user subscription (premium users get discounts)
    const userSubscription = getUserSubscription(userId)
    
    if (userSubscription === 'free') {
      return NextResponse.json({
        error: 'Profile boost requires a premium subscription',
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Upgrade to Premium to boost your profile and get more visibility!'
      }, { status: 403 })
    }

    // Apply boost
    const currentBoosts = userBoosts.get(userId) || 0
    const newBoostCount = currentBoosts + (boostType === 'pack_10' ? 10 : boostType === 'pack_5' ? 5 : 1)
    
    userBoosts.set(userId, newBoostCount)

    // Calculate boost duration (premium users get longer boosts)
    const boostDuration = userSubscription === 'premium_plus' ? 60 : 30 // minutes
    const boostExpiry = new Date(Date.now() + boostDuration * 60 * 1000)

    console.log(`Profile boost applied for user ${userId}: ${newBoostCount} boosts, expires at ${boostExpiry}`)

    return NextResponse.json({
      success: true,
      boostCount: newBoostCount,
      boostExpiry: boostExpiry.toISOString(),
      boostDuration,
      message: `Profile boosted! You'll be shown to more people for the next ${boostDuration} minutes.`
    })

  } catch (error) {
    console.error('Boost error:', error)
    return NextResponse.json(
      { error: 'Failed to apply boost' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const boostCount = userBoosts.get(userId) || 0
    const userSubscription = getUserSubscription(userId)

    return NextResponse.json({
      boostCount,
      userSubscription,
      prices: BOOST_PRICES,
      canBoost: userSubscription !== 'free',
      benefits: {
        free: [],
        premium: [
          'Profile boost for 30 minutes',
          '3x more profile views',
          'Higher ranking in discover'
        ],
        premium_plus: [
          'Profile boost for 60 minutes',
          '5x more profile views',
          'Highest ranking in discover',
          'Unlimited boosts included'
        ]
      }
    })

  } catch (error) {
    console.error('Boost status error:', error)
    return NextResponse.json(
      { error: 'Failed to get boost status' },
      { status: 500 }
    )
  }
}

// Mock function to get user subscription
function getUserSubscription(userId: string): string {
  const mockSubscriptions = {
    '1': 'free',
    '2': 'premium',
    '3': 'premium',
    '4': 'free',
    '5': 'free'
  }
  
  return mockSubscriptions[userId as keyof typeof mockSubscriptions] || 'free'
}
