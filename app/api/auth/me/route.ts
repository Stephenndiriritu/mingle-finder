import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token in cookie or header
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "Not authenticated" 
      }, { status: 401 })
    }

    // Return complete user data from database
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        subscriptionType: user.subscriptionType,
        isVerified: user.isVerified,
        isActive: user.isActive,
        birthdate: user.birthdate,
        gender: user.gender,
        location: user.location,
        bio: user.bio,
        lastActive: user.lastActive,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error("Auth status check failed:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Authentication check failed" 
    }, { status: 500 })
  }
}
