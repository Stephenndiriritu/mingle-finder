import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("match_id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 })
    }

    // Verify user is part of this match
    const matchCheck = await pool.query(
      'SELECT id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [matchId, user.id]
    )

    if (matchCheck.rows.length === 0) {
      return NextResponse.json({ error: "Match not found or access denied" }, { status: 404 })
    }

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
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `

    const result = await pool.query(messagesQuery, [matchId, limit, offset])

    // Transform messages to expected format
    const messages = result.rows.map(row => ({
      id: row.id,
      message: row.message,
      sender_id: row.sender_id,
      sender_name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : row.sender_name,
      created_at: row.created_at,
      is_read: row.is_read
    })).reverse() // Reverse to show oldest first

    // Mark messages as read for the current user
    await pool.query(
      'UPDATE messages SET is_read = true WHERE match_id = $1 AND sender_id != $2 AND is_read = false',
      [matchId, user.id]
    )

    // Check if there are more messages
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE match_id = $1',
      [matchId]
    )
    const totalMessages = parseInt(countResult.rows[0].count)
    const hasMore = offset + limit < totalMessages

    return NextResponse.json({
      messages,
      page,
      limit,
      hasMore,
      total: totalMessages
    })
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { match_id, message } = body

    if (!match_id || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user has premium subscription for messaging
    if (user.subscriptionType === 'free') {
      return NextResponse.json({
        error: "Messaging requires a premium subscription",
        code: "SUBSCRIPTION_REQUIRED",
        message: "Free users cannot send messages. Upgrade to Premium to start conversations!"
      }, { status: 403 })
    }

    // Verify user is part of this match
    const matchCheck = await pool.query(
      'SELECT id, user1_id, user2_id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)',
      [match_id, user.id]
    )

    if (matchCheck.rows.length === 0) {
      return NextResponse.json({ error: "Match not found or access denied" }, { status: 404 })
    }

    // Insert message into database
    const messageResult = await pool.query(
      'INSERT INTO messages (match_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id, created_at',
      [match_id, user.id, message]
    )

    const newMessage = {
      id: messageResult.rows[0].id,
      message: message,
      sender_id: user.id,
      sender_name: user.name,
      created_at: messageResult.rows[0].created_at,
      is_read: false
    }

    // Create notification for the other user
    const match = matchCheck.rows[0]
    const receiverId = match.user1_id === user.id ? match.user2_id : match.user1_id

    await pool.query(
      'INSERT INTO notifications (user_id, type, content) VALUES ($1, $2, $3)',
      [receiverId, 'message', `You have a new message from ${user.name}`]
    )

    console.log(`New message sent in match ${match_id}: "${message}" by user ${user.id}`)

    return NextResponse.json({
      message: newMessage,
      success: true
    })
  } catch (error) {
    console.error("Failed to send message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}


