import pool from '../db'

export async function verifyEmail(token: string) {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Find user with verification token
    const userResult = await client.query(
      `SELECT 
        id,
        verification_token_expires
      FROM users 
      WHERE verification_token = $1`,
      [token]
    )
    
    const user = userResult.rows[0]
    
    if (!user) {
      throw new Error('Invalid verification token')
    }
    
    // Check if token has expired
    if (new Date() > new Date(user.verification_token_expires)) {
      throw new Error('Verification token has expired')
    }
    
    // Update user verification status and clear token
    await client.query(
      `UPDATE users 
       SET is_verified = true,
           verification_token = NULL,
           verification_token_expires = NULL
       WHERE id = $1`,
      [user.id]
    )
    
    await client.query('COMMIT')
    
    return true
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
} 