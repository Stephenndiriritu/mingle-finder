import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ testimonialId: string }> }) {
  try {
    // Check admin authentication
    const admin = await getUserFromRequest(request)
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 401 })
    }

    const { testimonialId } = await params

    if (!testimonialId || testimonialId.trim() === '') {
      return NextResponse.json({ error: "Invalid testimonial ID" }, { status: 400 })
    }

    console.log('Updating testimonial with ID:', testimonialId)

    const { is_approved, is_featured } = await request.json()

    console.log('Updating testimonial status:', { testimonialId, is_approved, is_featured })

    // Update testimonial
    let updateQuery = `UPDATE testimonials SET updated_at = CURRENT_TIMESTAMP`
    let updateParams = [testimonialId]
    let paramIndex = 2

    if (is_approved !== undefined) {
      updateQuery += `, is_approved = $${paramIndex}`
      updateParams.push(is_approved)
      paramIndex++
    }

    if (is_featured !== undefined) {
      updateQuery += `, is_featured = $${paramIndex}`
      updateParams.push(is_featured)
      paramIndex++
    }

    updateQuery += ` WHERE id = $1 RETURNING *`

    const updateResult = await pool.query(updateQuery, updateParams)

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    const testimonial = updateResult.rows[0]

    // Check notifications table schema first
    let notificationColumns = []
    try {
      const columnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'notifications' AND table_schema = 'public'
      `
      const columnsResult = await pool.query(columnsQuery)
      notificationColumns = columnsResult.rows.map(row => row.column_name)
      console.log('Notifications table columns:', notificationColumns)
    } catch (error) {
      console.error('Error checking notifications columns:', error)
    }

    // Notify user about testimonial status - adapt to available columns
    try {
      if (is_approved !== undefined && notificationColumns.includes('title')) {
        // Use title column if available
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES ($1, $2, $3, $4)`,
          [
            testimonial.user_id,
            is_approved ? "testimonial_approved" : "testimonial_unapproved",
            is_approved ? "Testimonial Approved" : "Testimonial Unapproved",
            is_approved
              ? "Your testimonial has been approved and is now visible on our platform."
              : "Your testimonial has been unapproved and is no longer visible on our platform.",
          ],
        )
      } else if (is_approved !== undefined) {
        // Use only available columns
        let insertColumns = 'user_id, type'
        let insertValues = '$1, $2'
        let insertParams = [
          testimonial.user_id,
          is_approved ? "testimonial_approved" : "testimonial_unapproved"
        ]

        if (notificationColumns.includes('message')) {
          insertColumns += ', message'
          insertValues += ', $3'
          insertParams.push(
            is_approved
              ? "Your testimonial has been approved and is now visible on our platform."
              : "Your testimonial has been unapproved and is no longer visible on our platform."
          )
        } else if (notificationColumns.includes('content')) {
          insertColumns += ', content'
          insertValues += ', $3'
          insertParams.push(
            is_approved
              ? "Your testimonial has been approved and is now visible on our platform."
              : "Your testimonial has been unapproved and is no longer visible on our platform."
          )
        }

        await pool.query(
          `INSERT INTO notifications (${insertColumns}) VALUES (${insertValues})`,
          insertParams
        )
      }
      console.log('Notification sent successfully')
    } catch (error) {
      console.error('Error sending notification:', error)
      // Don't fail the whole operation if notification fails
    }

    // Log admin action - check user_activities schema first
    try {
      const activitiesColumnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'user_activities' AND table_schema = 'public'
      `
      const activitiesColumnsResult = await pool.query(activitiesColumnsQuery)
      const activitiesColumns = activitiesColumnsResult.rows.map(row => row.column_name)
      console.log('User activities table columns:', activitiesColumns)

      if (activitiesColumns.includes('activity_data')) {
        await pool.query(
          `INSERT INTO user_activities (user_id, activity_type, activity_data)
           VALUES ($1, $2, $3)`,
          [
            admin.id,
            "admin_testimonial_action",
            JSON.stringify({
              testimonial_id: testimonialId,
              action: is_approved === true ? "approve" : is_approved === false ? "unapprove" : "update",
              is_approved,
              is_featured,
              admin_id: admin.id,
              admin_email: admin.email,
            }),
          ],
        )
      } else {
        // Use only available columns
        let activityColumns = 'user_id, activity_type'
        let activityValues = '$1, $2'
        // Use actual admin ID
        let activityParams = [admin.id, "admin_testimonial_action"]

        await pool.query(
          `INSERT INTO user_activities (${activityColumns}) VALUES (${activityValues})`,
          activityParams
        )
      }
      console.log('Admin action logged successfully')
    } catch (error) {
      console.error('Error logging admin action:', error)
      // Don't fail the whole operation if logging fails
    }

    return NextResponse.json({
      message: "Testimonial updated successfully",
      testimonial: updateResult.rows[0],
    })
  } catch (error) {
    console.error("Admin update testimonial error:", error)
    if (error instanceof Error && (error.message === "Authentication required" || error.message === "Admin access required")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 