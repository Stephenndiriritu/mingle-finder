import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { comparePassword } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const userResult = await pool.query(
      `SELECT 
        id, email, password_hash, name, is_admin, 
        subscription_type, is_verified, is_active 
       FROM users 
       WHERE email = $1`,
      [email.toLowerCase()]
    )

    const user = userResult.rows[0]

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Update last active timestamp
    await pool.query(
      'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin,
      subscriptionType: user.subscription_type,
      isVerified: user.is_verified,
      isActive: user.is_active
    }

    console.log(`Login successful for ${user.is_admin ? 'ADMIN' : 'USER'}: ${email}`)

    return NextResponse.json({
      success: true,
      user: userData,
      message: "Login successful"
    })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    )
  }
}
