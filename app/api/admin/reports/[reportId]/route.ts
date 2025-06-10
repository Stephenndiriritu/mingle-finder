import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

interface RouteParams {
  params: Promise<{
    reportId: string
  }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // TODO: Add proper admin authentication check
    // const admin = await requireAdmin(request)
    const { reportId: reportIdParam } = await params
    const reportId = Number.parseInt(reportIdParam)

    if (isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid report ID" }, { status: 400 })
    }

    const { status, adminNotes, action } = await request.json()

    if (!status || !["pending", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update report
    const updateResult = await pool.query(
      `UPDATE reports SET 
        status = $2,
        admin_notes = COALESCE($3, admin_notes),
        resolved_by = $4,
        resolved_at = CASE WHEN $2 IN ('resolved', 'dismissed') THEN CURRENT_TIMESTAMP ELSE resolved_at END
       WHERE id = $1
       RETURNING *`,
      [reportId, status, adminNotes, admin.id],
    )

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const report = updateResult.rows[0]

    // Take action on reported user if specified
    if (action && status === "resolved") {
      switch (action) {
        case "warn":
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, $2, $3, $4)`,
            [
              report.reported_id,
              "warning",
              "Account Warning",
              "Your account has received a warning due to reported behavior. Please review our community guidelines.",
            ],
          )
          break

        case "suspend":
          await pool.query("UPDATE users SET is_active = false WHERE id = $1", [report.reported_id])
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, $2, $3, $4)`,
            [
              report.reported_id,
              "suspension",
              "Account Suspended",
              "Your account has been suspended due to violations of our community guidelines.",
            ],
          )
          break

        case "ban":
          await pool.query("UPDATE users SET is_active = false WHERE id = $1", [report.reported_id])
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message)
             VALUES ($1, $2, $3, $4)`,
            [
              report.reported_id,
              "ban",
              "Account Banned",
              "Your account has been permanently banned due to serious violations of our community guidelines.",
            ],
          )
          break
      }

      // Log admin action
      await pool.query(
        `INSERT INTO user_activities (user_id, activity_type, activity_data)
         VALUES ($1, $2, $3)`,
        [
          report.reported_id,
          "admin_action",
          JSON.stringify({
            action,
            report_id: reportId,
            admin_id: admin.id,
            admin_email: admin.email,
            reason: report.reason,
            notes: adminNotes,
          }),
        ],
      )
    }

    return NextResponse.json({
      message: "Report updated successfully",
      report: updateResult.rows[0],
    })
  } catch (error) {
    console.error("Admin update report error:", error)
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
