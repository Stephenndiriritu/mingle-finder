import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client if REDIS_URL is available
const redis = process.env.REDIS_URL 
  ? new Redis({ url: process.env.REDIS_URL })
  : null

// In-memory store for development or when Redis is not available
const inMemoryStore: Record<string, { count: number, reset: number }> = {}

interface RateLimitOptions {
  limit: number
  window: number // in seconds
  identifier?: string
}

export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
) {
  const { limit, window } = options
  
  // Get client IP or custom identifier
  const identifier = options.identifier || 
    request.ip || 
    request.headers.get("x-forwarded-for") || 
    "anonymous"
    
  const key = `ratelimit:${identifier}:${request.nextUrl.pathname}`
  const now = Date.now()
  const windowMs = window * 1000
  const reset = now + windowMs
  
  let currentLimit: { count: number, reset: number }
  
  // Use Redis if available
  if (redis) {
    const result = await redis.get(key) as { count: number, reset: number } | null
    
    if (result) {
      currentLimit = result
    } else {
      currentLimit = { count: 0, reset }
      await redis.set(key, currentLimit, { ex: window })
    }
    
    // Increment count
    currentLimit.count += 1
    await redis.set(key, currentLimit, { ex: window })
  } 
  // Use in-memory store
  else {
    if (inMemoryStore[key] && inMemoryStore[key].reset > now) {
      currentLimit = inMemoryStore[key]
      currentLimit.count += 1
    } else {
      currentLimit = { count: 1, reset }
    }
    
    inMemoryStore[key] = currentLimit
    
    // Clean up expired entries occasionally
    if (Math.random() < 0.01) {
      for (const key in inMemoryStore) {
        if (inMemoryStore[key].reset <= now) {
          delete inMemoryStore[key]
        }
      }
    }
  }
  
  // Set rate limit headers
  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, limit - currentLimit.count).toString(),
    "X-RateLimit-Reset": new Date(currentLimit.reset).toISOString()
  }
  
  // If limit is exceeded, return 429 Too Many Requests
  if (currentLimit.count > limit) {
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      { 
        status: 429, 
        headers: {
          ...headers,
          "Retry-After": Math.ceil((currentLimit.reset - now) / 1000).toString()
        }
      }
    )
  }
  
  // Otherwise, return null to continue processing the request
  return null
} 
