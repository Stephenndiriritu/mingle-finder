import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { hashPassword } from "@/lib/auth-utils"
import crypto from "crypto"
import { query } from "@/lib/db"
// Removed NextAuth import
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

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

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Check if user exists
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      )
      
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 })
      }

      // Hash password
      const passwordHash = await hashPassword(password)

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex")
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Validate and parse date of birth
      let parsedDateOfBirth = null
      if (dateOfBirth) {
        const date = new Date(dateOfBirth)
        if (!isNaN(date.getTime())) {
          parsedDateOfBirth = date.toISOString().split('T')[0]
        }
      }

      // Create user with is_verified set to false initially
      const userResult = await client.query(
        `INSERT INTO users (
          email, password_hash, name, birthdate, 
          gender, location, is_verified, verification_token,
          verification_token_expires, is_admin, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8, false, true) 
        RETURNING id, email, name`,
        [email, passwordHash, name, parsedDateOfBirth, gender || null, location || null, verificationToken, tokenExpiry]
      )

      const user = userResult.rows[0]

      // Calculate age if birthdate is provided
      let age = null
      if (parsedDateOfBirth) {
        const birthDate = new Date(parsedDateOfBirth)
        const today = new Date()
        age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
      }

      // Create profile
      await client.query(
        `INSERT INTO profiles (user_id, first_name, age, profile_completion_percentage)
         VALUES ($1, $2, $3, $4)`,
        [user.id, name, age, 20] // Set initial profile completion to 20%
      )

      // Create preferences
      await client.query(
        "INSERT INTO user_preferences (user_id) VALUES ($1)",
        [user.id]
      )

      await client.query('COMMIT')

      // Generate JWT token for automatic login
      const token = sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: false,
          isVerified: false,
          isActive: true
        },
        process.env.NEXTAUTH_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      )

      // Create response with session data
      const response = NextResponse.json({
        message: "Registration successful. Please verify your email.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isVerified: false,
          isAdmin: false,
          isActive: true
        },
        verificationToken, // Include this for testing purposes
        session: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          },
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      })

      // Set the session cookie
      response.cookies.set('next-auth.session-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      })

      return response

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Registration failed. Please try again later." 
    }, { status: 500 })
  }
}
