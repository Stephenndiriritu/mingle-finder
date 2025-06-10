import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cacheUtils } from '@/lib/redis'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
}

export function withCache(handler: Function, options: CacheOptions = {}) {
  return async (req: NextRequest) => {
    const cacheKey = `cache:${req.url}`
    
    // Try to get from cache
    const cached = await cacheUtils.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Get fresh data
    const response = await handler(req)
    const data = await response.json()

    // Cache the response
    await cacheUtils.set(cacheKey, data, options.ttl || 300) // Default 5 minutes

    // Store cache tags if provided
    if (options.tags) {
      await Promise.all(
        options.tags.map(tag =>
          cacheUtils.set(`tag:${tag}:${cacheKey}`, true, options.ttl)
        )
      )
    }

    return NextResponse.json(data)
  }
}

// Cache invalidation helper
export async function invalidateCache(tags: string[]) {
  await Promise.all(
    tags.map(tag => cacheUtils.invalidatePattern(`tag:${tag}:*`))
  )
} 