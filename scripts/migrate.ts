import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

const config = {
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'minglefinder'
} as any

async function createDatabase() {
  // Connect to postgres database to create our app database
  const pool = new Pool({
    ...config,
    database: 'postgres'
  } as any)

  try {
    await pool.query('CREATE DATABASE minglefinder')
    console.log('Database created successfully')
  } catch (error: any) {
    if (error.code === '42P04') {
      console.log('Database already exists')
    } else {
      throw error
    }
  } finally {
    await pool.end()
  }
}

async function runMigrations() {
  // Connect to our app database
  const pool = new Pool(config as any)

  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), 'database', 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort() // This will sort by filename

    // Get executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT name FROM migrations'
    )
    const executedMigrationNames = new Set(executedMigrations.map(m => m.name))

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Running migration: ${file}`)
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
        
        const client = await pool.connect()
        try {
          await client.query('BEGIN')
          await client.query(sql)
          await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          )
          await client.query('COMMIT')
          console.log(`Migration ${file} completed successfully`)
        } catch (error) {
          await client.query('ROLLBACK')
          console.error(`Error running migration ${file}:`, error)
          throw error
        } finally {
          client.release()
        }
      } else {
        console.log(`Skipping migration ${file} - already executed`)
      }
    }

    console.log('All migrations completed successfully')
  } finally {
    await pool.end()
  }
}

// Run the migration process
async function migrate() {
  try {
    console.log('Creating database if it doesn\'t exist...')
    await createDatabase()

    console.log('Running migrations...')
    await runMigrations()

    console.log('Migration process completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration process failed:', error)
    process.exit(1)
  }
}

migrate() 