import pool from "@/lib/db"

export async function getBasicStats(period: string) {
  const result = await pool.query(`
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
  return result.rows[0]
}

export async function getDailyActivity(period: string) {
  const result = await pool.query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_users
    FROM users 
    WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `)
  return result.rows
}

export async function getSubscriptionBreakdown() {
  const result = await pool.query(`
    SELECT 
      subscription_type,
      COUNT(*) as count
    FROM users 
    WHERE is_active = true
    GROUP BY subscription_type
  `)
  return result.rows
}

export async function getTopLocations() {
  const result = await pool.query(`
    SELECT 
      location,
      COUNT(*) as user_count
    FROM users 
    WHERE location IS NOT NULL AND is_active = true
    GROUP BY location
    ORDER BY user_count DESC
    LIMIT 10
  `)
  return result.rows
}

export async function getAgeDistribution() {
  const result = await pool.query(`
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
  return result.rows
} 