import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const subscription = searchParams.get("subscription") || "all"

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (status !== "all") {
      whereClause += ` AND u.is_active = $${paramIndex}`
      queryParams.push(status === "active")
      paramIndex++
    }

    if (subscription !== "all") {
      whereClause += ` AND u.subscription_type = $${paramIndex}`
      queryParams.push(subscription)
      paramIndex++
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM users u ${whereClause}`, queryParams)
    const totalUsers = Number.parseInt(countResult.rows[0].count)

    // Get users with pagination
    const usersResult = await pool.query(
      `SELECT 
        u.id, u.email, u.name, u.date_of_birth, u.gender, u.location,
        u.is_active, u.is_admin, u.is_verified, u.subscription_type,
        u.subscription_expires_at, u.last_active, u.created_at,
        p.profile_completion_percentage,
        (SELECT COUNT(*) FROM swipes WHERE swiper_id = u.id) as total_swipes,
        (SELECT COUNT(*) FROM matches WHERE user1_id = u.id OR user2_id = u.id) as total_matches,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) as total_messages
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset],
    )

    return NextResponse.json({
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    })
  } catch (error) {
    console.error("Admin get users error:", error)
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
