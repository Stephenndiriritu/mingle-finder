import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Mock profile for development
const mockProfile = {
  id: 1,
  user_id: 1,
  name: "Test User",
  email: "test@example.com",
  date_of_birth: "1990-01-01",
  gender: "Not specified",
  location: "New York, NY",
  bio: "This is a mock profile for development",
  interests: ["Travel", "Music", "Technology"],
  photos: [],
  age: 33,
  height: 175,
  weight: 70,
  occupation: "Software Developer",
  education: "Bachelor's Degree",
  looking_for: "Relationship",
  relationship_type: "Long-term",
  max_distance: 50,
  age_min: 25,
  age_max: 40,
  show_me: "Everyone",
  smoking: "Never",
  drinking: "Socially",
  children: "None",
  religion: "None",
  political_views: "Moderate",
  languages: ["English"],
  hobbies: ["Coding", "Reading", "Gaming"],
  profile_completion_percentage: 85,
  subscription_type: "free",
  is_verified: true
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const profileResult = await pool.query(
        `SELECT p.*, u.email, u.name, u.date_of_birth, u.gender, u.location, u.subscription_type, u.is_verified
         FROM profiles p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = $1`,
        [user.id],
      )

      if (profileResult.rows.length === 0) {
        // Try to create a new profile
        const newProfileResult = await pool.query(
          `INSERT INTO profiles (user_id) VALUES ($1) RETURNING *`,
          [user.id]
        )
        return NextResponse.json({ profile: { ...newProfileResult.rows[0], ...user } })
      }

      return NextResponse.json({ profile: profileResult.rows[0] })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ 
          profile: mockProfile,
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch profile. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    try {
      const updateResult = await pool.query(
        `UPDATE profiles SET 
          bio = COALESCE($2, bio),
          interests = COALESCE($3, interests),
          photos = COALESCE($4, photos),
          height = COALESCE($5, height),
          weight = COALESCE($6, weight),
          occupation = COALESCE($7, occupation),
          education = COALESCE($8, education),
          looking_for = COALESCE($9, looking_for),
          relationship_type = COALESCE($10, relationship_type),
          max_distance = COALESCE($11, max_distance),
          age_min = COALESCE($12, age_min),
          age_max = COALESCE($13, age_max),
          show_me = COALESCE($14, show_me),
          smoking = COALESCE($15, smoking),
          drinking = COALESCE($16, drinking),
          children = COALESCE($17, children),
          religion = COALESCE($18, religion),
          political_views = COALESCE($19, political_views),
          languages = COALESCE($20, languages),
          hobbies = COALESCE($21, hobbies),
          updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING *`,
        [
          user.id,
          updates.bio,
          updates.interests,
          updates.photos,
          updates.height,
          updates.weight,
          updates.occupation,
          updates.education,
          updates.lookingFor,
          updates.relationshipType,
          updates.maxDistance,
          updates.ageMin,
          updates.ageMax,
          updates.showMe,
          updates.smoking,
          updates.drinking,
          updates.children,
          updates.religion,
          updates.politicalViews,
          updates.languages,
          updates.hobbies,
        ],
      )

      return NextResponse.json({
        message: "Profile updated successfully",
        profile: updateResult.rows[0],
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        const updatedProfile = { ...mockProfile, ...updates }
        return NextResponse.json({ 
          message: "Profile updated successfully (mock)",
          profile: updatedProfile,
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ 
      error: "Failed to update profile. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}
