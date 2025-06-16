import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user preferences from database
    const result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [user.id]
    )

    let preferences
    if (result.rows.length > 0) {
      const row = result.rows[0]
      preferences = {
        max_distance: row.distance_preference || 25,
        age_min: row.min_age || 18,
        age_max: row.max_age || 50,
        show_me: "everyone", // This would need to be added to schema if needed
        notifications_enabled: true, // This would need to be added to schema if needed
        theme: "light", // This would need to be added to schema if needed
        language: "en", // This would need to be added to schema if needed
        hide_profile: false, // This would need to be added to schema if needed
        hide_distance: !row.show_distance,
        hide_age: false // This would need to be added to schema if needed
      }
    } else {
      // Return default preferences if none exist
      preferences = {
        max_distance: 25,
        age_min: 18,
        age_max: 50,
        show_me: "everyone",
        notifications_enabled: true,
        theme: "light",
        language: "en",
        hide_profile: false,
        hide_distance: false,
        hide_age: false
      }
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Failed to fetch preferences:", error)
    return NextResponse.json({
      error: "Failed to fetch preferences. Please try again later."
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    // Update user preferences
    const updateFields = []
    const values = []
    let paramIndex = 1

    if ('max_distance' in updates) {
      updateFields.push(`distance_preference = $${paramIndex}`)
      values.push(updates.max_distance)
      paramIndex++
    }
    if ('age_min' in updates) {
      updateFields.push(`min_age = $${paramIndex}`)
      values.push(updates.age_min)
      paramIndex++
    }
    if ('age_max' in updates) {
      updateFields.push(`max_age = $${paramIndex}`)
      values.push(updates.age_max)
      paramIndex++
    }
    if ('hide_distance' in updates) {
      updateFields.push(`show_distance = $${paramIndex}`)
      values.push(!updates.hide_distance)
      paramIndex++
    }

    if (updateFields.length > 0) {
      values.push(user.id)

      // Try to update existing preferences
      const updateResult = await pool.query(
        `UPDATE user_preferences
         SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $${paramIndex}`,
        values
      )

      // If no rows were updated, create new preferences
      if (updateResult.rowCount === 0) {
        await pool.query(
          `INSERT INTO user_preferences (user_id, distance_preference, min_age, max_age, show_distance)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id) DO UPDATE SET
           distance_preference = EXCLUDED.distance_preference,
           min_age = EXCLUDED.min_age,
           max_age = EXCLUDED.max_age,
           show_distance = EXCLUDED.show_distance,
           updated_at = CURRENT_TIMESTAMP`,
          [
            user.id,
            updates.max_distance || 25,
            updates.age_min || 18,
            updates.age_max || 50,
            updates.hide_distance !== undefined ? !updates.hide_distance : true
          ]
        )
      }
    }

    // Fetch updated preferences
    const result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [user.id]
    )

    let updatedPreferences
    if (result.rows.length > 0) {
      const row = result.rows[0]
      updatedPreferences = {
        max_distance: row.distance_preference || 25,
        age_min: row.min_age || 18,
        age_max: row.max_age || 50,
        show_me: "everyone",
        notifications_enabled: true,
        theme: "light",
        language: "en",
        hide_profile: false,
        hide_distance: !row.show_distance,
        hide_age: false
      }
    } else {
      updatedPreferences = {
        max_distance: updates.max_distance || 25,
        age_min: updates.age_min || 18,
        age_max: updates.age_max || 50,
        show_me: "everyone",
        notifications_enabled: true,
        theme: "light",
        language: "en",
        hide_profile: false,
        hide_distance: updates.hide_distance || false,
        hide_age: false
      }
    }

    return NextResponse.json({
      message: "Preferences updated successfully",
      preferences: updatedPreferences
    })
  } catch (error) {
    console.error("Failed to update preferences:", error)
    return NextResponse.json({
      error: "Failed to update preferences. Please try again later."
    }, { status: 500 })
  }
}