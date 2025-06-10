import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

// Mock messages for development
const mockMessages = {
  "1": [
    {
      id: 1,
      message: "Hey! How are you?",
      sender_id: 2,
      receiver_id: 1,
      sender_name: "Sarah Johnson",
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      is_read: false
    },
    {
      id: 2,
      message: "Hi Sarah! I'm doing great, thanks for asking. How about you?",
      sender_id: 1,
      receiver_id: 2,
      sender_name: "Test User",
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      is_read: true
    },
    {
      id: 3,
      message: "I'm good too! I saw you like hiking. Do you have any favorite trails?",
      sender_id: 2,
      receiver_id: 1,
      sender_name: "Sarah Johnson",
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      is_read: false
    }
  ],
  "2": [
    {
      id: 4,
      message: "Would you like to grab coffee sometime?",
      sender_id: 3,
      receiver_id: 1,
      sender_name: "Michael Chen",
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      is_read: true
    },
    {
      id: 5,
      message: "That sounds great! I know a nice place downtown.",
      sender_id: 1,
      receiver_id: 3,
      sender_name: "Test User",
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      is_read: true
    }
  ],
  "3": []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("match_id")

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 })
    }

    // Return mock messages for the match
    const messages = mockMessages[matchId as keyof typeof mockMessages] || []

    return NextResponse.json({
      messages,
      page: 1,
      limit: 50,
      hasMore: false
    })
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Store new messages in memory for demo
let messageCounter = 6
const newMessages: any[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { match_id, receiver_id, message, user_id } = body

    if (!match_id || !receiver_id || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check user subscription status
    // In a real app, you'd fetch this from your database
    // For demo, we'll simulate subscription check
    const userSubscription = getUserSubscription(user_id || 1)

    if (userSubscription === 'free') {
      return NextResponse.json({
        error: "Messaging requires a premium subscription",
        code: "SUBSCRIPTION_REQUIRED",
        message: "Free users cannot send messages. Upgrade to Premium to start conversations!"
      }, { status: 403 })
    }

    // Create new message
    const newMessage = {
      id: messageCounter++,
      message: message,
      sender_id: user_id || 1, // Current user ID
      receiver_id: receiver_id,
      sender_name: "Test User",
      created_at: new Date().toISOString(),
      is_read: false
    }

    // Add to mock messages
    if (!mockMessages[match_id as keyof typeof mockMessages]) {
      mockMessages[match_id as keyof typeof mockMessages] = []
    }
    mockMessages[match_id as keyof typeof mockMessages].push(newMessage)

    // Store for real-time updates
    newMessages.push(newMessage)

    console.log(`New message sent in match ${match_id}: "${message}" (subscription: ${userSubscription})`)

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

// Mock function to get user subscription
// In production, this would query your database
function getUserSubscription(userId: number): string {
  // For demo purposes, return 'free' for user ID 1, 'premium' for others
  // In real app, you'd query the database
  const mockSubscriptions = {
    1: 'free',    // Test user is on free plan
    2: 'premium', // Other users have premium
    3: 'premium',
    4: 'premium_plus'
  }

  return mockSubscriptions[userId as keyof typeof mockSubscriptions] || 'free'
}


