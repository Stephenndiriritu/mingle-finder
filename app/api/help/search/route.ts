import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchQuery = request.nextUrl.searchParams.get("q")

    if (!searchQuery) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const result = await pool.query(
      `SELECT * FROM help_articles 
       WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
       ORDER BY created_at DESC`,
      [searchQuery]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Failed to search help articles:", error)
    return NextResponse.json({ error: "Failed to search help articles" }, { status: 500 })
  }
} 