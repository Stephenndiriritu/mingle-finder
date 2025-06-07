import { type NextRequest, NextResponse } from "next/server"
import pool, { withTransaction } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Mock data for development
const mockSwipes = new Map()
const mockMatches = new Map()

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { swipedUserId, isLike, isSuperLike = false } = await request.json()

    if (!swipedUserId || typeof isLike !== "boolean") {
      return NextResponse.json({ error: "Invalid swipe data" }, { status: 400 })
    }

    try {
      // Check if user has already swiped on this person
      const existingSwipe = await pool.query("SELECT id FROM swipes WHERE swiper_id = $1 AND swiped_id = $2", [
        user.id,
        swipedUserId,
      ])

      if (existingSwipe.rows.length > 0) {
        return NextResponse.json({ error: "Already swiped on this user" }, { status: 409 })
      }

      // Check daily limits for free users
      if (user.subscription_type === "free" || !user.subscription_type) {
        const today = new Date().toISOString().split("T")[0]
        const dailySwipes = await pool.query(
          "SELECT COUNT(*) FROM swipes WHERE swiper_id = $1 AND DATE(created_at) = $2 AND is_like = true",
          [user.id, today],
        )

        if (Number.parseInt(dailySwipes.rows[0].count) >= 10) {
          return NextResponse.json({ error: "Daily like limit reached" }, { status: 429 })
        }

        if (isSuperLike) {
          const dailySuperLikes = await pool.query(
            "SELECT COUNT(*) FROM swipes WHERE swiper_id = $1 AND DATE(created_at) = $2 AND is_super_like = true",
            [user.id, today],
          )

          if (Number.parseInt(dailySuperLikes.rows[0].count) >= 1) {
            return NextResponse.json({ error: "Daily super like limit reached" }, { status: 429 })
          }
        }
      }

      const result = await withTransaction(async (client) => {
        // Insert swipe
        const swipeResult = await client.query(
          "INSERT INTO swipes (swiper_id, swiped_id, is_like, is_super_like) VALUES ($1, $2, $3, $4) RETURNING *",
          [user.id, swipedUserId, isLike, isSuperLike],
        )

        let isMatch = false
        let matchId = null

        // Check for match if it's a like
        if (isLike) {
          const mutualLike = await client.query(
            "SELECT id FROM swipes WHERE swiper_id = $1 AND swiped_id = $2 AND is_like = true",
            [swipedUserId, user.id],
          )

          if (mutualLike.rows.length > 0) {
            // Create match
            const matchResult = await client.query(
              `INSERT INTO matches (user1_id, user2_id) 
               VALUES ($1, $2) 
               ON CONFLICT (user1_id, user2_id) DO NOTHING
               RETURNING id`,
              [Math.min(user.id, swipedUserId), Math.max(user.id, swipedUserId)],
            )

            if (matchResult.rows.length > 0) {
              isMatch = true
              matchId = matchResult.rows[0].id

              // Create notifications
              await client.query(
                `INSERT INTO notifications (user_id, type, title, message, data) 
                 VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
                [
                  user.id,
                  "match",
                  "New Match!",
                  "You have a new match!",
                  JSON.stringify({ match_user_id: swipedUserId, match_id: matchId }),
                  swipedUserId,
                  "match",
                  "New Match!",
                  "You have a new match!",
                  JSON.stringify({ match_user_id: user.id, match_id: matchId }),
                ],
              )
            }
          }
        }

        return { swipe: swipeResult.rows[0], isMatch, matchId }
      })

      return NextResponse.json({
        message: "Swipe recorded successfully",
        isMatch: result.isMatch,
        matchId: result.matchId,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        const swipeKey = `${user.id}-${swipedUserId}`
        
        // Check if already swiped
        if (mockSwipes.has(swipeKey)) {
          return NextResponse.json({ error: "Already swiped on this user" }, { status: 409 })
        }
        
        // Store swipe
        mockSwipes.set(swipeKey, { isLike, isSuperLike, timestamp: new Date() })
        
        // Check for match (50% chance in development)
        let isMatch = false
        let matchId = null
        
        if (isLike && Math.random() > 0.5) {
          isMatch = true
          matchId = Date.now()
          mockMatches.set(matchId, { user1_id: user.id, user2_id: swipedUserId })
        }
        
        return NextResponse.json({
          message: "Swipe recorded successfully (mock)",
          isMatch,
          matchId,
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Swipe error:", error)
    return NextResponse.json({ 
      error: "Failed to process swipe. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}
