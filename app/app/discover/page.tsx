"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, X, MessageCircle, Crown, Star, Shield } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { calculateAge } from "@/lib/utils"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Profile {
  id: string
  firstName: string
  lastName: string
  photos: string[]
  bio: string
  birthDate: string
  occupation: string
  location: string
  interests: string[]
  subscriptionType?: string
  isVerified?: boolean
  profileBoosts?: number
  rankingScore?: number
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null)
  const [showMatchDialog, setShowMatchDialog] = useState(false)
  const [matchId, setMatchId] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/discover")
      if (!response.ok) throw new Error("Failed to fetch profiles")
      const data = await response.json()
      setProfiles(data.profiles)
    } catch (error) {
      console.error("Error fetching profiles:", error)
      toast.error("Failed to load profiles")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = async (liked: boolean) => {
    if (currentIndex >= profiles.length) return

    const profile = profiles[currentIndex]
    setSwipeDirection(liked ? "right" : "left")

    try {
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swipedUserId: profile.id,
          isLike: liked,
        }),
      })

      if (!response.ok) throw new Error("Failed to record swipe")

      const data = await response.json()
      if (data.isMatch) {
        // Show match dialog instead of just toast
        setMatchedProfile(profile)
        setMatchId(data.matchId || `match_${Date.now()}`) // Use returned matchId or generate one
        setShowMatchDialog(true)
        toast.success("It's a match! 🎉")
      }
    } catch (error) {
      console.error("Swipe error:", error)
      toast.error("Failed to process swipe")
    }

    // Wait for animation to complete
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1)
      setSwipeDirection(null)
      
      // Fetch more profiles when running low
      if (currentIndex + 1 >= profiles.length - 3) {
        fetchProfiles()
      }
    }, 300)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-semibold mb-4">No more profiles to show</h2>
        <p className="text-gray-600 mb-6">Check back later for new matches!</p>
        <Button onClick={fetchProfiles}>Refresh</Button>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {/* Header with stats */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Discover</h1>
        <p className="text-gray-600 text-sm">
          {profiles.length > 0 && `${currentIndex + 1} of ${profiles.length} profiles`}
        </p>
      </div>

      <div className="relative h-[600px]">
        <AnimatePresence>
          <motion.div
            key={currentProfile.id}
            initial={{ scale: 1 }}
            animate={{
              x: swipeDirection === "left" ? -200 : swipeDirection === "right" ? 200 : 0,
              opacity: swipeDirection ? 0 : 1,
              scale: swipeDirection ? 0.8 : 1,
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Card className="h-full overflow-hidden">
              <div className="relative h-4/5">
                <Image
                  src={currentProfile.photos[0]}
                  alt={`${currentProfile.firstName}'s photo`}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Premium Indicators */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {currentProfile.subscriptionType === 'premium_plus' && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Premium+
                    </Badge>
                  )}
                  {currentProfile.subscriptionType === 'premium' && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {currentProfile.isVerified && (
                    <Badge className="bg-blue-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                {/* Boost Indicator */}
                {currentProfile.profileBoosts && currentProfile.profileBoosts > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                      🚀 Boosted
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-2xl font-semibold">
                  {currentProfile.firstName}, {calculateAge(currentProfile.birthDate)}
                </h3>
                <p className="text-gray-600">{currentProfile.occupation}</p>
                <p className="text-gray-600 text-sm">{currentProfile.location}</p>
                <p className="mt-2 text-sm line-clamp-2">{currentProfile.bio}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentProfile.interests.slice(0, 3).map(interest => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                  {currentProfile.interests.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      +{currentProfile.interests.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-6 mt-6">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full h-16 w-16 border-red-200 hover:border-red-300 hover:bg-red-50"
          onClick={() => handleSwipe(false)}
          title="Pass"
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>

        {/* Super Like Button (Premium Feature) */}
        <Button
          size="lg"
          variant="outline"
          className="rounded-full h-14 w-14 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
          onClick={() => {
            toast.info("Super Like feature coming soon! ⭐")
          }}
          title="Super Like (Premium)"
        >
          <Star className="h-6 w-6 text-blue-500" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="rounded-full h-16 w-16 border-green-200 hover:border-green-300 hover:bg-green-50"
          onClick={() => handleSwipe(true)}
          title="Like"
        >
          <Heart className="h-8 w-8 text-green-500" />
        </Button>
      </div>

      {/* Action Labels */}
      <div className="flex justify-center gap-6 mt-2">
        <span className="text-xs text-gray-500 w-16 text-center">Pass</span>
        <span className="text-xs text-blue-600 w-14 text-center">Super</span>
        <span className="text-xs text-gray-500 w-16 text-center">Like</span>
      </div>

      {/* Match Dialog */}
      <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">It's a Match! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              You and {matchedProfile?.firstName} liked each other!
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            {matchedProfile && (
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  <Image
                    src={matchedProfile.photos[0]}
                    alt={`${matchedProfile.firstName}'s photo`}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div className="text-4xl">💕</div>
                <div className="relative w-20 h-20">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Your photo"
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowMatchDialog(false)}
              >
                Keep Swiping
              </Button>
              <Button
                className="flex-1"
                asChild
              >
                <Link href={`/app/messages/${matchId}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}