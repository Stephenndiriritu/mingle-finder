import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Mock profile for development
const mockProfile = {
  id: 1,
  user_id: 1,
  name: "Test User",
  email: "test@example.com",
  birthdate: "1990-01-01",
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
    // For now, return mock profile data for testing
    // TODO: Add proper authentication and database queries later

    return NextResponse.json({
      profile: {
        ...mockProfile,
        firstName: "Test",
        lastName: "User",
        birthDate: "1995-06-15",
        profileCompletionPercentage: 75
      },
      _mock: true
    })
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
    // For now, simulate profile updates for testing
    // TODO: Add proper authentication and database updates later

    const updates = await request.json()
    console.log('Profile update request:', updates)

    // Simulate successful update
    const updatedProfile = {
      ...mockProfile,
      ...updates,
      firstName: updates.firstName || "Test",
      lastName: updates.lastName || "User",
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: "Profile updated successfully (mock)",
      profile: updatedProfile,
      _mock: true
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({
      error: "Failed to update profile. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}
