import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable admin auth check when authentication is stable
    // const admin = requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || "all"
    const type = searchParams.get("type") || "all"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (status !== "all") {
      whereClause += ` AND r.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    if (type !== "all") {
      whereClause += ` AND r.report_type = $${paramIndex}`
      queryParams.push(type)
      paramIndex++
    }

    // Validate sort parameters
    const allowedSortColumns = ['created_at', 'status', 'report_type']
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) FROM reports r ${whereClause}`, queryParams)
    const totalReports = Number.parseInt(countResult.rows[0].count || '0')

    // Get summary statistics
    const statsQuery = `
      SELECT
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
        COUNT(CASE WHEN status = 'dismissed' THEN 1 END) as dismissed_reports,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as reports_24h,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as reports_7d
      FROM reports
    `

    // Get reports with pagination - simplified to avoid schema issues
    const reportsResult = await pool.query(
      `SELECT
        r.id,
        COALESCE(r.reason, 'No reason provided') as reason,
        COALESCE(r.description, '') as description,
        COALESCE(r.status, 'pending') as status,
        r.created_at,
        reporter.id as reporter_id,
        COALESCE(reporter.name, 'Unknown User') as reporter_name,
        COALESCE(reporter.email, 'unknown@example.com') as reporter_email,
        reported.id as reported_id,
        COALESCE(reported.name, 'Unknown User') as reported_name,
        COALESCE(reported.email, 'unknown@example.com') as reported_email
       FROM reports r
       LEFT JOIN users reporter ON r.reporter_id = reporter.id
       LEFT JOIN users reported ON r.reported_id = reported.id
       ${whereClause}
       ORDER BY
         CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
         r.${validSortBy} ${validSortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset],
    )

    const [statsResult] = await Promise.all([
      pool.query(statsQuery)
    ])

    const stats = statsResult.rows[0] || {}

    return NextResponse.json({
      reports: reportsResult.rows,
      pagination: {
        page,
        limit,
        total: totalReports,
        totalPages: Math.ceil(totalReports / limit),
        hasNext: page < Math.ceil(totalReports / limit),
        hasPrev: page > 1
      },
      stats: {
        totalReports: parseInt(stats.total_reports || '0'),
        pendingReports: parseInt(stats.pending_reports || '0'),
        resolvedReports: parseInt(stats.resolved_reports || '0'),
        dismissedReports: parseInt(stats.dismissed_reports || '0'),
        reports24h: parseInt(stats.reports_24h || '0'),
        reports7d: parseInt(stats.reports_7d || '0')
      },
      filters: {
        status,
        type,
        sortBy: validSortBy,
        sortOrder: validSortOrder
      }
    })
  } catch (error) {
    console.error("Admin get reports error:", error)
    return NextResponse.json({
      error: "Failed to fetch reports",
      reports: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      stats: { totalReports: 0, pendingReports: 0, resolvedReports: 0, dismissedReports: 0, reports24h: 0, reports7d: 0 }
    }, { status: 500 })
  }
}
