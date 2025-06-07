import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // days

    // Get basic stats
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_active_users,
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days') as new_users,
        (SELECT COUNT(*) FROM matches WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days') as new_matches,
        (SELECT COUNT(*) FROM messages WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days') as new_messages,
        (SELECT COUNT(*) FROM swipes WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days') as total_swipes,
        (SELECT COUNT(*) FROM swipes WHERE is_like = true AND created_at >= CURRENT_DATE - INTERVAL '${period} days') as total_likes,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending') as pending_reports,
        (SELECT COUNT(*) FROM users WHERE subscription_type IN ('gold', 'platinum')) as premium_users
    `)

    // Get daily activity for the period
    const dailyActivityResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)

    // Get subscription breakdown
    const subscriptionResult = await pool.query(`
      SELECT 
        subscription_type,
        COUNT(*) as count
      FROM users 
      WHERE is_active = true
      GROUP BY subscription_type
    `)

    // Get top locations
    const locationsResult = await pool.query(`
      SELECT 
        location,
        COUNT(*) as user_count
      FROM users 
      WHERE location IS NOT NULL AND is_active = true
      GROUP BY location
      ORDER BY user_count DESC
      LIMIT 10
    `)

    // Get age distribution
    const ageDistributionResult = await pool.query(`
      SELECT 
        CASE 
          WHEN age < 25 THEN '18-24'
          WHEN age < 35 THEN '25-34'
          WHEN age < 45 THEN '35-44'
          WHEN age < 55 THEN '45-54'
          ELSE '55+'
        END as age_group,
        COUNT(*) as count
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.is_active = true AND p.age IS NOT NULL
      GROUP BY age_group
      ORDER BY count DESC
    `)

    return NextResponse.json({
      stats: statsResult.rows[0],
      dailyActivity: dailyActivityResult.rows,
      subscriptions: subscriptionResult.rows,
      topLocations: locationsResult.rows,
      ageDistribution: ageDistributionResult.rows,
    })
  } catch (error) {
    console.error("Admin analytics error:", error)
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
