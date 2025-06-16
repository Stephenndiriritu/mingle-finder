import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// GET /api/users/search - Search for users to start conversations with
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ 
        users: [],
        message: "Search query must be at least 2 characters long"
      })
    }

    // Search users by name, first name, or last name
    const searchQuery = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.last_active,
        p.first_name,
        p.last_name,
        p.profile_picture_url,
        p.location,
        p.age,
        -- Check if user is online (active within last 15 minutes)
        CASE 
          WHEN u.last_active > NOW() - INTERVAL '15 minutes' THEN true 
          ELSE false 
        END as is_online
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id != $1  -- Exclude current user
        AND (
          LOWER(u.name) LIKE LOWER($2) OR
          LOWER(p.first_name) LIKE LOWER($2) OR
          LOWER(p.last_name) LIKE LOWER($2) OR
          LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER($2)
        )
        AND u.is_active = true  -- Only active users
      ORDER BY 
        -- Prioritize online users
        is_online DESC,
        -- Then by last active time
        u.last_active DESC NULLS LAST,
        -- Then by name similarity (exact matches first)
        CASE 
          WHEN LOWER(u.name) = LOWER($3) THEN 1
          WHEN LOWER(p.first_name) = LOWER($3) THEN 2
          WHEN LOWER(u.name) LIKE LOWER($4) THEN 3
          WHEN LOWER(p.first_name) LIKE LOWER($4) THEN 4
          ELSE 5
        END,
        u.name
      LIMIT $5 OFFSET $6
    `

    const searchTerm = `%${query.trim()}%`
    const exactTerm = query.trim()
    const startsTerm = `${query.trim()}%`

    const result = await pool.query(searchQuery, [
      user.id,
      searchTerm,
      exactTerm,
      startsTerm,
      limit,
      offset
    ])

    const users = result.rows.map(row => ({
      id: row.id,
      name: row.first_name 
        ? `${row.first_name} ${row.last_name || ''}`.trim()
        : row.name,
      photo: row.profile_picture_url || "/placeholder.svg?height=400&width=400",
      location: row.location,
      age: row.age,
      isOnline: row.is_online,
      lastActive: row.last_active
    }))

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id != $1
        AND (
          LOWER(u.name) LIKE LOWER($2) OR
          LOWER(p.first_name) LIKE LOWER($2) OR
          LOWER(p.last_name) LIKE LOWER($2) OR
          LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER($2)
        )
        AND u.is_active = true
    `

    const countResult = await pool.query(countQuery, [user.id, searchTerm])
    const total = parseInt(countResult.rows[0].total)

    return NextResponse.json({
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + users.length < total
      }
    })

  } catch (error) {
    console.error("Failed to search users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
