import { NextRequest, NextResponse } from "next/server"

// Mock chat data for individual conversations
const mockChatData = {
  "1": {
    recipientId: 2,
    recipientName: "Sarah Johnson",
    recipientPhoto: "/placeholder.svg?height=400&width=400",
    isOnline: true,
    lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 1,
        message: "Hey! How are you?",
        sender_id: 2,
        receiver_id: 1,
        sender_name: "Sarah Johnson",
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        is_read: true
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
        is_read: true
      }
    ]
  },
  "2": {
    recipientId: 3,
    recipientName: "Michael Chen",
    recipientPhoto: "/placeholder.svg?height=400&width=400",
    isOnline: false,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    messages: [
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
    ]
  },
  "3": {
    recipientId: 4,
    recipientName: "Emily Davis",
    recipientPhoto: "/placeholder.svg?height=400&width=400",
    isOnline: true,
    lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    messages: []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params

    // Return mock chat data
    let chatData = mockChatData[matchId as keyof typeof mockChatData]

    // If no existing chat data, create new chat for new matches
    if (!chatData) {
      // Check if this is a new match from discover page
      if (matchId.startsWith('match_')) {
        // Extract user ID from match ID (format: match_timestamp_userId)
        const parts = matchId.split('_')
        const userId = parts[parts.length - 1]

        // Create new chat data for the new match
        // In a real app, you'd fetch the user's actual data from the database
        const userNames = {
          '1': 'Alex Johnson',
          '2': 'Sarah Wilson',
          '3': 'Mike Chen',
          '4': 'Emma Davis',
          '5': 'Chris Taylor'
        }

        chatData = {
          recipientId: parseInt(userId) || 5,
          recipientName: userNames[userId as keyof typeof userNames] || "New Match",
          recipientPhoto: "/placeholder.svg?height=400&width=400",
          isOnline: true,
          lastActive: new Date().toISOString(),
          messages: []
        }
      } else {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 })
      }
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
