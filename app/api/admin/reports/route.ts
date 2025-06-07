import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || "all"

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (status !== "all") {
      whereClause += ` AND r.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM reports r ${whereClause}`, queryParams)
    const totalReports = Number.parseInt(countResult.rows[0].count)

    // Get reports with pagination
    const reportsResult = await pool.query(
      `SELECT 
        r.id, r.reason, r.description, r.status, r.admin_notes, r.created_at, r.resolved_at,
        reporter.id as reporter_id, reporter.name as reporter_name, reporter.email as reporter_email,
        reported.id as reported_id, reported.name as reported_name, reported.email as reported_email,
        resolver.name as resolved_by_name
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       JOIN users reported ON r.reported_id = reported.id
       LEFT JOIN users resolver ON r.resolved_by = resolver.id
       ${whereClause}
       ORDER BY 
         CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
         r.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset],
    )

    return NextResponse.json({
      reports: reportsResult.rows,
      pagination: {
        page,
        limit,
        total: totalReports,
        totalPages: Math.ceil(totalReports / limit),
      },
    })
  } catch (error) {
    console.error("Admin get reports error:", error)
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
