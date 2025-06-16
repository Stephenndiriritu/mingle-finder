import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request as any)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { swipedUserId, isLike, isSuperLike } = await request.json()

    if (!swipedUserId) {
      return NextResponse.json(
        { error: "Missing swipedUserId" },
        { status: 400 }
      )
    }

    // Check if user has already swiped on this person
    const existingSwipe = await pool.query(
      'SELECT id FROM swipes WHERE swiper_id = $1 AND swiped_id = $2',
      [user.id, swipedUserId]
    )

    if (existingSwipe.rows.length > 0) {
      return NextResponse.json(
        { error: "Already swiped on this user" },
        { status: 400 }
      )
    }

    // Record the swipe
    await pool.query(
      'INSERT INTO swipes (swiper_id, swiped_id, is_like) VALUES ($1, $2, $3)',
      [user.id, swipedUserId, isLike]
    )

    let isMatch = false
    let matchId = null

    if (isLike) {
      // Check if the other user has also liked this user
      const mutualLike = await pool.query(
        'SELECT id FROM swipes WHERE swiper_id = $1 AND swiped_id = $2 AND is_like = true',
        [swipedUserId, user.id]
      )

      if (mutualLike.rows.length > 0) {
        // It's a match! Create match record
        const matchResult = await pool.query(
          'INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) RETURNING id',
          [user.id, swipedUserId]
        )

        isMatch = true
        matchId = matchResult.rows[0].id

        // Create notifications for both users
        await pool.query(
          'INSERT INTO notifications (user_id, type, content) VALUES ($1, $2, $3), ($4, $5, $6)',
          [
            user.id, 'match', `You have a new match!`,
            swipedUserId, 'match', `You have a new match!`
          ]
        )

        console.log(`MATCH created between ${user.id} and ${swipedUserId}`)
      }
    }

    console.log(`Swipe processed: ${isLike ? 'LIKE' : 'PASS'} on user ${swipedUserId}${isSuperLike ? ' (SUPER LIKE)' : ''}${isMatch ? ' - MATCH!' : ''}`)

    return NextResponse.json({
      success: true,
      isMatch,
      matchId,
      message: isMatch ? "It's a match!" : "Swipe recorded"
    })
  } catch (error) {
    console.error("Failed to process swipe:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
