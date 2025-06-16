import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

const mockStories = [
  {
    id: 1,
    title: "Found Love When We Least Expected",
    story: "We matched on Mingle Finder and instantly connected over our shared love of hiking and photography. After our first date at a local trail, we knew this was something special.",
    couple: "Emma & James",
    location: "Colorado Springs, CO",
    date: "2023-12-15",
    rating: 5,
    user_id: 1,
    created_at: new Date().toISOString(),
    is_approved: true
  },
  {
    id: 2,
    title: "From Match to Marriage",
    story: "What started as a casual conversation about our favorite books turned into daily chats, then dates, and now we're happily married! Thank you Mingle Finder for bringing us together.",
    couple: "Sofia & Michael",
    location: "Boston, MA",
    date: "2023-11-20",
    rating: 5,
    user_id: 2,
    created_at: new Date().toISOString(),
    is_approved: true
  }
]

// Get all success stories
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name, u.photos[1] as couple_photo 
       FROM success_stories s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.is_approved = true 
       ORDER BY s.created_at DESC`
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Failed to fetch success stories:", error)
    // Return mock data in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(mockStories)
    }
    return NextResponse.json({ error: "Failed to fetch success stories" }, { status: 500 })
  }
}

// Submit a new success story
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    const { title, story, location } = await request.json()

    if (!title || !story || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO success_stories (user_id, title, story, location) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [user?.id, title, story, location]
    )

    return NextResponse.json({
      message: "Success story submitted successfully",
      story: result.rows[0]
    })
  } catch (error) {
    console.error("Failed to submit success story:", error)
    // Return mock response in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        message: "Success story submitted successfully (mock)",
        story: {
          id: Math.floor(Math.random() * 1000),
          title: "New Story",
          story: "Story content",
          location: "Location",
          created_at: new Date().toISOString(),
          is_approved: false
        }
      })
    }
    return NextResponse.json({ error: "Failed to submit success story" }, { status: 500 })
  }
} 