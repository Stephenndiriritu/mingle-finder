import { NextResponse } from "next/server"

// Mock data for development - simulate swipes and matches
const mockSwipes = new Map()
let swipeCount = 0

export async function POST(request: Request) {
  try {
    const { swipedUserId, isLike, isSuperLike } = await request.json()

    if (!swipedUserId) {
      return NextResponse.json(
        { error: "Missing swipedUserId" },
        { status: 400 }
      )
    }

    // Simulate swipe processing
    swipeCount++
    const swipeKey = `swipe_${swipeCount}`
    mockSwipes.set(swipeKey, {
      swipedUserId,
      isLike,
      isSuperLike,
      timestamp: new Date()
    })

    // Simulate random match (20% chance for likes)
    const isMatch = isLike && Math.random() < 0.2

    // Generate a match ID if it's a match
    const matchId = isMatch ? `match_${Date.now()}_${swipedUserId}` : null

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
