// Simple in-memory cache implementation (fallback when Redis not available)
interface CacheItem {
  value: any
  expiry: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  set(key: string, value: any, ttlSeconds: number = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expiry })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Global cache instance
const memoryCache = new MemoryCache()

// Redis-compatible interface
export const cacheUtils = {
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      // Try Redis if available
      if (process.env.REDIS_URL && typeof window === 'undefined') {
        const { Redis } = await import('ioredis')
        const redis = new Redis(process.env.REDIS_URL)
        await redis.setex(key, ttl, JSON.stringify(value))
        redis.disconnect()
      } else {
        // Fallback to memory cache
        memoryCache.set(key, value, ttl)
      }
    } catch (error) {
      console.warn('Cache set failed, using memory cache:', error)
      memoryCache.set(key, value, ttl)
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis if available
      if (process.env.REDIS_URL && typeof window === 'undefined') {
        const { Redis } = await import('ioredis')
        const redis = new Redis(process.env.REDIS_URL)
        const data = await redis.get(key)
        redis.disconnect()
        return data ? JSON.parse(data) : null
      } else {
        // Fallback to memory cache
        return memoryCache.get<T>(key)
      }
    } catch (error) {
      console.warn('Cache get failed, using memory cache:', error)
      return memoryCache.get<T>(key)
    }
  },

  async del(key: string): Promise<void> {
    try {
      // Try Redis if available
      if (process.env.REDIS_URL && typeof window === 'undefined') {
        const { Redis } = await import('ioredis')
        const redis = new Redis(process.env.REDIS_URL)
        await redis.del(key)
        redis.disconnect()
      } else {
        // Fallback to memory cache
        memoryCache.delete(key)
      }
    } catch (error) {
      console.warn('Cache delete failed, using memory cache:', error)
      memoryCache.delete(key)
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Try Redis if available
      if (process.env.REDIS_URL && typeof window === 'undefined') {
        const { Redis } = await import('ioredis')
        const redis = new Redis(process.env.REDIS_URL)
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
        redis.disconnect()
      } else {
        // For memory cache, clear all (simple implementation)
        memoryCache.clear()
      }
    } catch (error) {
      console.warn('Cache pattern invalidation failed:', error)
      memoryCache.clear()
    }
  }
}

// Cache decorator for API routes
export function withCache(ttl: number = 300) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyName}:${JSON.stringify(args)}`
      
      // Try to get from cache
      const cached = await cacheUtils.get(cacheKey)
      if (cached) {
        return cached
      }

      // Execute original method
      const result = await method.apply(this, args)
      
      // Cache the result
      await cacheUtils.set(cacheKey, result, ttl)
      
      return result
    }
  }
}

export default memoryCache
