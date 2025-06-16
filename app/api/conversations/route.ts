import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// GET /api/conversations - Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all conversations for the current user
    const conversationsQuery = `
      SELECT 
        c.id as conversation_id,
        c.created_at as conversation_created_at,
        c.last_message_at,
        c.is_blocked,
        c.blocked_by,
        -- Get the other user's info
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
        END as other_user_photo,
        -- Get last message info
        m.content as last_message,
        m.sender_id as last_message_sender_id,
        m.created_at as last_message_created_at,
        -- Count unread messages
        (SELECT COUNT(*) FROM messages 
         WHERE conversation_id = c.id 
         AND receiver_id = $1 
         AND is_read = false) as unread_count
      FROM conversations c
      LEFT JOIN users u1 ON c.user1_id = u1.id
      LEFT JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN profiles p1 ON c.user1_id = p1.user_id
      LEFT JOIN profiles p2 ON c.user2_id = p2.user_id
      LEFT JOIN LATERAL (
        SELECT content, sender_id, created_at
        FROM messages 
        WHERE conversation_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) m ON true
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
    `

    const result = await pool.query(conversationsQuery, [user.id])

    const conversations = result.rows.map(row => ({
      id: row.conversation_id,
      otherUser: {
        id: row.other_user_id,
        name: row.other_user_first_name 
          ? `${row.other_user_first_name} ${row.other_user_last_name || ''}`.trim()
          : row.other_user_name,
        photo: row.other_user_photo || "/placeholder.svg?height=400&width=400",
        lastActive: row.other_user_last_active,
        isOnline: row.other_user_last_active && 
          new Date(row.other_user_last_active) > new Date(Date.now() - 15 * 60 * 1000)
      },
      lastMessage: row.last_message ? {
        content: row.last_message,
        senderId: row.last_message_sender_id,
        createdAt: row.last_message_created_at,
        isFromMe: row.last_message_sender_id === user.id
      } : null,
      unreadCount: parseInt(row.unread_count) || 0,
      isBlocked: row.is_blocked,
      blockedBy: row.blocked_by,
      createdAt: row.conversation_created_at,
      lastMessageAt: row.last_message_at
    }))

    return NextResponse.json({
      conversations,
      total: conversations.length
    })

  } catch (error) {
    console.error("Failed to fetch conversations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/conversations - Start a new conversation with a user
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { otherUserId, message } = await request.json()

    if (!otherUserId) {
      return NextResponse.json({ error: "Other user ID is required" }, { status: 400 })
    }

    // Check if user has premium subscription for messaging
    if (user.subscriptionType === 'free') {
      return NextResponse.json({
        error: "Messaging requires a premium subscription",
        code: "SUBSCRIPTION_REQUIRED",
        message: "Free users cannot send messages. Upgrade to Premium to start conversations!"
      }, { status: 403 })
    }

    // Verify the other user exists
    const otherUserResult = await pool.query(
      'SELECT id, name FROM users WHERE id = $1',
      [otherUserId]
    )

    if (otherUserResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is trying to message themselves
    if (otherUserId === user.id) {
      return NextResponse.json({ error: "Cannot start conversation with yourself" }, { status: 400 })
    }

    // Get or create conversation using the database function
    const conversationResult = await pool.query(
      'SELECT get_or_create_conversation($1, $2) as conversation_id',
      [user.id, otherUserId]
    )

    const conversationId = conversationResult.rows[0].conversation_id

    // Check if conversation is blocked
    const blockCheckResult = await pool.query(
      'SELECT is_blocked, blocked_by FROM conversations WHERE id = $1',
      [conversationId]
    )

    const conversation = blockCheckResult.rows[0]
    if (conversation.is_blocked) {
      return NextResponse.json({ 
        error: "Cannot send message to this user",
        code: "CONVERSATION_BLOCKED"
      }, { status: 403 })
    }

    // If a message was provided, send it
    let newMessage = null
    if (message && message.trim()) {
      const messageResult = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, receiver_id, content) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, created_at`,
        [conversationId, user.id, otherUserId, message.trim()]
      )

      newMessage = {
        id: messageResult.rows[0].id,
        content: message.trim(),
        senderId: user.id,
        receiverId: otherUserId,
        createdAt: messageResult.rows[0].created_at,
        isRead: false
      }

      // Create notification for the other user
      await pool.query(
        'INSERT INTO notifications (user_id, type, content) VALUES ($1, $2, $3)',
        [otherUserId, 'message', `You have a new message from ${user.name}`]
      )
    }

    return NextResponse.json({
      conversationId,
      message: newMessage,
      success: true
    })

  } catch (error) {
    console.error("Failed to create conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}
