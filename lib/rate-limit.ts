import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  isAllowed(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const resetTime = now + windowMs
    
    const entry = this.requests.get(identifier)
    
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.requests.set(identifier, { count: 1, resetTime })
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }
    
    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: entry.resetTime }
    }
    
    // Increment count
    entry.count++
    this.requests.set(identifier, entry)
    
    return { 
      allowed: true, 
      remaining: maxRequests - entry.count, 
      resetTime: entry.resetTime 
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.requests.clear()
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter()

// Rate limiting middleware
export async function rateLimit(
  request: NextRequest,
  options: {
    maxRequests?: number
    windowMs?: number
    keyGenerator?: (req: NextRequest) => string
  } = {}
): Promise<NextResponse | null> {
  const {
    maxRequests = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes
    keyGenerator = (req) => req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous'
  } = options

  const identifier = keyGenerator(request)
  const result = rateLimiter.isAllowed(identifier, maxRequests, windowMs)

  if (!result.allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetTime.toString()
      }
    })
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())

  return null // Allow request to continue
}

// Specific rate limiters for different endpoints
export const authRateLimit = (request: NextRequest) =>
  rateLimit(request, {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req) => `auth:${req.headers.get('x-forwarded-for') || 'anonymous'}`
  })

export const apiRateLimit = (request: NextRequest) =>
  rateLimit(request, {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => `api:${req.headers.get('x-forwarded-for') || 'anonymous'}`
  })

export const swipeRateLimit = (request: NextRequest) =>
  rateLimit(request, {
    maxRequests: 100,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    keyGenerator: (req) => `swipe:${req.headers.get('x-forwarded-for') || 'anonymous'}`
  })

export const messageRateLimit = (request: NextRequest) =>
  rateLimit(request, {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req) => `message:${req.headers.get('x-forwarded-for') || 'anonymous'}`
  })

// Helper function to check rate limit without middleware
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  return rateLimiter.isAllowed(identifier, maxRequests, windowMs)
}

export default rateLimiter
