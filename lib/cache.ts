import Redis from 'ioredis'
import { Profile } from '@/types/profile'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

const CACHE_TTL = {
  PROFILE: 3600, // 1 hour
  MATCHES: 300, // 5 minutes
  DISCOVER: 60, // 1 minute
  USER_PREFERENCES: 3600, // 1 hour
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