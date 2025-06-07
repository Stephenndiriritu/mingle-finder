import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const filter = searchParams.get("filter") || "all"

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (filter !== "all") {
      whereClause += ` AND t.is_approved = $${paramIndex}`
      queryParams.push(filter === "approved")
      paramIndex++
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM testimonials t ${whereClause}`, queryParams)
    const totalTestimonials = Number.parseInt(countResult.rows[0].count)

    // Get testimonials with pagination
    const testimonialsResult = await pool.query(
      `SELECT 
        t.id, t.user_id, t.content, t.is_approved, t.created_at,
        u.name as user_name, u.email as user_email
       FROM testimonials t
       JOIN users u ON t.user_id = u.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset],
    )

    return NextResponse.json({
      testimonials: testimonialsResult.rows,
      pagination: {
        page,
        limit,
        total: totalTestimonials,
        totalPages: Math.ceil(totalTestimonials / limit),
      },
    })
  } catch (error) {
    console.error("Admin get testimonials error:", error)
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update testimonial status (approve/reject/feature)
export async function PATCH(req: NextRequest) {
  try {
    const user = requireAdmin(req)

    const { id, is_approved, is_featured } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE testimonials 
       SET is_approved = $1, 
           is_featured = $2, 
           approved_at = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE approved_at END,
           approved_by = CASE WHEN $1 = true THEN $3 ELSE approved_by END
       WHERE id = $4 
       RETURNING *`,
      [is_approved, is_featured, user.id, id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({ testimonial: result.rows[0] })
  } catch (error) {
    console.error("Failed to update testimonial:", error)
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
  }
}

// Delete testimonial
export async function DELETE(req: NextRequest) {
  try {
    const user = requireAdmin(req)

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 })
    }

    const result = await pool.query(
      "DELETE FROM testimonials WHERE id = $1 RETURNING *",
      [id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete testimonial:", error)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
} 