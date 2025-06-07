import pool from "./db"

export interface MatchingPreferences {
  userId: number
  ageMin: number
  ageMax: number
  maxDistance: number
  showMe: string
  location: { lat: number; lng: number }
}

export async function getMatches(preferences: MatchingPreferences, limit = 10, offset = 0) {
  try {
    const query = `
      SELECT DISTINCT 
        u.id, u.name, u.date_of_birth, u.gender, u.location, u.latitude, u.longitude,
        p.bio, p.photos, p.age, p.height, p.occupation, p.interests, p.education,
        p.profile_completion_percentage,
        CASE 
          WHEN u.latitude IS NOT NULL AND u.longitude IS NOT NULL AND $4 IS NOT NULL AND $5 IS NOT NULL
          THEN calculate_distance($4, $5, u.latitude, u.longitude)
          ELSE NULL
        END as distance,
        CASE 
          WHEN u.subscription_type IN ('gold', 'platinum') THEN 1 
          ELSE 0 
        END as is_premium
      FROM users u
      JOIN profiles p ON u.id = p.user_id
      WHERE u.id != $1
        AND u.is_active = true
        AND u.id NOT IN (
          SELECT swiped_id FROM swipes WHERE swiper_id = $1
        )
        AND u.id NOT IN (
          SELECT blocked_id FROM blocks WHERE blocker_id = $1
        )
        AND u.id NOT IN (
          SELECT blocker_id FROM blocks WHERE blocked_id = $1
        )
        AND p.age BETWEEN $2 AND $3
        AND (
          $6 = 'everyone' OR 
          ($6 = 'male' AND u.gender = 'male') OR
          ($6 = 'female' AND u.gender = 'female')
        )
        AND (
          u.latitude IS NULL OR u.longitude IS NULL OR $4 IS NULL OR $5 IS NULL OR
          calculate_distance($4, $5, u.latitude, u.longitude) <= $7
        )
      ORDER BY 
        is_premium DESC,
        p.profile_completion_percentage DESC,
        u.last_active DESC,
        RANDOM()
      LIMIT $8 OFFSET $9
    `

    const result = await pool.query(query, [
      preferences.userId,
      preferences.ageMin,
      preferences.ageMax,
      preferences.location.lat,
      preferences.location.lng,
      preferences.showMe,
      preferences.maxDistance,
      limit,
      offset,
    ])

    return result.rows
  } catch (error) {
    console.error("Matching error:", error)
    throw error
  }
}

export async function calculateCompatibilityScore(user1Id: number, user2Id: number): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT 
        p1.interests as interests1, p1.hobbies as hobbies1, p1.education as education1,
        p2.interests as interests2, p2.hobbies as hobbies2, p2.education as education2
       FROM profiles p1, profiles p2
       WHERE p1.user_id = $1 AND p2.user_id = $2`,
      [user1Id, user2Id],
    )

    if (result.rows.length === 0) return 0

    const { interests1, interests2, hobbies1, hobbies2, education1, education2 } = result.rows[0]

    let score = 0

    // Interest compatibility (40% weight)
    if (interests1 && interests2) {
      const commonInterests = interests1.filter((interest: string) => interests2.includes(interest))
      const interestScore = (commonInterests.length / Math.max(interests1.length, interests2.length)) * 40
      score += interestScore
    }

    // Hobby compatibility (30% weight)
    if (hobbies1 && hobbies2) {
      const commonHobbies = hobbies1.filter((hobby: string) => hobbies2.includes(hobby))
      const hobbyScore = (commonHobbies.length / Math.max(hobbies1.length, hobbies2.length)) * 30
      score += hobbyScore
    }

    // Education compatibility (30% weight)
    if (education1 && education2) {
      const educationScore = education1.toLowerCase() === education2.toLowerCase() ? 30 : 0
      score += educationScore
    }

    return Math.round(score)
  } catch (error) {
    console.error("Compatibility calculation error:", error)
    return 0
  }
}

export async function getRecommendations(userId: number, limit = 20) {
  try {
    // Get user preferences
    const preferencesResult = await pool.query(
      `SELECT p.max_distance, p.age_min, p.age_max, p.show_me, u.latitude, u.longitude
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId],
    )

    if (preferencesResult.rows.length === 0) {
      throw new Error("User preferences not found")
    }

    const preferences = preferencesResult.rows[0]

    // Get potential matches
    const matches = await getMatches(
      {
        userId,
        ageMin: preferences.age_min,
        ageMax: preferences.age_max,
        maxDistance: preferences.max_distance,
        showMe: preferences.show_me,
        location: { lat: preferences.latitude, lng: preferences.longitude },
      },
      limit,
    )

    // Calculate compatibility scores
    const matchesWithScores = await Promise.all(
      matches.map(async (match) => {
        const compatibilityScore = await calculateCompatibilityScore(userId, match.id)
        return { ...match, compatibilityScore }
      }),
    )

    // Sort by compatibility score
    return matchesWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
  } catch (error) {
    console.error("Recommendations error:", error)
    throw error
  }
}
