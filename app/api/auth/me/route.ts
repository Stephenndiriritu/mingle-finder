import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

// Mock user for development
const mockUser = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  is_admin: false,
  subscription_type: "free",
  is_verified: true,
  is_active: true,
  profile: {
    bio: "Mock user for development",
    photos: ["avatar1.jpg"],
    age: 28,
    height: 175,
    occupation: "Software Developer",
    interests: ["coding", "reading", "travel"],
    profile_completion_percentage: 85
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In development, enhance the user object with mock profile data
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({ 
        user: {
          ...user,
          profile: mockUser.profile,
          _mock: true
        }
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch user data. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}
