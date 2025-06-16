import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await pool.query(
      `SELECT id, device_name, ip_address, last_active, created_at
       FROM user_sessions
       WHERE user_id = $1
       ORDER BY last_active DESC`,
      [user.id]
    )

    return NextResponse.json({ sessions: result.rows })
  } catch (error) {
    console.error("Failed to fetch sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Verify session belongs to user
    const result = await pool.query(
      "SELECT id FROM user_sessions WHERE id = $1 AND user_id = $2",
      [sessionId, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Delete session
    await pool.query(
      "DELETE FROM user_sessions WHERE id = $1",
      [sessionId]
    )

    return NextResponse.json({ message: "Session terminated successfully" })
  } catch (error) {
    console.error("Failed to terminate session:", error)
    return NextResponse.json(
      { error: "Failed to terminate session" },
      { status: 500 }
    )
  }
}

// Terminate all other sessions
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentSessionId = request.cookies.get("session-id")?.value

    await pool.query(
      "DELETE FROM user_sessions WHERE user_id = $1 AND id != $2",
      [user.id, currentSessionId]
    )

    return NextResponse.json({ message: "All other sessions terminated successfully" })
  } catch (error) {
    console.error("Failed to terminate other sessions:", error)
    return NextResponse.json(
      { error: "Failed to terminate other sessions" },
      { status: 500 }
    )
  }
} 