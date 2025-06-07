import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Mock matches for development
const mockMatches = [
  {
    match_id: 1,
    matched_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 2,
      name: "Sarah Johnson",
      photos: ["photo1.jpg"],
      last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      is_online: true
    },
    last_message: {
      id: 1,
      content: "Hey! How are you?",
      sent_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      is_read: false
    }
  },
  {
    match_id: 2,
    matched_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 3,
      name: "Michael Chen",
      photos: ["photo3.jpg"],
      last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_online: false
    },
    last_message: {
      id: 2,
      content: "Would you like to grab coffee sometime?",
      sent_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      is_read: true
    }
  },
  {
    match_id: 3,
    matched_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 4,
      name: "Emily Davis",
      photos: ["photo5.jpg"],
      last_active: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      is_online: true
    },
    last_message: null
  }
]

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    try {
      const matchesResult = await pool.query(
        `SELECT 
          m.id as match_id,
          m.created_at as matched_at,
          u.id,
          u.name,
          u.photos,
          u.last_active,
          (EXTRACT(EPOCH FROM (NOW() - u.last_active)) < 300) as is_online,
          (
            SELECT json_build_object(
              'id', msg.id,
              'content', msg.content,
              'sent_at', msg.created_at,
              'is_read', msg.is_read
            )
            FROM messages msg
            WHERE (msg.sender_id = u.id AND msg.receiver_id = $1)
               OR (msg.sender_id = $1 AND msg.receiver_id = u.id)
            ORDER BY msg.created_at DESC
            LIMIT 1
          ) as last_message
        FROM matches m
        JOIN users u ON (m.user1_id = u.id AND m.user2_id = $1)
                    OR (m.user2_id = u.id AND m.user1_id = $1)
        ORDER BY 
          COALESCE((
            SELECT created_at 
            FROM messages 
            WHERE (sender_id = u.id AND receiver_id = $1)
               OR (sender_id = $1 AND receiver_id = u.id)
            ORDER BY created_at DESC
            LIMIT 1
          ), m.created_at) DESC
        LIMIT $2 OFFSET $3`,
        [user.id, limit, offset]
      )

      return NextResponse.json({ matches: matchesResult.rows })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        const paginatedMatches = mockMatches.slice(offset, offset + limit)
        return NextResponse.json({ 
          matches: paginatedMatches,
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json({ 
      error: "Failed to fetch matches. Please try again later.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }, { status: 500 })
  }
}
