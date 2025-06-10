import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import pool from "@/lib/db"
import crypto from "crypto"
import { sendEmail } from "@/lib/email"
// Removed NextAuth imports
import { query } from "@/lib/db"

// Generate verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(request: NextRequest) {
  try {
    // For now, allow verification without authentication
    // TODO: Add proper authentication check later
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 24 * 3600000) // 24 hours

    // Update user with new verification token
    await query(
      `UPDATE users 
       SET verification_token = $1,
           verification_token_expires = $2
       WHERE email = $3`,
      [verificationToken, expiresAt, email]
    )

    // Send verification email
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: session.user.email,
      subject: "Verify your email",
      html: `
        <h1>Verify your email address</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `
    })

    return NextResponse.json({ message: "Verification email sent" })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token } = await request.json()

    // Find the verification record
    const verificationResult = await query(
      `SELECT u.id, u.verification_token_expires
       FROM users u
       WHERE u.verification_token = $1
       AND u.verification_token_expires > NOW()`,
      [token]
    );

    if (verificationResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    const userId = verificationResult.rows[0].id;

    // Update user verification status and clear token
    await query(
      `UPDATE users 
       SET is_verified = true,
           verification_token = NULL,
           verification_token_expires = NULL
       WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
} 