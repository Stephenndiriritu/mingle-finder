import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// GET /api/conversations/[conversationId] - Get conversation details and messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params

    // Verify user is part of this conversation
    const conversationQuery = `
      SELECT
        c.id,
        c.user1_id,
        c.user2_id,
        c.created_at,
        c.is_blocked,
        c.blocked_by,
        CASE
          WHEN c.user1_id = $1 THEN c.user2_id
          ELSE c.user1_id
        END as other_user_id,
        CASE
          WHEN c.user1_id = $1 THEN u2.name
          ELSE u1.name
        END as other_user_name,
        CASE
          WHEN c.user1_id = $1 THEN u2.last_active
          ELSE u1.last_active
        END as other_user_last_active,
        CASE
          WHEN c.user1_id = $1 THEN p2.first_name
          ELSE p1.first_name
        END as other_user_first_name,
        CASE
          WHEN c.user1_id = $1 THEN p2.last_name
          ELSE p1.last_name
        END as other_user_last_name,
        CASE
          WHEN c.user1_id = $1 THEN p2.profile_picture_url
          ELSE p1.profile_picture_url
        END as other_user_photo
      FROM conversations c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN profiles p1 ON c.user1_id = p1.user_id
      LEFT JOIN profiles p2 ON c.user2_id = p2.user_id
      WHERE c.id = $2 AND (c.user1_id = $1 OR c.user2_id = $1)
    `

    const conversationResult = await pool.query(conversationQuery, [user.id, conversationId])

    if (conversationResult.rows.length === 0) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 })
    }

    const conversation = conversationResult.rows[0]

    // Get messages for this conversation
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    const messagesQuery = `
      SELECT
        m.id,
        m.content as message,
        m.sender_id,
        m.receiver_id,
        m.created_at,
        m.is_read,
        u.name as sender_name,
        p.first_name,
        p.last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `

    const messagesResult = await pool.query(messagesQuery, [conversationId, limit, offset])

    const messages = messagesResult.rows.map(row => ({
      id: row.id,
      message: row.message,
      sender_id: row.sender_id,
      receiver_id: row.receiver_id,
      sender_name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : row.sender_name,
      created_at: row.created_at,
      is_read: row.is_read
    })).reverse() // Reverse to show oldest first

    // Mark messages as read for the current user
    await pool.query(
      'UPDATE messages SET is_read = true WHERE conversation_id = $1 AND receiver_id = $2 AND is_read = false',
      [conversationId, user.id]
    )

    // Check if other user is online (active within last 15 minutes)
    const isOnline = conversation.other_user_last_active && 
      new Date(conversation.other_user_last_active) > new Date(Date.now() - 15 * 60 * 1000)

    const chatData = {
      conversationId: conversation.id,
      recipientId: conversation.other_user_id,
      recipientName: conversation.other_user_first_name 
        ? `${conversation.other_user_first_name} ${conversation.other_user_last_name || ''}`.trim()
        : conversation.other_user_name,
      recipientPhoto: conversation.other_user_photo || "/placeholder.svg?height=400&width=400",
      isOnline,
      lastActive: conversation.other_user_last_active,
      isBlocked: conversation.is_blocked,
      blockedBy: conversation.blocked_by,
      messages,
      pagination: {
        page,
        limit,
        hasMore: messagesResult.rows.length === limit
      }
    }

    return NextResponse.json(chatData)

  } catch (error) {
    console.error("Failed to fetch conversation:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/conversations/[conversationId] - Send a message in this conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId } = await params
    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Check if user has premium subscription for messaging
    if (user.subscriptionType === 'free') {
      return NextResponse.json({
        error: "Messaging requires a premium subscription",
        code: "SUBSCRIPTION_REQUIRED",
        message: "Free users cannot send messages. Upgrade to Premium to start conversations!"
      }, { status: 403 })
    }

    // Verify user is part of this conversation and get other user info
    const conversationCheck = await pool.query(
      `SELECT user1_id, user2_id, is_blocked, blocked_by,
              CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END as other_user_id
       FROM conversations 
       WHERE id = $2 AND (user1_id = $1 OR user2_id = $1)`,
      [user.id, conversationId]
    )

    if (conversationCheck.rows.length === 0) {
      return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 })
    }

    const conversation = conversationCheck.rows[0]

    // Check if conversation is blocked
    if (conversation.is_blocked) {
      return NextResponse.json({ 
        error: "Cannot send message in blocked conversation",
        code: "CONVERSATION_BLOCKED"
      }, { status: 403 })
    }

    // Insert message into database
    const messageResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, content) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, created_at`,
      [conversationId, user.id, conversation.other_user_id, message.trim()]
    )

    const newMessage = {
      id: messageResult.rows[0].id,
      message: message.trim(),
      sender_id: user.id,
      receiver_id: conversation.other_user_id,
      sender_name: user.name,
      created_at: messageResult.rows[0].created_at,
      is_read: false
    }

    // Create notification for the other user
    await pool.query(
      'INSERT INTO notifications (user_id, type, content) VALUES ($1, $2, $3)',
      [conversation.other_user_id, 'message', `You have a new message from ${user.name}`]
    )

    console.log(`New message sent in conversation ${conversationId}: "${message}" by user ${user.id}`)

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
