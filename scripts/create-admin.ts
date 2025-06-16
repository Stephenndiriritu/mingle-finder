import bcrypt from "bcryptjs"
import pool from "../lib/db"

async function createAdminUser() {
  const email = "admin@minglefinder.com"
  const password = "admin123" // Change this to your desired password
  const name = "Admin User"

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Check if admin user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      console.log("Admin user already exists")
      return
    }

    // Create admin user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, is_admin, is_verified)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name`,
      [email, passwordHash, name, true, true],
    )

    console.log("Admin user created successfully:", result.rows[0])
  } catch (error) {
    console.error("Error creating admin user:", error)
  } finally {
    await pool.end()
  }
}

createAdminUser() 