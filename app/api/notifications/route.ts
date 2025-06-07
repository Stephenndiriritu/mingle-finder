import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Mock notifications for development
const mockNotifications = new Map()

// Initialize with some mock notifications
const defaultNotifications = [
  {
    id: 1,
    type: "match",
    title: "New Match!",
    message: "You matched with Sarah!",
    data: { match_id: 1, user_id: 2 },
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "Hey! How are you?",
    data: { match_id: 1, sender_id: 2 },
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    type: "like",
    title: "Someone Liked You!",
    message: "Michael liked your profile",
    data: { user_id: 3 },
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const unreadOnly = searchParams.get("unread") === "true"

    let query = `
      SELECT id, type, title, message, link, is_read, created_at, metadata
      FROM notifications
      WHERE user_id = $1
    `
    const queryParams = [user.id]

    if (unreadOnly) {
      query += " AND is_read = false"
    }

    query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3"
    queryParams.push(limit, offset)

    const result = await pool.query(query, queryParams)

    // Get unread count
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
      [user.id]
    )

    return NextResponse.json({
      notifications: result.rows,
      unreadCount: parseInt(countResult.rows[0].count)
    })
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationIds } = await request.json()

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      )
    }

    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = ANY($1) AND user_id = $2",
      [notificationIds, user.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update notifications:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}
