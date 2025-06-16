import { Pool } from 'pg'

async function setupDatabase() {
  // Connect to postgres database to create/drop our app database
  const pool = new Pool({
    user: 'postgres',
    password: '1234',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  } as any)

  try {
    // Drop database if exists
    await pool.query('DROP DATABASE IF EXISTS minglefinder')
    console.log('Dropped existing database if it existed')

    // Create database
    await pool.query('CREATE DATABASE minglefinder')
    console.log('Created new database')

  } catch (error) {
    console.error('Error setting up database:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('Database setup completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('Database setup failed:', error)
    process.exit(1)
  }) 