import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportedUserId, reason, description } = await request.json()

    if (!reportedUserId || !reason) {
      return NextResponse.json({ error: "Reported user ID and reason are required" }, { status: 400 })
    }

    // Check if user has already reported this person
    const existingReport = await pool.query("SELECT id FROM reports WHERE reporter_id = $1 AND reported_id = $2", [
      user.id,
      reportedUserId,
    ])

    if (existingReport.rows.length > 0) {
      return NextResponse.json({ error: "You have already reported this user" }, { status: 409 })
    }

    // Create report
    const reportResult = await pool.query(
      `INSERT INTO reports (reporter_id, reported_id, reason, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.id, reportedUserId, reason, description],
    )

    // Create notification for admins
    const adminsResult = await pool.query("SELECT id FROM users WHERE is_admin = true")

    for (const admin of adminsResult.rows) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          admin.id,
          "admin_report",
          "New User Report",
          `A user has been reported for: ${reason}`,
          JSON.stringify({ report_id: reportResult.rows[0].id, reported_user_id: reportedUserId }),
        ],
      )
    }

    return NextResponse.json({
      message: "Report submitted successfully",
      report: reportResult.rows[0],
    })
  } catch (error) {
    console.error("Submit report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
