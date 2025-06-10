import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication check
    // const admin = requireAdmin(request)

    console.log('Fetching testimonials from database...')

    // First, check what columns exist in testimonials table
    const columnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'testimonials' AND table_schema = 'public'
    `

    let testimonialColumns = []
    try {
      const columnsResult = await pool.query(columnsQuery)
      testimonialColumns = columnsResult.rows.map(row => row.column_name)
      console.log('Testimonials table columns:', testimonialColumns)
    } catch (error) {
      console.error('Error checking testimonials columns:', error)
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const filter = searchParams.get("filter") || "all"

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (filter !== "all" && testimonialColumns.includes('is_approved')) {
      whereClause += ` AND t.is_approved = $${paramIndex}`
      queryParams.push(filter === "approved")
      paramIndex++
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM testimonials t ${whereClause}`, queryParams)
    const totalTestimonials = Number.parseInt(countResult.rows[0].count)

    // Build dynamic SELECT based on available columns
    let selectColumns = 't.id'
    if (testimonialColumns.includes('user_id')) selectColumns += ', t.user_id'
    if (testimonialColumns.includes('title')) selectColumns += ', t.title'
    if (testimonialColumns.includes('story')) selectColumns += ', t.story'
    if (testimonialColumns.includes('content')) selectColumns += ', t.content'
    if (testimonialColumns.includes('is_approved')) selectColumns += ', t.is_approved'
    if (testimonialColumns.includes('is_featured')) selectColumns += ', t.is_featured'
    if (testimonialColumns.includes('created_at')) selectColumns += ', t.created_at'
    selectColumns += ', u.name as user_name, u.email as user_email'

    // Get testimonials with pagination
    const testimonialsResult = await pool.query(
      `SELECT ${selectColumns}
       FROM testimonials t
       JOIN users u ON t.user_id = u.id
       ${whereClause}
       ORDER BY ${testimonialColumns.includes('created_at') ? 't.created_at' : 't.id'} DESC
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
    // TODO: Add proper admin authentication check
    // const user = requireAdmin(req)

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
      [is_approved, is_featured, 'admin', id]
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
    // TODO: Add proper admin authentication check
    // const user = requireAdmin(req)

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