import pool from "./db"

export interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  bio: string
  birthDate: string
  gender: string
  interests: string[]
  photos: string[]
  height: number
  occupation: string
  education: string
  location: string
  lookingFor: string
  relationshipType: string
  maxDistance: number
  ageMin: number
  ageMax: number
  showMe: string
  smoking: string
  drinking: string
  children: string
  religion: string
  languages: string[]
  hobbies: string[]
  profileCompletionPercentage: number
  createdAt: string
  updatedAt: string
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const result = await pool.query(
      `SELECT * FROM profiles WHERE user_id = $1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    // Convert snake_case to camelCase
    const profile = result.rows[0]
    return {
      id: profile.id,
      userId: profile.user_id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      bio: profile.bio,
      birthDate: profile.birth_date,
      gender: profile.gender,
      interests: profile.interests || [],
      photos: profile.photos || [],
      height: profile.height,
      occupation: profile.occupation,
      education: profile.education,
      location: profile.location,
      lookingFor: profile.looking_for,
      relationshipType: profile.relationship_type,
      maxDistance: profile.max_distance,
      ageMin: profile.age_min,
      ageMax: profile.age_max,
      showMe: profile.show_me,
      smoking: profile.smoking,
      drinking: profile.drinking,
      children: profile.children,
      religion: profile.religion,
      languages: profile.languages || [],
      hobbies: profile.hobbies || [],
      profileCompletionPercentage: profile.profile_completion_percentage,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return null
  }
}

export async function createProfile(data: Partial<Profile>): Promise<Profile | null> {
  try {
    const result = await pool.query(
      `
      INSERT INTO profiles (
        user_id,
        first_name,
        last_name,
        bio,
        birth_date,
        gender,
        interests,
        photos,
        height,
        occupation,
        education,
        location,
        looking_for,
        relationship_type,
        max_distance,
        age_min,
        age_max,
        show_me,
        smoking,
        drinking,
        children,
        religion,
        languages,
        hobbies,
        profile_completion_percentage
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
      `,
      [
        data.userId,
        data.firstName,
        data.lastName,
        data.bio,
        data.birthDate,
        data.gender,
        data.interests,
        data.photos,
        data.height,
        data.occupation,
        data.education,
        data.location,
        data.lookingFor,
        data.relationshipType,
        data.maxDistance,
        data.ageMin,
        data.ageMax,
        data.showMe,
        data.smoking,
        data.drinking,
        data.children,
        data.religion,
        data.languages,
        data.hobbies,
        calculateProfileCompletion(data)
      ]
    )

    return getUserProfile(data.userId!)
  } catch (error) {
    console.error("Failed to create profile:", error)
    return null
  }
}

export async function updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | null> {
  try {
    const result = await pool.query(
      `
      UPDATE profiles
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        bio = COALESCE($3, bio),
        birth_date = COALESCE($4, birth_date),
        gender = COALESCE($5, gender),
        interests = COALESCE($6, interests),
        photos = COALESCE($7, photos),
        height = COALESCE($8, height),
        occupation = COALESCE($9, occupation),
        education = COALESCE($10, education),
        location = COALESCE($11, location),
        looking_for = COALESCE($12, looking_for),
        relationship_type = COALESCE($13, relationship_type),
        max_distance = COALESCE($14, max_distance),
        age_min = COALESCE($15, age_min),
        age_max = COALESCE($16, age_max),
        show_me = COALESCE($17, show_me),
        smoking = COALESCE($18, smoking),
        drinking = COALESCE($19, drinking),
        children = COALESCE($20, children),
        religion = COALESCE($21, religion),
        languages = COALESCE($22, languages),
        hobbies = COALESCE($23, hobbies),
        profile_completion_percentage = $24,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $25
      RETURNING *
      `,
      [
        data.firstName,
        data.lastName,
        data.bio,
        data.birthDate,
        data.gender,
        data.interests,
        data.photos,
        data.height,
        data.occupation,
        data.education,
        data.location,
        data.lookingFor,
        data.relationshipType,
        data.maxDistance,
        data.ageMin,
        data.ageMax,
        data.showMe,
        data.smoking,
        data.drinking,
        data.children,
        data.religion,
        data.languages,
        data.hobbies,
        calculateProfileCompletion(data),
        userId
      ]
    )

    return getUserProfile(userId)
  } catch (error) {
    console.error("Failed to update profile:", error)
    return null
  }
}

export async function deleteProfile(userId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `DELETE FROM profiles WHERE user_id = $1`,
      [userId]
    )
    return result.rowCount > 0
  } catch (error) {
    console.error("Failed to delete profile:", error)
    return false
  }
}

function calculateProfileCompletion(profile: Partial<Profile>): number {
  const requiredFields = [
    'firstName',
    'lastName',
    'bio',
    'birthDate',
    'gender',
    'photos',
    'location',
    'lookingFor'
  ]

  const optionalFields = [
    'interests',
    'height',
    'occupation',
    'education',
    'relationshipType',
    'maxDistance',
    'ageMin',
    'ageMax',
    'showMe',
    'smoking',
    'drinking',
    'children',
    'religion',
    'languages',
    'hobbies'
  ]

  const requiredFieldsCount = requiredFields.length
  const optionalFieldsCount = optionalFields.length
  const totalFields = requiredFieldsCount + optionalFieldsCount

  let completedFields = 0

  // Check required fields (each worth 2 points)
  for (const field of requiredFields) {
    if (profile[field as keyof Profile]) {
      completedFields += 2
    }
  }

  // Check optional fields (each worth 1 point)
  for (const field of optionalFields) {
    const value = profile[field as keyof Profile]
    if (Array.isArray(value) ? value.length > 0 : value) {
      completedFields += 1
    }
  }

  // Calculate percentage (max points = requiredFields * 2 + optionalFields * 1)
  const maxPoints = requiredFieldsCount * 2 + optionalFieldsCount
  return Math.round((completedFields / maxPoints) * 100)
} 