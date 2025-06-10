import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable admin auth check when authentication is stable
    // const admin = requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const subscription = searchParams.get("subscription") || "all"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

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

    // Validate sort parameters
    const allowedSortColumns = ['name', 'email', 'created_at', 'last_active_at', 'subscription_type']
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM users u ${whereClause}`, queryParams)
    const totalUsers = Number.parseInt(countResult.rows[0].count)

    // Get users with basic data - simplified to avoid schema issues
    const usersResult = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.birthdate,
        u.gender,
        u.location,
        u.subscription_type,
        u.is_verified,
        u.is_admin,
        u.created_at,
        u.last_active,
        EXTRACT(YEAR FROM AGE(u.birthdate)) as age
       FROM users u
       ${whereClause}
       ORDER BY u.${validSortBy} ${validSortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset],
    )

    // Process the results
    const users = usersResult.rows.map(user => ({
      ...user,
      age: user.age ? parseInt(user.age) : null,
      total_swipes: 0, // Will be calculated separately if needed
      total_matches: 0, // Will be calculated separately if needed
      total_messages: 0, // Will be calculated separately if needed
      profile_completion_percentage: 0 // Will be calculated separately if needed
    }))

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1
      },
      filters: {
        search,
        status,
        subscription,
        sortBy: validSortBy,
        sortOrder: validSortOrder
      }
    })
  } catch (error) {
    console.error("Admin get users error:", error)
    return NextResponse.json({
      error: "Failed to fetch users",
      users: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, action, data } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    let query = ''
    let params: any[] = []

    switch (action) {
      case 'activate':
        query = 'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1'
        params = [userId]
        break

      case 'deactivate':
        query = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1'
        params = [userId]
        break

      case 'verify':
        query = 'UPDATE users SET is_verified = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1'
        params = [userId]
        break

      case 'unverify':
        query = 'UPDATE users SET is_verified = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1'
        params = [userId]
        break

      case 'update_subscription':
        if (!data?.subscription_type) {
          return NextResponse.json(
            { error: 'Subscription type is required' },
            { status: 400 }
          )
        }
        query = 'UPDATE users SET subscription_type = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2'
        params = [data.subscription_type, userId]
        break

      case 'make_admin':
        query = 'UPDATE users SET is_admin = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1'
        params = [userId]
        break

      case 'remove_admin':
        query = 'UPDATE users SET is_admin = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1'
        params = [userId]
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const result = await pool.query(query, params)

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`Admin action performed: ${action} on user ${userId}`)

    return NextResponse.json({
      success: true,
      message: `User ${action} successful`,
      userId
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Soft delete - just deactivate the user
    const query = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1'
    const result = await pool.query(query, [userId])

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`User ${userId} soft deleted by admin`)

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully',
      userId
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
