import pool from "../lib/db"
import fs from "fs"
import path from "path"

async function runSchema() {
  const client = await pool.connect()
  try {
    console.log('Running complete schema...')
    const schemaPath = path.join(process.cwd(), "database", "schema.sql")
    const sql = fs.readFileSync(schemaPath, "utf-8")
    
    await client.query(sql)
    console.log('Schema applied successfully')
  } catch (error) {
    console.error('Error applying schema:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run schema
runSchema()
  .then(() => {
    console.log("Schema process completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Schema process failed:", error)
    process.exit(1)
  }) 