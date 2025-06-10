import type { NextRequest } from "next/server"
import pool from "./db"
import { comparePassword } from "./auth-utils"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET must be set")
}

export interface User extends Omit<NextAuthUser, 'id'> {
  id: string
  email: string
  name: string
  isAdmin: boolean
  subscriptionType?: string
  isVerified?: boolean
}

interface ExtendedJWT extends Omit<JWT, 'id'> {
  id: string
  isAdmin: boolean
  subscriptionType?: string
  isVerified: boolean
}

// Auth helper functions
export async function getUserFromRequest(request: NextRequest) {
  // For now, return null - implement proper token validation later
  return null
}

// Legacy NextAuth config removed - not using NextAuth anymore
// All authentication is now handled by our custom auth system



