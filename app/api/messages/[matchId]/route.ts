import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { matchId } = await params

    // Get match and other user information
    const matchQuery = `
      SELECT
        m.id,
        m.created_at as matched_at,
        CASE
          WHEN m.user1_id = $1 THEN m.user2_id
          ELSE m.user1_id
        END as other_user_id,
        u.name,
        u.last_active,
        p.profile_picture_url,
        p.first_name,
        p.last_name
      FROM matches m
      JOIN users u ON (
        CASE
          WHEN m.user1_id = $1 THEN m.user2_id
          ELSE m.user1_id
        END = u.id
      )
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE m.id = $2 AND (m.user1_id = $1 OR m.user2_id = $1)
    `

    const matchResult = await pool.query(matchQuery, [user.id, matchId])

    if (matchResult.rows.length === 0) {
      return NextResponse.json({ error: "Match not found or access denied" }, { status: 404 })
    }

    const match = matchResult.rows[0]

    // Get messages for this match
    const messagesQuery = `
      SELECT
        m.id,
        m.content as message,
        m.sender_id,
        m.created_at,
        m.is_read,
        u.name as sender_name,
        p.first_name,
        p.last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE m.match_id = $1
      ORDER BY m.created_at ASC
    `

    const messagesResult = await pool.query(messagesQuery, [matchId])

    const messages = messagesResult.rows.map(row => ({
      id: row.id,
      message: row.message,
      sender_id: row.sender_id,
      sender_name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : row.sender_name,
      created_at: row.created_at,
      is_read: row.is_read
    }))

    // Check if other user is online (active within last 15 minutes)
    const isOnline = match.last_active && new Date(match.last_active) > new Date(Date.now() - 15 * 60 * 1000)

    const chatData = {
      recipientId: match.other_user_id,
      recipientName: match.first_name ? `${match.first_name} ${match.last_name || ''}`.trim() : match.name,
      recipientPhoto: match.profile_picture_url || "/placeholder.svg?height=400&width=400",
      isOnline,
      lastActive: match.last_active,
      messages
    }

    return NextResponse.json(chatData)
  } catch (error) {
    console.error("Failed to fetch chat data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
