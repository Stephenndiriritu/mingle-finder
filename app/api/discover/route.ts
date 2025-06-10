import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Mock data for testing - formatted to match discover page expectations
const mockProfiles = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Johnson",
    birthDate: "1995-06-15", // Age 28
    bio: "Love hiking, coffee, and good conversations. Looking for someone genuine to explore life with.",
    photos: ["/placeholder.svg?height=600&width=400"],
    location: "New York, NY",
    occupation: "Software Engineer",
    interests: ["Hiking", "Coffee", "Photography", "Travel", "Books"],
    subscriptionType: "premium_plus",
    isVerified: true,
    profileBoosts: 3,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    profileViews: 245,
    likesReceived: 89,
    responseRate: 0.85,
    rankingScore: 95
  },
  {
    id: "2",
    firstName: "Emma",
    lastName: "Wilson",
    birthDate: "1998-03-22", // Age 25
    bio: "Artist and yoga instructor. Passionate about mindfulness and creativity.",
    photos: ["/placeholder.svg?height=600&width=400"],
    location: "Brooklyn, NY",
    occupation: "Yoga Instructor",
    interests: ["Yoga", "Art", "Meditation", "Nature", "Music"],
    subscriptionType: "premium",
    isVerified: true,
    profileBoosts: 1,
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    profileViews: 178,
    likesReceived: 67,
    responseRate: 0.92,
    rankingScore: 88
  },
  {
    id: "3",
    firstName: "Jessica",
    lastName: "Chen",
    birthDate: "1993-11-08", // Age 30
    bio: "Foodie and adventure seeker. Always up for trying new restaurants or planning the next trip.",
    photos: ["/placeholder.svg?height=600&width=400"],
    location: "Manhattan, NY",
    occupation: "Marketing Manager",
    interests: ["Food", "Travel", "Adventure", "Wine", "Cooking"],
    subscriptionType: "premium",
    isVerified: false,
    profileBoosts: 0,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    profileViews: 134,
    likesReceived: 45,
    responseRate: 0.78,
    rankingScore: 75
  },
  {
    id: "4",
    firstName: "Alex",
    lastName: "Rodriguez",
    birthDate: "1992-09-14", // Age 31
    bio: "Fitness enthusiast and entrepreneur. Love outdoor activities and building meaningful connections.",
    photos: ["/placeholder.svg?height=600&width=400"],
    location: "Queens, NY",
    occupation: "Business Owner",
    interests: ["Fitness", "Business", "Outdoor Sports", "Technology", "Networking"],
    subscriptionType: "free",
    isVerified: false,
    profileBoosts: 0,
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    profileViews: 67,
    likesReceived: 23,
    responseRate: 0.65,
    rankingScore: 45
  },
  {
    id: "5",
    firstName: "Maya",
    lastName: "Patel",
    birthDate: "1996-12-03", // Age 27
    bio: "Doctor and book lover. Passionate about helping others and continuous learning.",
    photos: ["/placeholder.svg?height=600&width=400"],
    location: "Manhattan, NY",
    occupation: "Doctor",
    interests: ["Medicine", "Reading", "Volunteering", "Classical Music", "Science"],
    subscriptionType: "free",
    isVerified: false,
    profileBoosts: 0,
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    profileViews: 89,
    likesReceived: 34,
    responseRate: 0.71,
    rankingScore: 52
  }
]

// Ranking algorithm that prioritizes premium users
function calculateProfileRanking(profile: any): number {
  let score = 0

  // Subscription tier bonus (highest priority)
  switch (profile.subscriptionType) {
    case 'premium_plus':
      score += 50 // Highest priority
      break
    case 'premium':
      score += 30 // High priority
      break
    case 'free':
      score += 0 // Base priority
      break
  }

  // Verification bonus
  if (profile.isVerified) {
    score += 15
  }

  // Profile boosts (premium feature)
  score += profile.profileBoosts * 5

  // Activity recency (more recent = higher score)
  const hoursAgo = (Date.now() - new Date(profile.lastActive).getTime()) / (1000 * 60 * 60)
  if (hoursAgo < 1) score += 10
  else if (hoursAgo < 6) score += 8
  else if (hoursAgo < 24) score += 5
  else if (hoursAgo < 72) score += 2

  // Engagement metrics
  score += Math.min(profile.profileViews / 10, 10) // Max 10 points from views
  score += Math.min(profile.likesReceived / 5, 15) // Max 15 points from likes
  score += profile.responseRate * 10 // Max 10 points from response rate

  return Math.round(score)
}

// Sort profiles by ranking (premium users first)
function sortProfilesByRanking(profiles: any[]): any[] {
  return profiles
    .map(profile => ({
      ...profile,
      rankingScore: calculateProfileRanking(profile)
    }))
    .sort((a, b) => {
      // First sort by subscription tier
      const tierOrder = { 'premium_plus': 3, 'premium': 2, 'free': 1 }
      const tierDiff = tierOrder[b.subscriptionType as keyof typeof tierOrder] - tierOrder[a.subscriptionType as keyof typeof tierOrder]

      if (tierDiff !== 0) return tierDiff

      // Then by ranking score
      return b.rankingScore - a.rankingScore
    })
}

export async function GET() {
  try {
    // Apply ranking algorithm to prioritize premium users
    const rankedProfiles = sortProfilesByRanking(mockProfiles)

    console.log('Profile ranking applied:')
    rankedProfiles.forEach(profile => {
      console.log(`${profile.firstName} (${profile.subscriptionType}): Score ${profile.rankingScore}`)
    })

    return NextResponse.json({
      profiles: rankedProfiles,
      success: true,
      ranking: {
        algorithm: "premium_priority",
        description: "Premium and Premium Plus users are shown first, followed by engagement metrics"
      }
    })
  } catch (error) {
    console.error("Failed to fetch profiles:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
