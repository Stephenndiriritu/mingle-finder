import bcrypt from 'bcryptjs'
import config from './config'

// Import jsonwebtoken only on the server side
let jwt: any = null;
if (typeof window === 'undefined') {
  // We're on the server
  jwt = require('jsonwebtoken');
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

export function generateToken(payload: any): string {
  if (!jwt) {
    throw new Error('JWT can only be used on the server side')
  }
  return jwt.sign(payload, config.auth.jwtSecret || 'fallback-secret', {
    expiresIn: config.auth.tokenExpiry
  })
}

export function verifyToken(token: string): any {
  if (!jwt) {
    throw new Error('JWT can only be used on the server side')
  }
  try {
    return jwt.verify(token, config.auth.jwtSecret || 'fallback-secret')
  } catch (error) {
    return null
  }
}
