import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"
import { getCachedDiscoverUsers, setCachedDiscoverUsers } from "@/lib/cache"

// Mock data for development
const mockUsers = [
  {
    id: 2,
    name: "Sarah Johnson",
    date_of_birth: "1995-03-15",
    gender: "female",
    location: "New York, NY",
    latitude: 40.7128,
    longitude: -74.0060,
    bio: "Adventure seeker and coffee enthusiast. Love hiking and photography.",
    photos: ["photo1.jpg", "photo2.jpg"],
    age: 28,
    height: 165,
    occupation: "UX Designer",
    interests: ["hiking", "photography", "travel"],
    profile_completion_percentage: 95,
    distance: 5.2,
    subscription_type: "free"
  },
  {
    id: 3,
    name: "Michael Chen",
    date_of_birth: "1993-07-22",
    gender: "male",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    bio: "Tech enthusiast and foodie. Always up for trying new restaurants.",
    photos: ["photo3.jpg", "photo4.jpg"],
    age: 30,
    height: 180,
    occupation: "Software Engineer",
    interests: ["coding", "food", "music"],
    profile_completion_percentage: 90,
    distance: 3.8,
    subscription_type: "gold"
  },
  {
    id: 4,
    name: "Emily Davis",
    date_of_birth: "1996-11-30",
    gender: "female",
    location: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    bio: "Artist and yoga instructor. Looking for someone to share adventures with.",
    photos: ["photo5.jpg", "photo6.jpg"],
    age: 27,
    height: 170,
    occupation: "Yoga Instructor",
    interests: ["art", "yoga", "meditation"],
    profile_completion_percentage: 85,
    distance: 7.1,
    subscription_type: "platinum"
  }
]

const mockPreferences = {
  max_distance: 50,
  age_min: 25,
  age_max: 35,
  show_me: "everyone"
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Try to get cached results first
    const cachedUsers = await getCachedDiscoverUsers(user.id)
    if (cachedUsers.length > offset) {
      return NextResponse.json({ 
        users: cachedUsers.slice(offset, offset + limit),
        fromCache: true 
      })
    }

    try {
      // Get user's preferences and location in a single query
      const userDataResult = await pool.query(
        `SELECT p.max_distance, p.age_min, p.age_max, p.show_me, u.latitude, u.longitude
         FROM profiles p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = $1`,
        [user.id]
      )

      if (userDataResult.rows.length === 0) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      }

      const preferences = userDataResult.rows[0]
      const userLocation = {
        latitude: preferences.latitude,
        longitude: preferences.longitude
      }

      // Materialized CTE for better performance
      const query = `
        WITH filtered_users AS MATERIALIZED (
          SELECT DISTINCT 
            u.id, u.name, u.date_of_birth, u.gender, u.location, u.latitude, u.longitude,
            p.bio, p.photos, p.age, p.height, p.occupation, p.interests,
            p.profile_completion_percentage,
            CASE 
              WHEN u.latitude IS NOT NULL AND u.longitude IS NOT NULL AND $4 IS NOT NULL AND $5 IS NOT NULL
              THEN calculate_distance($4, $5, u.latitude, u.longitude)
              ELSE NULL
            END as distance,
            CASE 
              WHEN u.subscription_type IN ('gold', 'platinum') THEN 1 
              ELSE 0 
            END as is_premium
          FROM users u
          JOIN profiles p ON u.id = p.user_id
          WHERE u.id != $1
            AND u.is_active = true
            AND u.id NOT IN (
              SELECT swiped_id FROM swipes WHERE swiper_id = $1
            )
            AND u.id NOT IN (
              SELECT blocked_id FROM blocks WHERE blocker_id = $1
              UNION
              SELECT blocker_id FROM blocks WHERE blocked_id = $1
            )
            AND p.age BETWEEN $2 AND $3
            AND (
              $6 = 'everyone' OR 
              ($6 = 'male' AND u.gender = 'male') OR
              ($6 = 'female' AND u.gender = 'female')
            )
            AND (
              u.latitude IS NULL OR u.longitude IS NULL OR $4 IS NULL OR $5 IS NULL OR
              calculate_distance($4, $5, u.latitude, u.longitude) <= $7
            )
        )
        SELECT *
        FROM filtered_users
        ORDER BY 
          is_premium DESC,
          profile_completion_percentage DESC,
          distance ASC NULLS LAST,
          last_active DESC,
          RANDOM()
        LIMIT $8 OFFSET $9
      `

      const queryParams = [
        user.id,
        preferences.age_min,
        preferences.age_max,
        userLocation.latitude,
        userLocation.longitude,
        preferences.show_me,
        preferences.max_distance,
        limit,
        offset
      ]

      const result = await pool.query(query, queryParams)
      const users = result.rows

      // Cache the results
      if (offset === 0) {
        await setCachedDiscoverUsers(user.id, users)
      }

      return NextResponse.json({ users })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      if (process.env.NODE_ENV === "development") {
        // Development mock data handling
        return NextResponse.json({ 
          users: mockUsers.slice(offset, offset + limit),
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Discover error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch discover users",
      details: process.env.NODE_ENV === "development" ? String(error) : undefined
    }, { status: 500 })
  }
}
