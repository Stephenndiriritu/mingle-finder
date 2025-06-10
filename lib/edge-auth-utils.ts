import { jwtVerify, createRemoteJWKSet } from 'jose'
import { cookies } from 'next/headers'
import { type User } from './auth'

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export async function getAuthToken(): Promise<string | undefined> {
  return cookies().get('auth-token')?.value
}

export async function verifyEdgeToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function validateEdgeSession(): Promise<User | null> {
  const token = await getAuthToken()
  if (!token) return null

  const payload = await verifyEdgeToken(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.userId,
    email: payload.email,
    name: '', // We'll need to fetch this from the database if needed
    isAdmin: payload.isAdmin,
    subscriptionType: payload.subscriptionType,
    isVerified: payload.isVerified
  }
} 