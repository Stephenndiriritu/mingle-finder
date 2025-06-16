import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request as any)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const withMessages = searchParams.get('with_messages') === 'true'

    if (withMessages) {
      // Format for messages page - includes last message and unread count
      const query = `
        SELECT
          m.id as match_id,
          m.created_at as matched_at,
          CASE
            WHEN m.user1_id = $1 THEN m.user2_id
            ELSE m.user1_id
          END as other_user_id,
          u.name,
          u.last_active,
          p.profile_picture_url,
          p.first_name,
          p.last_name,
          (
            SELECT content
            FROM messages msg
            WHERE msg.match_id = m.id
            ORDER BY msg.created_at DESC
            LIMIT 1
          ) as last_message_content,
          (
            SELECT created_at
            FROM messages msg
            WHERE msg.match_id = m.id
            ORDER BY msg.created_at DESC
            LIMIT 1
          ) as last_message_time,
          (
            SELECT sender_id
            FROM messages msg
            WHERE msg.match_id = m.id
            ORDER BY msg.created_at DESC
            LIMIT 1
          ) as last_message_sender,
          (
            SELECT COUNT(*)
            FROM messages msg
            WHERE msg.match_id = m.id
              AND msg.sender_id != $1
              AND msg.is_read = false
          ) as unread_count
        FROM matches m
        JOIN users u ON (
          CASE
            WHEN m.user1_id = $1 THEN m.user2_id
            ELSE m.user1_id
          END = u.id
        )
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE m.user1_id = $1 OR m.user2_id = $1
        ORDER BY
          CASE
            WHEN last_message_time IS NOT NULL THEN last_message_time
            ELSE m.created_at
          END DESC
      `

      const result = await pool.query(query, [user.id])

      const matches = result.rows.map(row => ({
        match_id: row.match_id,
        matched_at: row.matched_at,
        user: {
          id: row.other_user_id,
          name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : row.name,
          photos: row.profile_picture_url ? [row.profile_picture_url] : ["/placeholder.svg?height=400&width=400"],
          last_active: row.last_active,
          is_online: row.last_active && new Date(row.last_active) > new Date(Date.now() - 15 * 60 * 1000)
        },
        last_message: row.last_message_content ? {
          id: row.match_id,
          message: row.last_message_content,
          created_at: row.last_message_time,
          is_read: row.unread_count === 0,
          sender_id: row.last_message_sender
        } : null,
        unread_count: parseInt(row.unread_count) || 0
      }))

      return NextResponse.json({
        matches,
        success: true
      })
    } else {
      // Format for matches page - simpler format
      const query = `
        SELECT
          m.id,
          m.created_at as matched_at,
          CASE
            WHEN m.user1_id = $1 THEN m.user2_id
            ELSE m.user1_id
          END as other_user_id,
          u.name,
          u.last_active,
          u.location,
          p.profile_picture_url,
          p.first_name,
          p.last_name,
          p.birth_date,
          (
            SELECT COUNT(*)
            FROM messages msg
            WHERE msg.match_id = m.id
              AND msg.sender_id != $1
              AND msg.is_read = false
          ) as unread_count
        FROM matches m
        JOIN users u ON (
          CASE
            WHEN m.user1_id = $1 THEN m.user2_id
            ELSE m.user1_id
          END = u.id
        )
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE m.user1_id = $1 OR m.user2_id = $1
        ORDER BY m.created_at DESC
      `

      const result = await pool.query(query, [user.id])

      const matches = result.rows.map(row => ({
        id: row.id,
        userId: row.other_user_id,
        firstName: row.first_name || row.name?.split(' ')[0] || 'User',
        lastName: row.last_name || row.name?.split(' ')[1] || '',
        photos: row.profile_picture_url ? [row.profile_picture_url] : ["/placeholder.svg?height=400&width=400"],
        birthDate: row.birth_date,
        location: row.location || 'Location not specified',
        lastActive: row.last_active,
        unreadMessages: parseInt(row.unread_count) || 0
      }))

      return NextResponse.json({
        matches,
        success: true
      })
    }
  } catch (error) {
    console.error("Failed to fetch matches:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
