"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MessageCircle, Lock, Crown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { calculateAge, getTimeAgo } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface Match {
  id: string
  userId: string
  firstName: string
  lastName: string
  photos: string[]
  birthDate: string
  occupation: string
  location: string
  lastActive: string
  unreadMessages: number
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Mock subscription check - in real app, get from user data
  const userSubscription = user?.subscriptionType || 'free'
  const canMessage = userSubscription !== 'free'

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matches")
      if (!response.ok) throw new Error("Failed to fetch matches")
      const data = await response.json()
      setMatches(data.matches)
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMessageClick = (matchId: string) => {
    if (!canMessage) {
      toast.error("Messaging requires a premium subscription!")
      setTimeout(() => {
        window.location.href = '/app/payment'
      }, 1500)
      return
    }
    // If user can message, navigate normally
    window.location.href = `/app/messages/${matchId}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">No matches yet</h1>
          <p className="text-gray-600 mb-6">
            Keep swiping to find your perfect match!
          </p>
          <Button asChild>
            <Link href="/app/discover">Discover People</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Your Matches</h1>
          <p className="text-gray-600 text-sm mt-1">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
          </p>
        </div>
        {canMessage && (
          <Badge className="bg-green-100 text-green-800">
            <MessageCircle className="h-3 w-3 mr-1" />
            Messaging Enabled
          </Badge>
        )}
      </div>

      {/* Subscription Notice for Free Users */}
      {!canMessage && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <Lock className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="font-semibold text-amber-800">Messaging Locked</h3>
            </div>
            <p className="text-amber-700 text-sm mb-3">
              Free users cannot send messages. Upgrade to Premium to start conversations with your matches!
            </p>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
              <Link href="/app/payment">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
          <p className="text-gray-600 mb-4">
            Start swiping to find your perfect match!
          </p>
          <div className="space-y-3">
            <Button asChild>
              <Link href="/app">
                <Heart className="h-4 w-4 mr-2" />
                Start Discovering
              </Link>
            </Button>
            {!canMessage && (
              <div className="text-sm text-gray-500">
                <p>💡 Tip: Upgrade to Premium to message your matches!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <Card key={match.id} className="flex overflow-hidden">
            <div className="relative w-24 h-24">
              <Image
                src={match.photos[0]}
                alt={`${match.firstName}'s photo`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">
                    {match.firstName}, {calculateAge(match.birthDate)}
                  </h3>
                  <p className="text-sm text-gray-600">{match.occupation}</p>
                  <p className="text-xs text-gray-500">
                    Last active {getTimeAgo(match.lastActive)}
                  </p>
                </div>
                {match.unreadMessages > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {match.unreadMessages}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <Button
                  variant={canMessage ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleMessageClick(match.id)}
                  disabled={!canMessage}
                  className={!canMessage ? "opacity-60" : ""}
                >
                  {canMessage ? (
                    <MessageCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  {canMessage ? "Message" : "Upgrade to Message"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}
    </div>
  )
}
