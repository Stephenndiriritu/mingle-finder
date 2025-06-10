// Load environment variables from .env files
require('dotenv').config()
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  // Check if DATABASE_URL is defined
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not defined')
    console.log('Please make sure your .env file contains the DATABASE_URL variable')
    return
  }

  console.log(`Using database URL: ${process.env.DATABASE_URL.split('@')[1]}`) // Log only the host part for security

  // Create a connection pool with explicit parameters to avoid SASL errors
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? {
          rejectUnauthorized: false // Set to false for development
        }
      : false
  })

  try {
    // Test the connection
    console.log('Testing database connection...')
    await pool.query('SELECT NOW()')
    console.log('Database connection successful')
    
    console.log('Running migration: create_testimonials_table.sql')
    
    const migrationPath = path.join(__dirname, '../database/migrations/create_testimonials_table.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')
    
    await pool.query(sql)
    
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    console.log('\nTroubleshooting tips:')
    console.log('1. Check your DATABASE_URL in the .env file')
    console.log('2. Make sure your database server is running')
    console.log('3. Verify that the user has permission to create tables')
    console.log('4. If using a remote database, check network connectivity')
    
    // More detailed error information
    if (error.message.includes('SASL')) {
      console.log('\nSASL authentication error detected:')
      console.log('- Make sure your password does not contain special characters that need escaping')
      console.log('- Try using a URL-encoded password in the connection string')
      console.log('- Check if your PostgreSQL server requires SSL connections')
    }
  } finally {
    await pool.end()
  }
}

runMigration()

