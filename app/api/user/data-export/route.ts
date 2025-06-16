import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Export user data
    const userData = await pool.query(
      `SELECT id, email, name, created_at, last_active, subscription_type
       FROM users WHERE id = $1`,
      [user.id]
    )

    // Export profile data
    const profileData = await pool.query(
      `SELECT first_name, last_name, bio, age, location, gender, interests
       FROM profiles WHERE user_id = $1`,
      [user.id]
    )

    // Export matches count
    const matchesData = await pool.query(
      `SELECT COUNT(*) as total_matches FROM matches
       WHERE (user1_id = $1 OR user2_id = $1) AND matched_at IS NOT NULL`,
      [user.id]
    )

    // Export recent messages count
    const messagesData = await pool.query(
      `SELECT COUNT(*) as total_messages FROM messages
       WHERE sender_id = $1 OR receiver_id = $1`,
      [user.id]
    )

    return NextResponse.json({
      message: "Data export completed",
      data: {
        user: userData.rows[0],
        profile: profileData.rows[0] || null,
        stats: {
          totalMatches: parseInt(matchesData.rows[0]?.total_matches || '0'),
          totalMessages: parseInt(messagesData.rows[0]?.total_messages || '0')
        },
        exportedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Data export failed:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}