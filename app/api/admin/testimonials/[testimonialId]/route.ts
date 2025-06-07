import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { testimonialId: string } }) {
  try {
    const admin = requireAdmin(request)
    const testimonialId = Number.parseInt(params.testimonialId)

    if (isNaN(testimonialId)) {
      return NextResponse.json({ error: "Invalid testimonial ID" }, { status: 400 })
    }

    const { is_approved } = await request.json()

    // Update testimonial
    const updateResult = await pool.query(
      `UPDATE testimonials SET 
        is_approved = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [testimonialId, is_approved],
    )

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    const testimonial = updateResult.rows[0]

    // Notify user about testimonial status
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)`,
      [
        testimonial.user_id,
        is_approved ? "testimonial_approved" : "testimonial_rejected",
        is_approved ? "Testimonial Approved" : "Testimonial Not Approved",
        is_approved
          ? "Your testimonial has been approved and is now visible on our platform."
          : "Your testimonial was not approved. Please review our guidelines and submit a new one.",
      ],
    )

    // Log admin action
    await pool.query(
      `INSERT INTO user_activities (user_id, activity_type, activity_data)
       VALUES ($1, $2, $3)`,
      [
        admin.id,
        "admin_testimonial_action",
        JSON.stringify({
          testimonial_id: testimonialId,
          action: is_approved ? "approve" : "reject",
          admin_id: admin.id,
          admin_email: admin.email,
        }),
      ],
    )

    return NextResponse.json({
      message: "Testimonial updated successfully",
      testimonial: updateResult.rows[0],
    })
  } catch (error) {
    console.error("Admin update testimonial error:", error)
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 