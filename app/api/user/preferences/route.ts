import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// Mock preferences for development
const mockPreferences = {
  max_distance: 25,
  age_min: 25,
  age_max: 35,
  show_me: "everyone",
  notifications_enabled: true,
  theme: "light",
  language: "en",
  hide_profile: false,
  hide_distance: false,
  hide_age: false
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      const result = await pool.query(
        `SELECT p.max_distance, p.age_min, p.age_max, p.show_me,
                up.notifications_enabled, up.theme, up.language,
                up.hide_profile, up.hide_distance, up.hide_age
         FROM profiles p
         JOIN user_preferences up ON p.user_id = up.user_id
         WHERE p.user_id = $1`,
        [user.id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Preferences not found" }, { status: 404 })
      }

      return NextResponse.json({ preferences: result.rows[0] })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ 
          preferences: mockPreferences,
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Failed to fetch preferences:", error)
    return NextResponse.json({ 
      error: "Failed to fetch preferences. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()

    try {
      // Update profile preferences
      if ('max_distance' in updates || 'age_min' in updates || 'age_max' in updates || 'show_me' in updates) {
        const profileUpdates = []
        const values = []
        let paramIndex = 1

        if ('max_distance' in updates) {
          profileUpdates.push(`max_distance = $${paramIndex}`)
          values.push(updates.max_distance)
          paramIndex++
        }
        if ('age_min' in updates) {
          profileUpdates.push(`age_min = $${paramIndex}`)
          values.push(updates.age_min)
          paramIndex++
        }
        if ('age_max' in updates) {
          profileUpdates.push(`age_max = $${paramIndex}`)
          values.push(updates.age_max)
          paramIndex++
        }
        if ('show_me' in updates) {
          profileUpdates.push(`show_me = $${paramIndex}`)
          values.push(updates.show_me)
          paramIndex++
        }

        if (profileUpdates.length > 0) {
          values.push(user.id)
          await pool.query(
            `UPDATE profiles 
             SET ${profileUpdates.join(', ')} 
             WHERE user_id = $${paramIndex}`,
            values
          )
        }
      }

      // Update user preferences
      if ('notifications_enabled' in updates || 'theme' in updates || 'language' in updates || 
          'hide_profile' in updates || 'hide_distance' in updates || 'hide_age' in updates) {
        const prefUpdates = []
        const values = []
        let paramIndex = 1

        if ('notifications_enabled' in updates) {
          prefUpdates.push(`notifications_enabled = $${paramIndex}`)
          values.push(updates.notifications_enabled)
          paramIndex++
        }
        if ('theme' in updates) {
          prefUpdates.push(`theme = $${paramIndex}`)
          values.push(updates.theme)
          paramIndex++
        }
        if ('language' in updates) {
          prefUpdates.push(`language = $${paramIndex}`)
          values.push(updates.language)
          paramIndex++
        }
        if ('hide_profile' in updates) {
          prefUpdates.push(`hide_profile = $${paramIndex}`)
          values.push(updates.hide_profile)
          paramIndex++
        }
        if ('hide_distance' in updates) {
          prefUpdates.push(`hide_distance = $${paramIndex}`)
          values.push(updates.hide_distance)
          paramIndex++
        }
        if ('hide_age' in updates) {
          prefUpdates.push(`hide_age = $${paramIndex}`)
          values.push(updates.hide_age)
          paramIndex++
        }

        if (prefUpdates.length > 0) {
          values.push(user.id)
          await pool.query(
            `UPDATE user_preferences 
             SET ${prefUpdates.join(', ')} 
             WHERE user_id = $${paramIndex}`,
            values
          )
        }
      }

      // Fetch updated preferences
      const result = await pool.query(
        `SELECT p.max_distance, p.age_min, p.age_max, p.show_me,
                up.notifications_enabled, up.theme, up.language,
                up.hide_profile, up.hide_distance, up.hide_age
         FROM profiles p
         JOIN user_preferences up ON p.user_id = up.user_id
         WHERE p.user_id = $1`,
        [user.id]
      )

      return NextResponse.json({ 
        message: "Preferences updated successfully",
        preferences: result.rows[0]
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      
      // Use mock data in development
      if (process.env.NODE_ENV === "development") {
        const updatedPreferences = { ...mockPreferences, ...updates }
        return NextResponse.json({ 
          message: "Preferences updated successfully (mock)",
          preferences: updatedPreferences,
          _mock: true
        })
      }
      
      throw dbError
    }
  } catch (error) {
    console.error("Failed to update preferences:", error)
    return NextResponse.json({ 
      error: "Failed to update preferences. Please try again later.",
      details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 })
  }
} 