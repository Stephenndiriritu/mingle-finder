'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Crown, Star, TrendingUp, Users, Heart, MessageCircle, Eye, Zap } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'

interface RankingInsights {
  yourRanking: {
    position: string
    score: number
    factors: Array<{
      name: string
      impact: string
      score: number
      description: string
    }>
  }
  whoYouSee: {
    algorithm: string
    description: string
    factors: Array<{
      name: string
      weight: number
      description: string
    }>
  }
  recommendations: Array<{
    title: string
    description: string
    action: string
    priority: string
  }>
  stats: {
    profileViews: number
    likesReceived: number
    matchRate: string
    responseRate: string
  }
}

export default function InsightsPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<RankingInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [userSubscription, setUserSubscription] = useState('free')

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch(`/api/ranking-insights?userId=${user?.id || 1}`)
      const data = await response.json()
      setInsights(data.insights)
      setUserSubscription(data.userSubscription)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unable to load insights</h1>
          <Button onClick={fetchInsights}>Try Again</Button>
        </div>
      </div>
    )
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'very high': return 'text-green-600'
      case 'high': return 'text-blue-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Insights</h1>
        <p className="text-gray-600">
          Understand how our algorithm works and how to improve your visibility
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>Pro Tip:</strong> Premium users get 4-6x higher ranking scores and more visibility!
          </p>
        </div>
      </div>

      {/* Your Ranking */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Your Profile Ranking
          </CardTitle>
          <CardDescription>
            Your current position: <Badge variant="outline">{insights.yourRanking.position}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-sm font-medium">{insights.yourRanking.score}/100</span>
            </div>
            <Progress value={insights.yourRanking.score} className="h-2" />
          </div>

          <div className="space-y-4">
            {insights.yourRanking.factors.map((factor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{factor.name}</h4>
                  <div className="text-right">
                    <Badge className={getImpactColor(factor.impact)}>
                      {factor.impact} Impact
                    </Badge>
                    <div className="text-sm text-gray-600 mt-1">
                      +{factor.score} points
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{factor.description}</p>
                <Progress value={(factor.score / 50) * 100} className="h-1 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Explanation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            How You See Others
          </CardTitle>
          <CardDescription>{insights.whoYouSee.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.whoYouSee.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{factor.name}</h4>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-semibold">{factor.weight}%</div>
                  <div className="text-xs text-gray-500">weight</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Your Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{insights.stats.profileViews}</div>
              <div className="text-sm text-gray-600">Profile Views</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{insights.stats.likesReceived}</div>
              <div className="text-sm text-gray-600">Likes Received</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{insights.stats.matchRate}</div>
              <div className="text-sm text-gray-600">Match Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{insights.stats.responseRate}</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Recommendations
          </CardTitle>
          <CardDescription>Ways to improve your profile visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="font-medium mr-2">{rec.title}</h4>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
                <Button 
                  asChild 
                  variant={rec.priority === 'high' ? 'default' : 'outline'}
                  className="ml-4"
                >
                  <Link href={rec.action === 'Upgrade Now' || rec.action === 'Upgrade' ? '/app/payment' : '/app/profile'}>
                    {rec.action}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
