"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, X, Star, MapPin, Briefcase, GraduationCap } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  age: number
  bio: string
  photos: string[]
  location: string
  distance?: number
  occupation?: string
  education?: string
  interests: string[]
}

export default function DiscoverPage() {
  const [users, setUsers] = useState<User[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSwipeLoading, setIsSwipeLoading] = useState(false)
  const [showMatch, setShowMatch] = useState(false)
  const [swipeError, setSwipeError] = useState("")
  const [activeButton, setActiveButton] = useState<"like" | "dislike" | "superlike" | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/discover")
      if (response.ok) {
        const data = await response.json()
        // Transform API data to match frontend expectations
        const transformedUsers = (data.profiles || []).map((profile: any) => ({
          id: profile.id,
          name: `${profile.firstName} ${profile.lastName}`,
          age: new Date().getFullYear() - new Date(profile.birthDate).getFullYear(),
          bio: profile.bio,
          photos: profile.photos || [],
          location: profile.location,
          occupation: profile.occupation,
          interests: profile.interests || []
        }))
        setUsers(transformedUsers)
      } else {
        throw new Error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = async (isLike: boolean, isSuperLike = false) => {
    if (currentIndex >= users.length || isSwipeLoading) return

    setIsSwipeLoading(true)
    setSwipeError("")
    setActiveButton(isSuperLike ? "superlike" : isLike ? "like" : "dislike")
    const currentUser = users[currentIndex]

    try {
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swipedUserId: currentUser.id,
          isLike,
          isSuperLike,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process swipe")
      }

      if (data.isMatch) {
        setShowMatch(true)
        setTimeout(() => setShowMatch(false), 3000)
      }

      // Animate the card away
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setActiveButton(null)
      }, 300)

      // Fetch more users if running low
      if (currentIndex >= users.length - 2) {
        fetchUsers()
      }
    } catch (error) {
      setSwipeError(error instanceof Error ? error.message : "Failed to process swipe")
      console.error("Swipe failed:", error)
    } finally {
      setIsSwipeLoading(false)
      setTimeout(() => setActiveButton(null), 300)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const currentUser = users[currentIndex]

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-md mx-auto">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No more profiles</h2>
          <p className="text-gray-600 mb-6">
            You've seen all available profiles in your area. Check back later for new matches!
          </p>
          <Button onClick={fetchUsers}>Refresh</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      {/* Match Celebration */}
      {showMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 match-animation">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">It's a Match!</h2>
            <p className="text-gray-600 mb-4">You and {currentUser.name} liked each other</p>
            <Button className="w-full">Send Message</Button>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <Card className="relative overflow-hidden swipe-card">
        <div className="relative">
          <img
            src={currentUser.photos?.[0] || "/placeholder.svg?height=600&width=400"}
            alt={currentUser.name}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* User Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <span className="text-xl">{currentUser.age}</span>
            </div>

            {currentUser.location && (
              <div className="flex items-center space-x-1 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {currentUser.location}
                  {currentUser.distance && ` • ${Math.round(currentUser.distance)} km away`}
                </span>
              </div>
            )}

            {currentUser.occupation && (
              <div className="flex items-center space-x-1 mb-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">{currentUser.occupation}</span>
              </div>
            )}

            {currentUser.education && (
              <div className="flex items-center space-x-1 mb-2">
                <GraduationCap className="h-4 w-4" />
                <span className="text-sm">{currentUser.education}</span>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          {currentUser.bio && <p className="text-gray-700 mb-4">{currentUser.bio}</p>}

          {currentUser.interests && Array.isArray(currentUser.interests) && currentUser.interests.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "rounded-full w-16 h-16 border-red-200 hover:bg-red-50 transition-all duration-200",
            {
              "scale-95 bg-red-50": activeButton === "dislike",
              "opacity-50": isSwipeLoading && activeButton !== "dislike"
            }
          )}
          onClick={() => handleSwipe(false)}
          disabled={isSwipeLoading}
        >
          <X className={cn(
            "h-6 w-6 text-red-500 transition-transform duration-200",
            activeButton === "dislike" && "scale-110"
          )} />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className={cn(
            "rounded-full w-16 h-16 border-blue-200 hover:bg-blue-50 transition-all duration-200",
            {
              "scale-95 bg-blue-50": activeButton === "superlike",
              "opacity-50": isSwipeLoading && activeButton !== "superlike"
            }
          )}
          onClick={() => handleSwipe(true, true)}
          disabled={isSwipeLoading}
        >
          <Star className={cn(
            "h-6 w-6 text-blue-500 transition-transform duration-200",
            activeButton === "superlike" && "scale-110"
          )} />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className={cn(
            "rounded-full w-16 h-16 border-green-200 hover:bg-green-50 transition-all duration-200",
            {
              "scale-95 bg-green-50": activeButton === "like",
              "opacity-50": isSwipeLoading && activeButton !== "like"
            }
          )}
          onClick={() => handleSwipe(true)}
          disabled={isSwipeLoading}
        >
          <Heart className={cn(
            "h-6 w-6 text-green-500 transition-transform duration-200",
            activeButton === "like" && "scale-110"
          )} />
        </Button>
      </div>

      {/* Action Labels */}
      <div className="flex items-center justify-center space-x-4 mt-2">
        <span className="text-xs text-gray-500 w-16 text-center">Pass</span>
        <span className="text-xs text-gray-500 w-16 text-center">Super Like</span>
        <span className="text-xs text-gray-500 w-16 text-center">Like</span>
      </div>

      {/* Error Message */}
      {swipeError && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md inline-block">
            {swipeError}
          </p>
        </div>
      )}

      {/* Premium Upgrade Prompt */}
      {user?.subscription_type === "free" && (
        <Card className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">Upgrade to Premium</h3>
            <p className="text-sm text-gray-600 mb-3">Get unlimited likes, super likes, and see who liked you!</p>
            <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
