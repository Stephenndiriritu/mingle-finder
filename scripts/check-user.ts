import { query } from "../lib/db"

async function checkUser(email: string) {
  try {
    const result = await query(
      `SELECT id, email, name, is_verified, verification_token, verification_token_expires, is_active, password_hash 
       FROM users 
       WHERE email = $1`,
      [email]
    )
    
    if (result.rows.length === 0) {
      console.log('User not found')
      return
    }
    
    const user = result.rows[0]
    console.log('User details:', {
      ...user,
      password_hash: user.password_hash ? 'Present' : 'Missing' // Don't show actual hash
    })
  } catch (error) {
    console.error('Error:', error)
  }
  process.exit(0)
}

// Get email from command line argument
const email = process.argv[2]
if (!email) {
  console.log('Please provide an email address')
  process.exit(1)
}

checkUser(email) 