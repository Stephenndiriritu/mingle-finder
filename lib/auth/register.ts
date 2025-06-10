import { hash } from 'bcryptjs'
import pool from '../db'
import { v4 as uuidv4 } from 'uuid'

export interface RegisterData {
  name: string
  email: string
  password: string
  birthdate: string
  gender: string
  location: string
}

export async function registerUser(data: RegisterData) {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Check if email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email.toLowerCase()]
    )
    
    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered')
    }
    
    // Hash password
    const hashedPassword = await hash(data.password, 12)
    
    // Generate verification token
    const verificationToken = uuidv4()
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Insert user
    const userId = uuidv4()
    const result = await client.query(
      `INSERT INTO users (
        id,
        name,
        email,
        password_hash,
        birthdate,
        gender,
        location,
        is_verified,
        is_active,
        verification_token,
        verification_token_expires,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, email, birthdate, gender, location, verification_token`,
      [
        userId,
        data.name,
        data.email.toLowerCase(),
        hashedPassword,
        data.birthdate,
        data.gender,
        data.location,
        false, // is_verified
        true,  // is_active
        verificationToken,
        verificationExpiry
      ]
    )

    // Split name into first and last name
    const nameParts = data.name.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null

    // Create initial profile
    await client.query(
      `INSERT INTO profiles (
        user_id,
        first_name,
        last_name,
        gender,
        birth_date,
        profile_completion_percentage,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        userId,
        firstName,
        lastName,
        data.gender,
        data.birthdate,
        20 // Initial profile completion percentage
      ]
    )

    await client.query('COMMIT')

    return {
      user: result.rows[0],
      verificationToken: result.rows[0].verification_token
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
} 