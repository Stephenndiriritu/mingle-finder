import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { blockedUserId, reason } = await request.json()

    if (!blockedUserId) {
      return NextResponse.json({ error: "Blocked user ID is required" }, { status: 400 })
    }

    // Check if already blocked
    const existingBlock = await pool.query("SELECT id FROM blocks WHERE blocker_id = $1 AND blocked_id = $2", [
      user.id,
      blockedUserId,
    ])

    if (existingBlock.rows.length > 0) {
      return NextResponse.json({ error: "User is already blocked" }, { status: 409 })
    }

    // Create block
    await pool.query("INSERT INTO blocks (blocker_id, blocked_id, reason) VALUES ($1, $2, $3)", [
      user.id,
      blockedUserId,
      reason,
    ])

    // Remove any existing matches
    await pool.query(
      "UPDATE matches SET is_active = false WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)",
      [user.id, blockedUserId],
    )

    return NextResponse.json({ message: "User blocked successfully" })
  } catch (error) {
    console.error("Block user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const blockedUsersResult = await pool.query(
      `SELECT b.id, b.reason, b.created_at, u.name, u.email
       FROM blocks b
       JOIN users u ON b.blocked_id = u.id
       WHERE b.blocker_id = $1
       ORDER BY b.created_at DESC`,
      [user.id],
    )

    return NextResponse.json({ blockedUsers: blockedUsersResult.rows })
  } catch (error) {
    console.error("Get blocked users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const blockedUserId = searchParams.get("blockedUserId")

    if (!blockedUserId) {
      return NextResponse.json({ error: "Blocked user ID is required" }, { status: 400 })
    }

    await pool.query("DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2", [
      user.id,
      Number.parseInt(blockedUserId),
    ])

    return NextResponse.json({ message: "User unblocked successfully" })
  } catch (error) {
    console.error("Unblock user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
