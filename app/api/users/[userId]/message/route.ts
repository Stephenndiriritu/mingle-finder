import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// POST /api/users/[userId]/message - Start a conversation with a specific user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId: targetUserId } = await params
    const { message } = await request.json()

    // Check if user has premium subscription for messaging
    if (user.subscriptionType === 'free') {
      return NextResponse.json({
        error: "Messaging requires a premium subscription",
        code: "SUBSCRIPTION_REQUIRED",
        message: "Free users cannot send messages. Upgrade to Premium to start conversations!"
      }, { status: 403 })
    }

    // Verify the target user exists
    const targetUserResult = await pool.query(
      `SELECT u.id, u.name, p.first_name, p.last_name, p.profile_picture_url
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [targetUserId]
    )

    if (targetUserResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetUser = targetUserResult.rows[0]

    // Check if user is trying to message themselves
    if (parseInt(targetUserId) === user.id) {
      return NextResponse.json({ error: "Cannot start conversation with yourself" }, { status: 400 })
    }

    // Get or create conversation using the database function
    const conversationResult = await pool.query(
      'SELECT get_or_create_conversation($1, $2) as conversation_id',
      [user.id, targetUserId]
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
        [conversationId, user.id, targetUserId, message.trim()]
      )

      newMessage = {
        id: messageResult.rows[0].id,
        message: message.trim(),
        sender_id: user.id,
        receiver_id: targetUserId,
        sender_name: user.name,
        created_at: messageResult.rows[0].created_at,
        is_read: false
      }

      // Create notification for the target user
      await pool.query(
        'INSERT INTO notifications (user_id, type, content) VALUES ($1, $2, $3)',
        [targetUserId, 'message', `You have a new message from ${user.name}`]
      )

      console.log(`New conversation started: ${user.id} -> ${targetUserId}, message: "${message}"`)
    }

    return NextResponse.json({
      success: true,
      conversationId,
      message: newMessage,
      targetUser: {
        id: targetUser.id,
        name: targetUser.first_name 
          ? `${targetUser.first_name} ${targetUser.last_name || ''}`.trim()
          : targetUser.name,
        photo: targetUser.profile_picture_url || "/placeholder.svg?height=400&width=400"
      }
    })

  } catch (error) {
    console.error("Failed to start conversation:", error)
    return NextResponse.json(
      { error: "Failed to start conversation" },
      { status: 500 }
    )
  }
}

// GET /api/users/[userId]/message - Check if conversation exists with this user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId: targetUserId } = await params

    // Check if user is trying to check conversation with themselves
    if (parseInt(targetUserId) === user.id) {
      return NextResponse.json({ error: "Cannot check conversation with yourself" }, { status: 400 })
    }

    // Check if conversation exists
    const conversationResult = await pool.query(
      `SELECT c.id, c.is_blocked, c.blocked_by,
              u.name, p.first_name, p.last_name, p.profile_picture_url,
              u.last_active
       FROM conversations c
       LEFT JOIN users u ON (CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END = u.id)
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE (c.user1_id = $1 AND c.user2_id = $2) OR (c.user1_id = $2 AND c.user2_id = $1)`,
      [user.id, parseInt(targetUserId)]
    )

    if (conversationResult.rows.length === 0) {
      return NextResponse.json({
        exists: false,
        conversationId: null
      })
    }

    const conversation = conversationResult.rows[0]
    const isOnline = conversation.last_active && 
      new Date(conversation.last_active) > new Date(Date.now() - 15 * 60 * 1000)

    return NextResponse.json({
      exists: true,
      conversationId: conversation.id,
      isBlocked: conversation.is_blocked,
      blockedBy: conversation.blocked_by,
      targetUser: {
        name: conversation.first_name 
          ? `${conversation.first_name} ${conversation.last_name || ''}`.trim()
          : conversation.name,
        photo: conversation.profile_picture_url || "/placeholder.svg?height=400&width=400",
        isOnline,
        lastActive: conversation.last_active
      }
    })

  } catch (error) {
    console.error("Failed to check conversation:", error)
    return NextResponse.json(
      { error: "Failed to check conversation" },
      { status: 500 }
    )
  }
}
