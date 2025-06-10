import { compare } from 'bcryptjs'
import pool from '../db'
import { sign } from 'jsonwebtoken'

export interface LoginData {
  email: string
  password: string
}

export async function loginUser(data: LoginData) {
  const client = await pool.connect()
  
  try {
    // Find user by email
    const result = await client.query(
      `SELECT 
        id,
        name,
        email,
        password_hash,
        is_verified,
        is_active,
        birthdate,
        gender,
        location
      FROM users 
      WHERE email = $1`,
      [data.email.toLowerCase()]
    )
    
    const user = result.rows[0]
    
    if (!user) {
      throw new Error('Invalid email or password')
    }
    
    // Verify password
    const isValid = await compare(data.password, user.password_hash)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }
    
    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated')
    }
    
    // Update last active timestamp
    await client.query(
      'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    )
    
    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )
    
    // Remove sensitive data
    delete user.password_hash
    
    return {
      user,
      token
    }
  } finally {
    client.release()
  }
} 