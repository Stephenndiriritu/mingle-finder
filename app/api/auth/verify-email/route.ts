import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

// Generate verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

    // Save verification token
    await pool.query(
      `INSERT INTO email_verifications (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      [user.id, verificationToken, expiresAt]
    )

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: `
        <h1>Verify your email address</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
    })

    return NextResponse.json({ message: "Verification email sent" })
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify token
    const result = await pool.query(
      `SELECT user_id, expires_at 
       FROM email_verifications 
       WHERE token = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    const verification = result.rows[0]
    
    // Check if token is expired
    if (new Date() > new Date(verification.expires_at)) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 })
    }

    // Mark user as verified
    await pool.query(
      `UPDATE users 
       SET is_verified = true, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [verification.user_id]
    )

    // Delete verification token
    await pool.query(
      "DELETE FROM email_verifications WHERE user_id = $1",
      [verification.user_id]
    )

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Failed to verify email:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
} 