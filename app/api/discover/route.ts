import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Helper function to calculate age from birthdate
function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

// Helper function to calculate ranking score
function calculateRankingScore(profile: any): number {
  let score = 50 // Base score

  // Premium users get higher scores
  if (profile.subscription_type === 'premium_plus') score += 30
  else if (profile.subscription_type === 'premium') score += 20
  else if (profile.subscription_type === 'gold') score += 15

  // Verified users get bonus
  if (profile.is_verified) score += 10

  // Profile completion bonus
  if (profile.profile_completion_percentage >= 80) score += 10
  else if (profile.profile_completion_percentage >= 60) score += 5

  // Recent activity bonus
  const lastActive = new Date(profile.last_active)
  const hoursAgo = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60)
  if (hoursAgo < 24) score += 5
  else if (hoursAgo < 72) score += 2

  return Math.min(score, 100) // Cap at 100
}
// Sort profiles by ranking (premium users first)
function sortProfilesByRanking(profiles: any[]): any[] {
  return profiles
    .map(profile => ({
      ...profile,
      rankingScore: calculateRankingScore(profile)
    }))
    .sort((a, b) => {
      // First sort by subscription tier
      const tierOrder = { 'premium_plus': 3, 'premium': 2, 'gold': 1.5, 'free': 1 }
      const tierDiff = (tierOrder[b.subscriptionType as keyof typeof tierOrder] || 1) -
                      (tierOrder[a.subscriptionType as keyof typeof tierOrder] || 1)

      if (tierDiff !== 0) return tierDiff

      // Then by ranking score
      return b.rankingScore - a.rankingScore
    })
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request as any)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get profiles from database, excluding current user and already swiped users
    const query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.subscription_type,
        u.is_verified,
        u.last_active,
        u.location,
        p.first_name,
        p.last_name,
        p.birth_date,
        p.bio,
        p.interests,
        p.profile_picture_url,
        p.profile_completion_percentage
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id != $1
        AND u.is_active = true
        AND u.id NOT IN (
          SELECT swiped_id FROM swipes WHERE swiper_id = $1
        )
        AND u.id NOT IN (
          SELECT blocked_id FROM blocks WHERE blocker_id = $1
        )
        AND u.id NOT IN (
          SELECT blocker_id FROM blocks WHERE blocked_id = $1
        )
      ORDER BY
        CASE u.subscription_type
          WHEN 'premium_plus' THEN 4
          WHEN 'premium' THEN 3
          WHEN 'gold' THEN 2
          ELSE 1
        END DESC,
        u.is_verified DESC,
        u.last_active DESC
      LIMIT 20
    `

    const result = await pool.query(query, [user.id])

    // Transform database results to match expected format
    const profiles = result.rows.map(row => {
      const profile = {
        id: row.id,
        firstName: row.first_name || row.name?.split(' ')[0] || 'User',
        lastName: row.last_name || row.name?.split(' ')[1] || '',
        birthDate: row.birth_date,
        bio: row.bio || 'No bio available',
        photos: row.profile_picture_url ? [row.profile_picture_url] : ["/placeholder.svg?height=600&width=400"],
        location: row.location || 'Location not specified',
        interests: row.interests || [],
        subscriptionType: row.subscription_type || 'free',
        isVerified: row.is_verified || false,
        lastActive: row.last_active,
        profileCompletion: row.profile_completion_percentage || 0
      }

      return {
        ...profile,
        rankingScore: calculateRankingScore(profile)
      }
    })

    // Apply additional sorting by ranking score
    const rankedProfiles = sortProfilesByRanking(profiles)

    console.log(`Fetched ${rankedProfiles.length} profiles for discovery`)

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
