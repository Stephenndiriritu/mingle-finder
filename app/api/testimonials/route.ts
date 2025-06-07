import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest, requireAuth } from "@/lib/auth"

// Get approved testimonials
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name, u.photos 
       FROM testimonials t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.is_approved = true 
       ORDER BY t.is_featured DESC, t.created_at DESC 
       LIMIT 10`
    )

    return NextResponse.json({ testimonials: result.rows })
  } catch (error) {
    console.error("Failed to fetch testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

// Submit a new testimonial
export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, story, photoUrl } = await req.json()

    if (!title || !story) {
      return NextResponse.json({ error: "Title and story are required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO testimonials (user_id, title, story, photo_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [user.id, title, story, photoUrl]
    )

    return NextResponse.json({ testimonial: result.rows[0] })
  } catch (error) {
    console.error("Failed to submit testimonial:", error)
    return NextResponse.json({ error: "Failed to submit testimonial" }, { status: 500 })
  }
} 