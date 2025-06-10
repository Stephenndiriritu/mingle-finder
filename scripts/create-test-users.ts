import pool from '../lib/db'
import { hashPassword } from '../lib/auth-utils'

async function createTestUsers() {
  console.log('Creating test users...')
  
  try {
    // Create admin user
    const adminPassword = await hashPassword('admin123')
    
    const adminResult = await pool.query(
      `INSERT INTO users (
        email, password_hash, name, is_admin, is_verified, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_admin = EXCLUDED.is_admin,
        is_verified = EXCLUDED.is_verified,
        is_active = EXCLUDED.is_active
      RETURNING id, email, name, is_admin`,
      ['admin@minglefinder.com', adminPassword, 'Admin User', true, true, true]
    )
    
    const admin = adminResult.rows[0]
    console.log('✅ Admin user created:', admin)
    
    // Create admin profile if it doesn't exist
    await pool.query(
      `INSERT INTO profiles (user_id, first_name, profile_completion_percentage)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [admin.id, 'Admin', 100]
    )
    
    // Create admin preferences if they don't exist
    await pool.query(
      `INSERT INTO user_preferences (user_id)
       VALUES ($1)
       ON CONFLICT DO NOTHING`,
      [admin.id]
    )
    
    // Create regular test user
    const userPassword = await hashPassword('user123')
    
    const userResult = await pool.query(
      `INSERT INTO users (
        email, password_hash, name, is_admin, is_verified, is_active, subscription_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_admin = EXCLUDED.is_admin,
        is_verified = EXCLUDED.is_verified,
        is_active = EXCLUDED.is_active,
        subscription_type = EXCLUDED.subscription_type
      RETURNING id, email, name, is_admin, subscription_type`,
      ['user@minglefinder.com', userPassword, 'Test User', false, true, true, 'free']
    )
    
    const user = userResult.rows[0]
    console.log('✅ Regular user created:', user)
    
    // Create user profile if it doesn't exist
    await pool.query(
      `INSERT INTO profiles (user_id, first_name, age, bio, profile_completion_percentage)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [user.id, 'Test', 25, 'This is a test user profile for development.', 80]
    )

    // Create user preferences if they don't exist
    await pool.query(
      `INSERT INTO user_preferences (user_id, min_age, max_age, distance_preference)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [user.id, 18, 35, 50]
    )
    
    console.log('\n🎉 Test users created successfully!')
    console.log('\nLogin credentials:')
    console.log('👑 ADMIN: admin@minglefinder.com / admin123')
    console.log('👤 USER:  user@minglefinder.com / user123')
    
  } catch (error) {
    console.error('❌ Error creating test users:', error)
  } finally {
    await pool.end()
  }
}

createTestUsers()
