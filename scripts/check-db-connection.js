// Load environment variables from .env files
require('dotenv').config({ path: '.env.local' })
require('dotenv').config() // Also load .env if it exists
const { Pool } = require('pg')

async function checkConnection() {
  console.log('Checking database connection...')
  
  // Check if DATABASE_URL is defined
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not defined')
    console.log('Please set DATABASE_URL in your .env or .env.local file')
    return
  }
  
  // Log connection info (without password)
  const connectionString = process.env.DATABASE_URL
  const maskedUrl = connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
  console.log(`Connection string: ${maskedUrl}`)
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false }
      : false
  })
  
  try {
    // Test connection
    console.log('Attempting to connect to database...')
    const result = await pool.query('SELECT NOW() as current_time')
    console.log('✅ Database connection successful!')
    console.log(`Server time: ${result.rows[0].current_time}`)
    
    // Check PostgreSQL version
    const versionResult = await pool.query('SELECT version()')
    console.log(`PostgreSQL version: ${versionResult.rows[0].version}`)
    
    // List existing tables
    console.log('\nChecking existing tables:')
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in the database.')
    } else {
      console.log('Tables in database:')
      tablesResult.rows.forEach((row, i) => {
        console.log(`${i+1}. ${row.table_name}`)
      })
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.log('\nTroubleshooting tips:')
    console.log('1. Check your DATABASE_URL in the .env file')
    console.log('2. Make sure your database server is running')
    console.log('3. Check if the database exists')
    console.log('4. Verify network connectivity to the database server')
    console.log('5. Check if your database requires SSL connections')
    
    if (error.message.includes('SASL')) {
      console.log('\nSASL authentication error detected:')
      console.log('- Make sure your password does not contain special characters that need escaping')
      console.log('- Try using a URL-encoded password in the connection string')
    }
  } finally {
    await pool.end()
  }
}

checkConnection()