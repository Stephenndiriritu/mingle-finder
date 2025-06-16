import type { NextRequest } from "next/server"
import pool from "./db"
import { comparePassword } from "./auth-utils"
import jwt from "jsonwebtoken"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set")
}

export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  subscriptionType?: string
  isVerified?: boolean
}

interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

// Auth helper functions
export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload

    if (!decoded.userId) {
      return null
    }

    // Get user from database
    const result = await pool.query(
      'SELECT id, email, name, is_admin, subscription_type, is_verified FROM users WHERE id = $1 AND is_active = true',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin || false,
      subscriptionType: user.subscription_type,
      isVerified: user.is_verified
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

export async function getAuthStatus() {
  // This is a server-side function for server components
  // For now, return not authenticated - implement proper server-side auth later
  return { authenticated: false, user: null }
}



