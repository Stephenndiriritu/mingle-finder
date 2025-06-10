import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1'

    // Mock ranking insights based on user subscription
    const userSubscription = getUserSubscription(userId)
    
    const insights = {
      yourRanking: {
        position: userSubscription === 'premium_plus' ? 'Top 5%' : 
                 userSubscription === 'premium' ? 'Top 20%' : 'Bottom 50%',
        score: userSubscription === 'premium_plus' ? 95 : 
               userSubscription === 'premium' ? 75 : 35,
        factors: [
          {
            name: 'Subscription Tier',
            impact: userSubscription === 'premium_plus' ? 'Very High' : 
                   userSubscription === 'premium' ? 'High' : 'Low',
            score: userSubscription === 'premium_plus' ? 50 : 
                   userSubscription === 'premium' ? 30 : 0,
            description: userSubscription === 'free' ? 
              'Upgrade to Premium to rank higher' : 
              'Premium subscription boosts your visibility'
          },
          {
            name: 'Profile Completeness',
            impact: 'Medium',
            score: 15,
            description: 'Complete profile with photos and bio'
          },
          {
            name: 'Activity Level',
            impact: 'Medium',
            score: userSubscription === 'free' ? 5 : 15,
            description: userSubscription === 'free' ? 
              'Limited activity due to messaging restrictions' :
              'Active messaging and engagement'
          },
          {
            name: 'Response Rate',
            impact: 'Medium',
            score: userSubscription === 'free' ? 0 : 10,
            description: userSubscription === 'free' ? 
              'Cannot respond to messages on free plan' :
              'Good response rate to messages'
          }
        ]
      },
      whoYouSee: {
        algorithm: 'Premium Priority Matching',
        description: 'Profiles are ranked to show you the most relevant and active users first',
        factors: [
          {
            name: 'Premium Users First',
            weight: 40,
            description: 'Premium and Premium+ users are prioritized in your feed'
          },
          {
            name: 'Recent Activity',
            weight: 25,
            description: 'Users who were active recently appear higher'
          },
          {
            name: 'Profile Engagement',
            weight: 20,
            description: 'Users with high response rates and engagement'
          },
          {
            name: 'Profile Boosts',
            weight: 15,
            description: 'Boosted profiles get temporary priority placement'
          }
        ]
      },
      recommendations: userSubscription === 'free' ? [
        {
          title: 'Upgrade to Premium',
          description: 'Get 3x more profile views and rank in top 20%',
          action: 'Upgrade Now',
          priority: 'high'
        },
        {
          title: 'Complete Your Profile',
          description: 'Add more photos and interests to improve ranking',
          action: 'Edit Profile',
          priority: 'medium'
        }
      ] : userSubscription === 'premium' ? [
        {
          title: 'Upgrade to Premium+',
          description: 'Get 5x more views and unlimited boosts',
          action: 'Upgrade',
          priority: 'medium'
        },
        {
          title: 'Use Profile Boosts',
          description: 'Boost your profile for 30 minutes of extra visibility',
          action: 'Boost Profile',
          priority: 'medium'
        }
      ] : [
        {
          title: 'You\'re in the Top 5%!',
          description: 'Your premium+ subscription gives you maximum visibility',
          action: 'Keep Active',
          priority: 'low'
        }
      ],
      stats: {
        profileViews: userSubscription === 'premium_plus' ? 245 : 
                    userSubscription === 'premium' ? 134 : 67,
        likesReceived: userSubscription === 'premium_plus' ? 89 : 
                      userSubscription === 'premium' ? 45 : 23,
        matchRate: userSubscription === 'premium_plus' ? '36%' : 
                  userSubscription === 'premium' ? '28%' : '15%',
        responseRate: userSubscription === 'premium_plus' ? '85%' : 
                     userSubscription === 'premium' ? '78%' : '0%'
      }
    }

    return NextResponse.json({
      insights,
      userSubscription,
      success: true
    })

  } catch (error) {
    console.error('Ranking insights error:', error)
    return NextResponse.json(
      { error: 'Failed to get ranking insights' },
      { status: 500 }
    )
  }
}

// Mock function to get user subscription
function getUserSubscription(userId: string): string {
  const mockSubscriptions = {
    '1': 'free',
    '2': 'premium',
    '3': 'premium_plus'
  }
  
  return mockSubscriptions[userId as keyof typeof mockSubscriptions] || 'free'
}
