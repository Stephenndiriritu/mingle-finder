import { Redis } from '@upstash/redis'
import { Profile } from '@/types/profile'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

const CACHE_TTL = {
  PROFILE: 3600, // 1 hour
  MATCHES: 300, // 5 minutes
  DISCOVER: 60, // 1 minute
  USER_PREFERENCES: 3600, // 1 hour
}

interface CacheConfig {
  ttl: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
}

export class CacheManager {
  static async get(key: string): Promise<any> {
    try {
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached as string) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set(key: string, value: any, config: CacheConfig): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), {
        ex: config.ttl,
      })

      if (config.tags) {
        await Promise.all(
          config.tags.map(tag =>
            redis.sadd(`cache:tags:${tag}`, key)
          )
        )
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  static async invalidateByTags(tags: string[]): Promise<void> {
    try {
      const keys = await Promise.all(
        tags.map(tag => redis.smembers(`cache:tags:${tag}`))
      )

      const uniqueKeys = [...new Set(keys.flat())]
      if (uniqueKeys.length > 0) {
        await redis.del(uniqueKeys)
        await Promise.all(
          tags.map(tag => redis.del(`cache:tags:${tag}`))
        )
      }
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }
}

// Cache middleware decorator
export function withCache(config: CacheConfig) {
  return async function(
    req: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    if (req.method !== 'GET') {
      return handler()
    }

    const cacheKey = `api:${req.nextUrl.pathname}${req.nextUrl.search}`
    const cached = await CacheManager.get(cacheKey)

    if (cached) {
      return new NextResponse(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const response = await handler()
    const data = await response.json()

    await CacheManager.set(cacheKey, data, config)

    return new NextResponse(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export async function cacheSet(key: string, value: any, ttl: number = 3600): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

export async function getCachedProfile(userId: number): Promise<Profile | null> {
  return cacheGet<Profile>(`profile:${userId}`)
}

export async function setCachedProfile(userId: number, profile: Profile): Promise<void> {
  await cacheSet(`profile:${userId}`, profile, CACHE_TTL.PROFILE)
}

export async function getCachedMatches(userId: number): Promise<any[]> {
  return cacheGet<any[]>(`matches:${userId}`) || []
}

export async function setCachedMatches(userId: number, matches: any[]): Promise<void> {
  await cacheSet(`matches:${userId}`, matches, CACHE_TTL.MATCHES)
}

export async function getCachedDiscoverUsers(userId: number): Promise<any[]> {
  return cacheGet<any[]>(`discover:${userId}`) || []
}

export async function setCachedDiscoverUsers(userId: number, users: any[]): Promise<void> {
  await cacheSet(`discover:${userId}`, users, CACHE_TTL.DISCOVER)
}

export async function invalidateUserCache(userId: number): Promise<void> {
  const keys = [
    `profile:${userId}`,
    `matches:${userId}`,
    `discover:${userId}`,
  ]
  await Promise.all(keys.map(key => cacheDelete(key)))
} 