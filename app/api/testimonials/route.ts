import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

// Get approved testimonials
export async function GET() {
  try {
    // Check if the testimonials table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'testimonials'
      );
    `)
    
    const tableExists = tableCheck.rows[0].exists
    
    if (!tableExists) {
      // Return empty array if table doesn't exist
      return NextResponse.json([])
    }
    
    const result = await pool.query(
      `SELECT t.id, t.title, t.story as content, t.created_at,
              u.name as user_name
       FROM testimonials t
       JOIN users u ON t.user_id = u.id
       WHERE t.is_approved = true
       ORDER BY t.created_at DESC
       LIMIT 10`
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Failed to fetch testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

// Submit a new testimonial
export async function POST(req: NextRequest) {
  try {
    // Check for authentication
    // In a real app, you would validate the JWT token or session
    // For now, we'll use a simple header-based auth check
    const authHeader = req.headers.get('authorization')
    const userIdHeader = req.headers.get('x-user-id')

    if (!userIdHeader) {
      return NextResponse.json({
        error: "Authentication required. Please log in to submit a testimonial."
      }, { status: 401 })
    }

    const userId = userIdHeader

    // Check if the testimonials table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'testimonials'
      );
    `)
    
    const tableExists = tableCheck.rows[0].exists
    
    if (!tableExists) {
      // Create the table if it doesn't exist
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
      `)
    }

    const { title, story } = await req.json()

    if (!title || !story) {
      return NextResponse.json({ error: "Title and story are required" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO testimonials (user_id, title, story, is_approved)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [userId, title, story]
    )

    // Check if admin_notifications table exists and create it if not
    const notifTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_notifications'
      );
    `)
    
    const notifTableExists = notifTableCheck.rows[0].exists
    
    if (!notifTableExists) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_notifications (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          data JSONB,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `)
    }

    // Notify admins about new testimonial
    await pool.query(
      `INSERT INTO admin_notifications (type, message, data)
       VALUES ($1, $2, $3)`,
      [
        'new_testimonial',
        `New testimonial submitted by user ${userId}`,
        JSON.stringify({ testimonial_id: result.rows[0].id, user_id: userId })
      ]
    )

    return NextResponse.json({ 
      message: "Testimonial submitted successfully",
      testimonial: result.rows[0] 
    })
  } catch (error) {
    console.error("Failed to submit testimonial:", error)
    return NextResponse.json({ error: "Failed to submit testimonial" }, { status: 500 })
  }
} 
