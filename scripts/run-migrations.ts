import pool from "../lib/db"
import fs from "fs"
import path from "path"

async function runMigrations() {
  const client = await pool.connect()
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), "database", "migrations")
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith(".sql"))
      .sort()

    // Get executed migrations
    const { rows: executedMigrations } = await client.query(
      "SELECT name FROM migrations"
    )
    const executedMigrationNames = new Set(executedMigrations.map(m => m.name))

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Running migration: ${file}`)
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8")
        
        await client.query("BEGIN")
        try {
          await client.query(sql)
          await client.query(
            "INSERT INTO migrations (name) VALUES ($1)",
            [file]
          )
          await client.query("COMMIT")
          console.log(`Migration ${file} completed successfully`)
        } catch (error) {
          await client.query("ROLLBACK")
          console.error(`Error running migration ${file}:`, error)
          throw error
        }
      }
    }

    console.log("All migrations completed successfully")
  } catch (error) {
    console.error("Migration error:", error)
    throw error
  } finally {
    client.release()
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log("Migration process completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Migration process failed:", error)
    process.exit(1)
  }) 