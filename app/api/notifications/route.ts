import { type NextRequest, NextResponse } from "next/server"

// Mock notifications for development - simulating a real notification system
const mockNotifications = [
  {
    id: 1,
    type: "match",
    title: "New Match!",
    message: "You matched with Sarah Johnson! 🎉",
    link: "/app/messages/1",
    data: { match_id: 1, user_id: 2 },
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "Sarah: Hey! How are you?",
    link: "/app/messages/1",
    data: { match_id: 1, sender_id: 2 },
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    type: "like",
    title: "Someone Liked You!",
    message: "Michael Chen liked your profile ❤️",
    link: "/app/discover",
    data: { user_id: 3 },
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    type: "match",
    title: "It's a Match!",
    message: "You and Emma Wilson liked each other!",
    link: "/app/messages/2",
    data: { match_id: 2, user_id: 4 },
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    type: "profile_view",
    title: "Profile View",
    message: "Jessica viewed your profile",
    link: "/app/profile",
    data: { user_id: 5 },
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Store read status in memory for demo
let readNotifications = new Set([4, 5])

export async function GET(request: NextRequest) {
  try {
    // For now, return mock notifications without authentication
    // TODO: Add proper authentication and database queries later

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const unreadOnly = searchParams.get("unread") === "true"

    // Update read status for mock notifications
    let notifications = mockNotifications.map(notification => ({
      ...notification,
      is_read: readNotifications.has(notification.id)
    }))

    // Filter by unread if requested
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.is_read)
    }

    // Apply pagination
    const paginatedNotifications = notifications
      .slice(offset, offset + limit)

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.is_read).length

    console.log(`Returning ${paginatedNotifications.length} notifications, ${unreadCount} unread`)

    return NextResponse.json({
      notifications: paginatedNotifications,
      unreadCount,
      total: notifications.length,
      hasMore: offset + limit < notifications.length
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
    // For now, handle mock notification updates
    // TODO: Add proper authentication and database updates later

    const body = await request.json()
    const { notificationIds, markAsRead } = body

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      )
    }

    // Update read status in memory for demo
    if (markAsRead) {
      notificationIds.forEach(id => readNotifications.add(id))
    } else {
      notificationIds.forEach(id => readNotifications.delete(id))
    }

    console.log(`Marked notifications ${notificationIds.join(', ')} as ${markAsRead ? 'read' : 'unread'}`)

    return NextResponse.json({
      success: true,
      message: `Notifications marked as ${markAsRead ? 'read' : 'unread'}`
    })
  } catch (error) {
    console.error("Failed to update notifications:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}

// POST endpoint to create new notifications (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, link, data } = body

    const newNotification = {
      id: Date.now(), // Simple ID generation for demo
      type: type || "info",
      title: title || "New Notification",
      message: message || "You have a new notification",
      link: link || "/app",
      data: data || {},
      is_read: false,
      created_at: new Date().toISOString()
    }

    // Add to mock notifications (in a real app, this would go to database)
    mockNotifications.unshift(newNotification)

    console.log(`Created new notification: ${title}`)

    return NextResponse.json({
      success: true,
      notification: newNotification
    })
  } catch (error) {
    console.error("Failed to create notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}
