import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"
import { authenticator } from "otplib"
import QRCode from "qrcode"

// Enable 2FA
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate secret
    const secret = authenticator.generateSecret()
    
    // Save secret temporarily
    await pool.query(
      `INSERT INTO two_factor_temp (user_id, secret, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
       ON CONFLICT (user_id) 
       DO UPDATE SET secret = $2, expires_at = NOW() + INTERVAL '10 minutes'`,
      [user.id, secret]
    )

    // Generate QR code
    const otpauth = authenticator.keyuri(
      user.email,
      "Mingle Finder",
      secret
    )
    
    const qrCode = await QRCode.toDataURL(otpauth)

    return NextResponse.json({
      secret,
      qrCode,
    })
  } catch (error) {
    console.error("Failed to enable 2FA:", error)
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 }
    )
  }
}

// Verify and activate 2FA
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { token } = await request.json()
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Get temporary secret
    const result = await pool.query(
      "SELECT secret FROM two_factor_temp WHERE user_id = $1 AND expires_at > NOW()",
      [user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Setup expired, please try again" }, { status: 400 })
    }

    const { secret } = result.rows[0]

    // Verify token
    const isValid = authenticator.verify({
      token,
      secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substr(2, 8)
    )

    // Save 2FA settings
    await pool.query(
      `UPDATE users 
       SET two_factor_enabled = true,
           two_factor_secret = $2,
           two_factor_backup_codes = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id, secret, backupCodes]
    )

    // Delete temporary secret
    await pool.query(
      "DELETE FROM two_factor_temp WHERE user_id = $1",
      [user.id]
    )

    return NextResponse.json({
      message: "2FA enabled successfully",
      backupCodes,
    })
  } catch (error) {
    console.error("Failed to verify 2FA:", error)
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    )
  }
}

// Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await pool.query(
      `UPDATE users 
       SET two_factor_enabled = false,
           two_factor_secret = NULL,
           two_factor_backup_codes = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    )

    return NextResponse.json({ message: "2FA disabled successfully" })
  } catch (error) {
    console.error("Failed to disable 2FA:", error)
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 }
    )
  }
} 