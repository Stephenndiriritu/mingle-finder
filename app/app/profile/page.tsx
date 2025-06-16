'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Crown, Star, Shield, TrendingUp, Settings } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
      return
    }

    if (user) {
      // For now, use mock profile data
      // TODO: Fetch real profile data from API
      const mockProfile = {
        id: user.id,
        userId: user.id,
        firstName: user.name?.split(' ')[0] || 'Test',
        lastName: user.name?.split(' ')[1] || 'User',
        bio: 'This is a sample bio. Update your profile to add your own!',
        birthDate: '1995-06-15',
        gender: 'male',
        interests: ['Technology', 'Travel', 'Music'],
        photos: [],
        height: 175,
        occupation: 'Software Engineer',
        education: 'University Graduate',
        location: 'New York, NY',
        lookingFor: 'serious_relationship',
        relationshipType: 'monogamous',
        maxDistance: 50,
        ageMin: 22,
        ageMax: 35,
        showMe: 'female',
        smoking: 'never',
        drinking: 'socially',
        children: 'want_someday',
        religion: 'not_specified',
        languages: ['English'],
        hobbies: ['Reading', 'Hiking', 'Cooking'],
        profileCompletionPercentage: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setProfile(mockProfile)
      setProfileLoading(false)
    }
  }, [user, isLoading, router])

  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Mock subscription data - in real app, get from user context
  const userSubscription = user?.subscriptionType || 'free'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {userSubscription === 'premium_plus' && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Premium+
            </Badge>
          )}
          {userSubscription === 'premium' && (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {userSubscription === 'free' && (
            <Button asChild size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600">
              <Link href="/app/payment">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Profile Insights</h3>
                <p className="text-sm text-gray-600">See how you rank</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full mt-3">
              <Link href="/app/insights">View Insights</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Verification</h3>
                <p className="text-sm text-gray-600">Verify your profile</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-gray-500" />
              <div>
                <h3 className="font-semibold">Privacy Settings</h3>
                <p className="text-sm text-gray-600">Control your privacy</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {profile && <ProfileForm initialData={profile} userId={user.id} />}
    </div>
  )
}
