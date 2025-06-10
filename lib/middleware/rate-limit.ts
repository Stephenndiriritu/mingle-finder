import rateLimit from 'express-rate-limit'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
})

export function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const limit = limiter.get(ip)

  if (limit && limit.remaining === 0) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  return NextResponse.next()
} 