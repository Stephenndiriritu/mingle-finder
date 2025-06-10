// Load environment variables from .env files
require('dotenv').config()
const { Pool } = require('pg')

async function createTables() {
  console.log('Starting table creation...')
  
  // Check if DATABASE_URL is defined
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not defined')
    console.log('Please set DATABASE_URL in your .env file')
    return
  }
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : false
  })
  
  try {
    // Test connection
    console.log('Testing database connection...')
    await pool.query('SELECT NOW()')
    console.log('Database connection successful')
    
    // Create testimonials table
    console.log('Creating testimonials table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        story TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS testimonials_user_id_idx ON testimonials(user_id);
      CREATE INDEX IF NOT EXISTS testimonials_is_approved_idx ON testimonials(is_approved);
    `)
    console.log('Testimonials table created successfully')
    
    // Create admin_notifications table
    console.log('Creating admin_notifications table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS admin_notifications_type_idx ON admin_notifications(type);
      CREATE INDEX IF NOT EXISTS admin_notifications_is_read_idx ON admin_notifications(is_read);
    `)
    console.log('Admin notifications table created successfully')
    
    console.log('All tables created successfully!')
  } catch (error) {
    console.error('Error creating tables:', error)
    console.log('\nTroubleshooting tips:')
    console.log('1. Check your DATABASE_URL in the .env file')
    console.log('2. Make sure your database server is running')
    console.log('3. Verify that the user has permission to create tables')
  } finally {
    await pool.end()
  }
}

createTables()
