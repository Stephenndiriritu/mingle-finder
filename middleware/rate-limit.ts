import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimiter } from '@/lib/redis'

export async function rateLimit(request: NextRequest) {
  try {
    const ip = request.ip ?? '127.0.0.1'
    await rateLimiter.consume(ip)
    return null
  } catch (error) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '900' // 15 minutes
      }
    })
  }
} 