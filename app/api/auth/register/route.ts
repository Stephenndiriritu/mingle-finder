import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth"

// Mock user for development
const mockUser = {
  id: 1,
  email: "",
  name: "",
  is_admin: false,
  subscription_type: "free",
  is_verified: false
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, dateOfBirth, gender, location } = await request.json()

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    try {
      // Check if user already exists
      const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email])
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 })
      }

      // Hash password
      const passwordHash = hashPassword(password)

      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, name, date_of_birth, gender, location) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, is_admin, subscription_type, is_verified`,
        [email, passwordHash, name, dateOfBirth, gender, location],
      )

      const user = userResult.rows[0]

      // Create profile
      await pool.query("INSERT INTO profiles (user_id, age) VALUES ($1, $2)", [
        user.id,
        dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : null,
      ])

      // Create user preferences
      await pool.query("INSERT INTO user_preferences (user_id) VALUES ($1)", [user.id])

      // Generate token
      const token = generateToken(user)

      // Create response
      const response = NextResponse.json({
        message: "User registered successfully",
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
        const mockUserData = {
          ...mockUser,
          email,
          name
        }
        const token = generateToken(mockUserData)
        
        const response = NextResponse.json({
          message: "User registered successfully (mock)",
          user: mockUserData
        })

        response.cookies.set("auth-token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })

        return response
      }

      throw dbError
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ 
      error: "Registration failed. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}
