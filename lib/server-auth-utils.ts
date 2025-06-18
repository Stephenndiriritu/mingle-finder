import bcrypt from 'bcryptjs'
import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken'
import config from './config'
import { cookies } from 'next/headers'
import { type User } from './auth'

const JWT_SECRET = process.env.NEXTAUTH_SECRET!
const TOKEN_EXPIRY = '7d'

interface JWTPayload extends JwtPayload {
  userId: number
  email: string
  isAdmin: boolean
  subscriptionType: string
  isVerified: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    console.error('Password comparison error:', error)
    return false
  }
}

/**
 * Generates a JWT token from the provided payload.
 *
 * The token is signed with the configured JWT secret, or falls back to the NEXTAUTH_SECRET environment variable.
 * If neither is configured, an error is thrown.
 *
 * @param payload Any data to be included in the token
 * @returns A JWT token as a string
 */
export function generateToken(user: Partial<User>): string {
  const payload: JWTPayload = {
    userId: user.id!,
    email: user.email!,
    isAdmin: user.isAdmin || false,
    subscriptionType: user.subscriptionType || 'free',
    isVerified: user.isVerified || false
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('auth-token')?.value
}

export async function validateSession(): Promise<User | null> {
  const token = await getAuthToken()
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) {
    await clearAuthCookie()
    return null
  }

  return {
    id: payload.userId,
    email: payload.email,
    name: '', // We'll need to fetch this from the database if needed
    isAdmin: payload.isAdmin,
    subscriptionType: payload.subscriptionType,
    isVerified: payload.isVerified,
    isActive: true
  }
}

