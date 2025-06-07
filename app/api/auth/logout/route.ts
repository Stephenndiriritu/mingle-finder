import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Create the response with success message
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    )

    // Clear all auth-related cookies
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })

    // Set CORS headers
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*")
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    )

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 })
  
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*")
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  )
  
  return response
}
