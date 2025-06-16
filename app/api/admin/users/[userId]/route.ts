import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Check admin authentication
    const admin = await getUserFromRequest(request)
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 })
    }

    const { userId: userIdParam } = await params
    const userId = Number.parseInt(userIdParam)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Get user details with profile and activity data
    const userResult = await pool.query(
      `SELECT 
        u.id, u.email, u.name, u.birthdate, u.gender, u.location,
        u.latitude, u.longitude, u.is_active, u.is_admin, u.is_verified,
        u.subscription_type, u.subscription_expires_at, u.last_active, u.created_at,
        p.bio, p.interests, p.photos, p.age, p.height, p.weight, p.occupation,
        p.education, p.looking_for, p.relationship_type, p.max_distance,
        p.age_min, p.age_max, p.show_me, p.smoking, p.drinking, p.children,
        p.religion, p.political_views, p.languages, p.hobbies,
        p.profile_completion_percentage, p.verification_status,
        (SELECT COUNT(*) FROM swipes WHERE swiper_id = u.id) as total_swipes,
        (SELECT COUNT(*) FROM swipes WHERE swiper_id = u.id AND is_like = true) as total_likes,
        (SELECT COUNT(*) FROM matches WHERE user1_id = u.id OR user2_id = u.id) as total_matches,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id) as total_messages,
        (SELECT COUNT(*) FROM reports WHERE reported_id = u.id) as reports_against,
        (SELECT COUNT(*) FROM reports WHERE reporter_id = u.id) as reports_made
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId],
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get recent activity
    const activityResult = await pool.query(
      `SELECT activity_type, activity_data, created_at
       FROM user_activities
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId],
    )

    // Get recent reports
    const reportsResult = await pool.query(
      `SELECT r.id, r.reason, r.description, r.status, r.created_at,
              reporter.name as reporter_name, reporter.email as reporter_email
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       WHERE r.reported_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [userId],
    )

    return NextResponse.json({
      user: userResult.rows[0],
      recentActivity: activityResult.rows,
      recentReports: reportsResult.rows,
    })
  } catch (error) {
    console.error("Admin get user error:", error)
    if (error instanceof Error && (error.message === "Authentication required" || error.message === "Admin access required")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Check admin authentication
    const admin = await getUserFromRequest(request)
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 })
    }

    const { userId: userIdParam } = await params
    const userId = Number.parseInt(userIdParam)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { isActive, isVerified, subscriptionType, subscriptionExpiresAt, adminNotes } = await request.json()

    const updateResult = await pool.query(
      `UPDATE users SET 
        is_active = COALESCE($2, is_active),
        is_verified = COALESCE($3, is_verified),
        subscription_type = COALESCE($4, subscription_type),
        subscription_expires_at = COALESCE($5, subscription_expires_at),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [userId, isActive, isVerified, subscriptionType, subscriptionExpiresAt],
    )

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Log admin action
    await pool.query(
      `INSERT INTO user_activities (user_id, activity_type, activity_data)
       VALUES ($1, $2, $3)`,
      [
        userId,
        "admin_update",
        JSON.stringify({
          admin_id: admin.id,
          admin_email: admin.email,
          changes: { isActive, isVerified, subscriptionType, subscriptionExpiresAt },
          notes: adminNotes,
        }),
      ],
    )

    return NextResponse.json({
      message: "User updated successfully",
      user: updateResult.rows[0],
    })
  } catch (error) {
    console.error("Admin update user error:", error)
    if (error instanceof Error && (error.message === "Authentication required" || error.message === "Admin access required")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // Check admin authentication
    const admin = await getUserFromRequest(request)
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 })
    }

    const { userId: userIdParam } = await params
    const userId = Number.parseInt(userIdParam)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Prevent admin from deleting themselves
    if (userId.toString() === admin.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user (cascade will handle related records)
    const deleteResult = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [userId])

    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Log admin action
    await pool.query(
      `INSERT INTO user_activities (user_id, activity_type, activity_data)
       VALUES ($1, $2, $3)`,
      [
        admin.id,
        "admin_delete_user",
        JSON.stringify({
          deleted_user_id: userId,
          deleted_user_email: deleteResult.rows[0].email,
          admin_id: admin.id,
          admin_email: admin.email,
        }),
      ],
    )

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Admin delete user error:", error)
    if (error instanceof Error && (error.message === "Authentication required" || error.message === "Admin access required")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
