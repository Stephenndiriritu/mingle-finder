"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Heart } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { formatDistanceToNow } from "date-fns"

interface Match {
  match_id: number
  user: {
    id: number
    name: string
    photos: string[]
    last_active: string
    is_online: boolean
  }
  last_message: {
    id: number
    content: string
    sent_at: string
    is_read: boolean
  } | null
  matched_at: string
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/matches")
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h2>
          <p className="text-gray-600 mb-6">
            Start swiping to find your perfect match! When you and someone else like each other, you'll see them here.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Start Swiping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
        <p className="text-gray-600">
          You have {matches.length} match{matches.length !== 1 ? "es" : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <Link key={match.match_id} href={`/app/messages/${match.match_id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <img
                  src={match.user.photos[0] || "/placeholder.svg?height=300&width=300"}
                  alt={match.user.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {match.last_message && !match.last_message.is_read && (
                  <Badge className="absolute top-2 right-2 bg-red-500">New</Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{match.user.name}</h3>
                  <span className={`text-sm ${match.user.is_online ? 'text-green-500' : 'text-gray-500'}`}>
                    {match.user.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>

                {match.last_message ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700 line-clamp-2">{match.last_message.content}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(match.last_message.sent_at), { addSuffix: true })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 italic">Say hello to your new match!</p>
                    <p className="text-xs text-gray-500">
                      Matched {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-1 text-pink-500">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">Match</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-500">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">Chat</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
