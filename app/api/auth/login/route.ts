import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { comparePassword, generateToken } from "@/lib/auth"

// Mock user for development
const mockUser = {
  id: 1,
  email: "test@example.com",
  password_hash: "$2b$10$mockhashedpassword",
  name: "Test User",
  is_admin: false,
  subscription_type: "free",
  is_verified: true,
  is_active: true
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    try {
      // Find user
      const userResult = await pool.query(
        "SELECT id, email, password_hash, name, is_admin, subscription_type, is_verified, is_active FROM users WHERE email = $1",
        [email],
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const user = userResult.rows[0]

      if (!user.is_active) {
        return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
      }

      // Verify password
      if (!comparePassword(password, user.password_hash)) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Update last active
      await pool.query("UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1", [user.id])

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin,
        subscription_type: user.subscription_type,
        is_verified: user.is_verified,
      })

      // Create response
      const response = NextResponse.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          is_admin: user.is_admin,
          subscription_type: user.subscription_type,
          is_verified: user.is_verified,
        },
      })

      // Set cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return response
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        // For development, accept any password for the mock user
        if (email === mockUser.email || process.env.MOCK_LOGIN === "true") {
          const token = generateToken({
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            is_admin: mockUser.is_admin,
            subscription_type: mockUser.subscription_type,
            is_verified: mockUser.is_verified,
          })

          const response = NextResponse.json({
            message: "Login successful (mock)",
            user: {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              is_admin: mockUser.is_admin,
              subscription_type: mockUser.subscription_type,
              is_verified: mockUser.is_verified,
            },
          })

          response.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          })

          return response
        }
        
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      throw dbError
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ 
      error: "Login failed. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}
