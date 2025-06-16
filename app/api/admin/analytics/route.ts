import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    console.log('Fetching real-time admin analytics from database...')

    // First, check what tables exist
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `

    let availableTables = []
    try {
      const tablesResult = await pool.query(tablesQuery)
      availableTables = tablesResult.rows.map(row => row.table_name)
      console.log('Available tables:', availableTables)
    } catch (error) {
      console.error('Error checking tables:', error)
    }

    // Check what columns exist in users table
    let userColumns = []
    try {
      const columnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users' AND table_schema = 'public'
      `
      const columnsResult = await pool.query(columnsQuery)
      userColumns = columnsResult.rows.map(row => row.column_name)
      console.log('User table columns:', userColumns)
    } catch (error) {
      console.error('Error checking user columns:', error)
    }

    // Get subscription breakdown
    const subscriptionQuery = `
      SELECT
        subscription_type,
        COUNT(*) as count
      FROM users
      GROUP BY subscription_type
      ORDER BY count DESC
    `

    // Get daily user registrations for the last 30 days
    const dailyActivityQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `

    // Get total matches
    const matchStatsQuery = `
      SELECT
        COUNT(*) as total_matches,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as matches_24h,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as matches_7d
      FROM matches
    `

    // Get message statistics
    const messageStatsQuery = `
      SELECT
        COUNT(*) as total_messages,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as messages_24h,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as messages_7d
      FROM messages
    `

    // Get top locations
    const locationQuery = `
      SELECT
        location,
        COUNT(*) as user_count
      FROM users
      WHERE location IS NOT NULL
        AND location != ''
      GROUP BY location
      ORDER BY user_count DESC
      LIMIT 10
    `

    // Get age distribution - simplified to avoid schema issues
    const ageDistributionQuery = `
      SELECT
        '18-24' as age_group,
        COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(birthdate)) BETWEEN 18 AND 24 THEN 1 END) as count
      FROM users
      WHERE birthdate IS NOT NULL
      UNION ALL
      SELECT
        '25-29' as age_group,
        COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(birthdate)) BETWEEN 25 AND 29 THEN 1 END) as count
      FROM users
      WHERE birthdate IS NOT NULL
      UNION ALL
      SELECT
        '30-34' as age_group,
        COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(birthdate)) BETWEEN 30 AND 34 THEN 1 END) as count
      FROM users
      WHERE birthdate IS NOT NULL
      UNION ALL
      SELECT
        '35-39' as age_group,
        COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(birthdate)) BETWEEN 35 AND 39 THEN 1 END) as count
      FROM users
      WHERE birthdate IS NOT NULL
      UNION ALL
      SELECT
        '40-44' as age_group,
        COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(birthdate)) BETWEEN 40 AND 44 THEN 1 END) as count
      FROM users
      WHERE birthdate IS NOT NULL
      UNION ALL
      SELECT
        '45+' as age_group,
        COUNT(CASE WHEN EXTRACT(YEAR FROM AGE(birthdate)) >= 45 THEN 1 END) as count
      FROM users
      WHERE birthdate IS NOT NULL
      ORDER BY
        CASE age_group
          WHEN '18-24' THEN 1
          WHEN '25-29' THEN 2
          WHEN '30-34' THEN 3
          WHEN '35-39' THEN 4
          WHEN '40-44' THEN 5
          WHEN '45+' THEN 6
        END
    `

    // Execute queries with error handling based on available schema
    let userStats: any = { rows: [{ total_users: 0 }] }
    let subscriptions: any = { rows: [] }
    let dailyActivity: any = { rows: [] }
    let matchStats: any = { rows: [{ total_matches: 0 }] }
    let messageStats: any = { rows: [{ total_messages: 0 }] }
    let topLocations: any = { rows: [] }
    let ageDistribution: any = { rows: [] }

    // Get basic user count
    if (availableTables.includes('users')) {
      try {
        userStats = await pool.query(`SELECT COUNT(*) as total_users FROM users`)
        console.log('User stats fetched successfully')
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    }

    // Get subscription breakdown if possible
    if (availableTables.includes('users') && userColumns.includes('subscription_type')) {
      try {
        subscriptions = await pool.query(`
          SELECT subscription_type, COUNT(*) as count
          FROM users
          GROUP BY subscription_type
          ORDER BY count DESC
        `)
        console.log('Subscription stats fetched successfully')
      } catch (error) {
        console.error('Error fetching subscriptions:', error)
      }
    }

    // Get daily activity if possible
    if (availableTables.includes('users') && userColumns.includes('created_at')) {
      try {
        dailyActivity = await pool.query(`
          SELECT
            DATE(created_at) as date,
            COUNT(*) as new_users
          FROM users
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
          LIMIT 30
        `)
        console.log('Daily activity fetched successfully')
      } catch (error) {
        console.error('Error fetching daily activity:', error)
      }
    }

    // Get match stats if table exists
    if (availableTables.includes('matches')) {
      try {
        matchStats = await pool.query(`SELECT COUNT(*) as total_matches FROM matches`)
        console.log('Match stats fetched successfully')
      } catch (error) {
        console.error('Error fetching match stats:', error)
      }
    }

    // Get message stats if table exists
    if (availableTables.includes('messages')) {
      try {
        messageStats = await pool.query(`SELECT COUNT(*) as total_messages FROM messages`)
        console.log('Message stats fetched successfully')
      } catch (error) {
        console.error('Error fetching message stats:', error)
      }
    }

    // Get location stats if possible
    if (availableTables.includes('users') && userColumns.includes('location')) {
      try {
        topLocations = await pool.query(`
          SELECT location, COUNT(*) as user_count
          FROM users
          WHERE location IS NOT NULL AND location != ''
          GROUP BY location
          ORDER BY user_count DESC
          LIMIT 10
        `)
        console.log('Location stats fetched successfully')
      } catch (error) {
        console.error('Error fetching locations:', error)
      }
    }

    // Create mock age distribution for now
    ageDistribution = {
      rows: [
        { age_group: '18-24', count: 0 },
        { age_group: '25-29', count: 0 },
        { age_group: '30-34', count: 0 },
        { age_group: '35-39', count: 0 },
        { age_group: '40-44', count: 0 },
        { age_group: '45+', count: 0 }
      ]
    }

    const analytics = {
      // Basic statistics
      totalUsers: parseInt(String(userStats.rows[0]?.total_users || '0')),
      activeUsers: parseInt(String(userStats.rows[0]?.active_users_24h || '0')),
      activeUsers7d: parseInt(String(userStats.rows[0]?.active_users_7d || '0')),
      premiumUsers: parseInt(String(userStats.rows[0]?.premium_users || '0')),
      verifiedUsers: parseInt(String(userStats.rows[0]?.verified_users || '0')),
      newUsers30d: parseInt(String(userStats.rows[0]?.new_users_30d || '0')),

      // Match statistics
      totalMatches: parseInt(String(matchStats.rows[0]?.total_matches || '0')),
      matches24h: parseInt(String(matchStats.rows[0]?.matches_24h || '0')),
      matches7d: parseInt(String(matchStats.rows[0]?.matches_7d || '0')),

      // Message statistics
      totalMessages: parseInt(String(messageStats.rows[0]?.total_messages || '0')),
      messages24h: parseInt(String(messageStats.rows[0]?.messages_24h || '0')),
      messages7d: parseInt(String(messageStats.rows[0]?.messages_7d || '0')),

      // Detailed breakdowns
      subscriptions: subscriptions.rows || [],
      dailyActivity: (dailyActivity.rows || []).reverse(), // Show oldest to newest
      topLocations: topLocations.rows || [],
      ageDistribution: ageDistribution.rows || [],

      // Calculated metrics
      conversionRate: '0', // Will calculate when we have proper data
      verificationRate: '0', // Will calculate when we have proper data

      // Timestamp for real-time updates
      lastUpdated: new Date().toISOString(),

      // Status
      status: 'connected'
    }

    console.log('Analytics fetched successfully:', {
      totalUsers: analytics.totalUsers,
      activeUsers: analytics.activeUsers,
      totalMatches: analytics.totalMatches
    })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching admin analytics:', error)

    // Return fallback data if database is unavailable
    const fallbackAnalytics = {
      totalUsers: 0,
      activeUsers: 0,
      activeUsers7d: 0,
      premiumUsers: 0,
      verifiedUsers: 0,
      newUsers30d: 0,
      totalMatches: 0,
      matches24h: 0,
      matches7d: 0,
      totalMessages: 0,
      messages24h: 0,
      messages7d: 0,
      subscriptions: [],
      dailyActivity: [],
      topLocations: [],
      ageDistribution: [],
      conversionRate: '0',
      verificationRate: '0',
      lastUpdated: new Date().toISOString(),
      error: 'Database connection failed - showing fallback data'
    }

    return NextResponse.json(fallbackAnalytics)
  }
}
