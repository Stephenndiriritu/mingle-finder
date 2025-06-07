import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  email: string
  name: string
  is_admin: boolean
  subscription_type?: string
  is_verified?: boolean
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

function base64UrlDecode(str: string): string {
  str += new Array(5 - (str.length % 4)).join("=")
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
}

function createSignature(header: string, payload: string, secret: string): string {
  const crypto = require("crypto")
  const data = `${header}.${payload}`
  return base64UrlEncode(crypto.createHmac("sha256", secret).update(data).digest())
}

export function generateToken(user: User): string {
  try {
    const header = { alg: "HS256", typ: "JWT" }
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin,
      subscription_type: user.subscription_type,
      is_verified: user.is_verified,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    }

    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(payload))
    const signature = createSignature(encodedHeader, encodedPayload, JWT_SECRET)

    return `${encodedHeader}.${encodedPayload}.${signature}`
  } catch (error) {
    console.error("Token generation error:", error)
    throw new Error("Failed to generate token")
  }
}

export function verifyToken(token: string): User | null {
  try {
    if (!token) return null

    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts
    const expectedSignature = createSignature(header, payload, JWT_SECRET)
    if (signature !== expectedSignature) return null

    const decodedPayload = JSON.parse(base64UrlDecode(payload))
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return {
      id: decodedPayload.id,
      email: decodedPayload.email,
      name: decodedPayload.name,
      is_admin: decodedPayload.is_admin,
      subscription_type: decodedPayload.subscription_type,
      is_verified: decodedPayload.is_verified,
    }
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export function hashPassword(password: string): string {
  try {
    return bcrypt.hashSync(password, 12)
  } catch (error) {
    console.error("Password hashing error:", error)
    throw new Error("Failed to hash password")
  }
}

export function comparePassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash)
  } catch (error) {
    console.error("Password comparison error:", error)
    return false
  }
}

export function getUserFromRequest(request: NextRequest): User | null {
  try {
    const token =
      request.cookies.get("auth-token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) return null
    return verifyToken(token)
  } catch (error) {
    console.error("Get user from request error:", error)
    return null
  }
}

export function requireAuth(request: NextRequest): User {
  const user = getUserFromRequest(request)
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export function requireAdmin(request: NextRequest): User {
  const user = requireAuth(request)
  if (!user.is_admin) {
    throw new Error("Admin access required")
  }
  return user
}
