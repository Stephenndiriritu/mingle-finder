import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { hashPassword, generateToken } from "@/lib/auth-utils"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      dateOfBirth,
      gender,
      location,
      bio,
      interests,
      occupation,
      education,
      height,
      lookingFor,
      ageMin,
      ageMax,
      maxDistance
    } = await request.json()

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

      // Create user with all provided information
      const userResult = await client.query(
        `INSERT INTO users (
          email, password_hash, name, birthdate,
          gender, location, bio, is_verified, verification_token,
          verification_token_expires, is_admin, is_active, subscription_type,
          created_at, updated_at, last_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, $9, false, true, 'free', NOW(), NOW(), NOW())
        RETURNING id, email, name, birthdate, gender, location, bio, is_verified, is_admin, subscription_type`,
        [email, passwordHash, name, parsedDateOfBirth, gender || null, location || null, bio || null, verificationToken, tokenExpiry]
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

      // Split name into first and last name
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''

      // Create comprehensive profile
      await client.query(
        `INSERT INTO profiles (
          user_id, first_name, last_name, bio, age, gender, location,
          interests, height, occupation, education, looking_for,
          age_min, age_max, max_distance, show_me, birth_date,
          profile_completion_percentage, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())`,
        [
          user.id,
          firstName,
          lastName,
          bio || null,
          age,
          gender || null,
          location || null,
          interests ? (Array.isArray(interests) ? interests : [interests]) : [],
          height || null,
          occupation || null,
          education || null,
          lookingFor || 'relationship',
          ageMin || 18,
          ageMax || 99,
          maxDistance || 50,
          'everyone',
          parsedDateOfBirth,
          bio ? 60 : 30 // Higher completion if bio provided
        ]
      )

      // Create user preferences with provided settings
      await client.query(
        `INSERT INTO user_preferences (
          user_id, created_at, updated_at
        ) VALUES ($1, NOW(), NOW())`,
        [user.id]
      )

      await client.query('COMMIT')

      // Generate JWT token for automatic login using proper auth utils
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        subscriptionType: user.subscription_type,
        isVerified: user.is_verified
      }

      const token = generateToken(tokenPayload)

      // Create response with complete user data from database
      const response = NextResponse.json({
        success: true,
        message: "Registration successful. Please verify your email.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          birthdate: user.birthdate,
          gender: user.gender,
          location: user.location,
          bio: user.bio,
          isVerified: user.is_verified,
          isAdmin: user.is_admin,
          subscriptionType: user.subscription_type,
          isActive: true
        },
        token: token,
        verificationToken // Include this for testing purposes
      })

      // Set the auth cookie with proper name
      response.cookies.set('auth-token', token, {
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
