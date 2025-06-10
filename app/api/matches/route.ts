import { NextResponse } from "next/server"
import pool from "@/lib/db"

// Mock matches for development - supporting both formats
const mockMatchesForMessages = [
  {
    match_id: 1,
    matched_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 2,
      name: "Sarah Johnson",
      photos: ["/placeholder.svg?height=400&width=400"],
      last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      is_online: true
    },
    last_message: {
      id: 1,
      message: "Hey! How are you?",
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      is_read: false,
      sender_id: 2
    },
    unread_count: 1
  },
  {
    match_id: 2,
    matched_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 3,
      name: "Michael Chen",
      photos: ["/placeholder.svg?height=400&width=400"],
      last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_online: false
    },
    last_message: {
      id: 2,
      message: "Would you like to grab coffee sometime?",
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      is_read: true,
      sender_id: 3
    },
    unread_count: 0
  },
  {
    match_id: 3,
    matched_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 4,
      name: "Emily Davis",
      photos: ["/placeholder.svg?height=400&width=400"],
      last_active: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      is_online: true
    },
    last_message: null,
    unread_count: 0
  }
]

// Mock matches for the matches page (different format)
const mockMatchesForPage = [
  {
    id: "1",
    userId: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    photos: ["/placeholder.svg?height=400&width=400"],
    birthDate: "1995-06-15",
    occupation: "Software Engineer",
    location: "New York, NY",
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadMessages: 1
  },
  {
    id: "2",
    userId: "3",
    firstName: "Michael",
    lastName: "Chen",
    photos: ["/placeholder.svg?height=400&width=400"],
    birthDate: "1992-03-22",
    occupation: "Designer",
    location: "Brooklyn, NY",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadMessages: 0
  },
  {
    id: "3",
    userId: "4",
    firstName: "Emily",
    lastName: "Davis",
    photos: ["/placeholder.svg?height=400&width=400"],
    birthDate: "1997-11-08",
    occupation: "Marketing Manager",
    location: "Manhattan, NY",
    lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    unreadMessages: 0
  }
]

export async function GET(request: Request) {
  try {
    // For now, return mock data for testing
    // TODO: Add proper authentication and real data later

    const { searchParams } = new URL(request.url)
    const withMessages = searchParams.get('with_messages') === 'true'

    // Return different format based on what's requested
    const matches = withMessages ? mockMatchesForMessages : mockMatchesForPage

    return NextResponse.json({
      matches,
      success: true
    })
  } catch (error) {
    console.error("Failed to fetch matches:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
