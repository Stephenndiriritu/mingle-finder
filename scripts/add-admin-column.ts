import pool from '../lib/db'

async function addAdminColumn() {
  console.log('Adding is_admin column to users table...')
  
  try {
    // Add is_admin column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
    `)
    
    console.log('✅ is_admin column added successfully')
    
    // Add index for admin users
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_admin ON users (is_admin) WHERE is_admin = true
    `)
    
    console.log('✅ Admin index created successfully')
    
  } catch (error) {
    console.error('❌ Error adding admin column:', error)
  } finally {
    await pool.end()
  }
}

addAdminColumn()
