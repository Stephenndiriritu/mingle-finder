import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Mock messages for development
const mockMessages = new Map()

// Initialize with some mock conversations
mockMessages.set("1", [
  {
    id: 1,
    content: "Hey! How are you?",
    sender_id: 2,
    receiver_id: 1,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_read: true
  },
  {
    id: 2,
    content: "I'm good, thanks! How about you?",
    sender_id: 1,
    receiver_id: 2,
    created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    is_read: true
  },
  {
    id: 3,
    content: "Would you like to meet for coffee sometime?",
    sender_id: 2,
    receiver_id: 1,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    is_read: false
  }
])

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("match_id")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const before = searchParams.get("before")

    if (!matchId) {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 })
    }

    try {
      let query = `
        SELECT m.id, m.content, m.sender_id, m.receiver_id, m.created_at, m.is_read
        FROM messages m
        WHERE m.match_id = $1
      `
      const queryParams = [matchId]

      if (before) {
        query += " AND m.created_at < $2"
        queryParams.push(before)
      }

      query += " ORDER BY m.created_at DESC LIMIT $" + (queryParams.length + 1)
      queryParams.push(limit)

      const result = await pool.query(query, queryParams)

      // Mark messages as read
      if (result.rows.length > 0) {
        await pool.query(
          "UPDATE messages SET is_read = true WHERE receiver_id = $1 AND match_id = $2 AND is_read = false",
          [user.id, matchId]
        )
      }

      return NextResponse.json({ messages: result.rows.reverse() })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        const messages = mockMessages.get(matchId) || []
        let filteredMessages = [...messages]
        
        if (before) {
          filteredMessages = filteredMessages.filter(msg => new Date(msg.created_at) < new Date(before))
        }
        
        const paginatedMessages = filteredMessages.slice(-limit)
        
        // Mark mock messages as read
        mockMessages.set(
          matchId,
          messages.map(msg => 
            msg.receiver_id === user.id ? { ...msg, is_read: true } : msg
          )
        )
        
        return NextResponse.json({ 
          messages: paginatedMessages,
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch messages. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { matchId, content } = await request.json()

    if (!matchId || !content) {
      return NextResponse.json({ error: "Match ID and content are required" }, { status: 400 })
    }

    try {
      // Verify match exists and user is part of it
      const matchResult = await pool.query(
        "SELECT user1_id, user2_id FROM matches WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)",
        [matchId, user.id]
      )

      if (matchResult.rows.length === 0) {
        return NextResponse.json({ error: "Match not found or unauthorized" }, { status: 404 })
      }

      const receiverId = matchResult.rows[0].user1_id === user.id 
        ? matchResult.rows[0].user2_id 
        : matchResult.rows[0].user1_id

      const result = await pool.query(
        "INSERT INTO messages (match_id, sender_id, receiver_id, content) VALUES ($1, $2, $3, $4) RETURNING *",
        [matchId, user.id, receiverId, content]
      )

      return NextResponse.json({ message: result.rows[0] })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        const messages = mockMessages.get(matchId) || []
        const newMessage = {
          id: Date.now(),
          content,
          sender_id: user.id,
          receiver_id: 2, // Mock receiver ID
          created_at: new Date().toISOString(),
          is_read: false
        }
        
        messages.push(newMessage)
        mockMessages.set(matchId, messages)
        
        return NextResponse.json({ 
          message: newMessage,
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ 
      error: "Failed to send message. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 })
  }
}
