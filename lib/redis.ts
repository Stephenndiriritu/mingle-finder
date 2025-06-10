import { Redis } from 'ioredis'
import { RateLimiterRedis } from 'rate-limiter-flexible'

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not set')
}

// Create Redis client with reconnection handling
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  reconnectOnError(err) {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      return true
    }
    return false
  }
})

redis.on('error', (error) => {
  console.error('Redis connection error:', error)
})

redis.on('connect', () => {
  console.log('✅ Connected to Redis')
})

// Rate limiter configuration
export const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit',
  points: 10, // Number of points
  duration: 1, // Per second
  blockDuration: 60 * 15 // Block for 15 minutes
})

// Cache helper functions
export const cacheUtils = {
  async set(key: string, value: any, ttl?: number) {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await redis.setex(key, ttl, serialized)
    } else {
      await redis.set(key, serialized)
    }
  },

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key)
    if (!data) return null
    return JSON.parse(data) as T
  },

  async del(key: string) {
    await redis.del(key)
  },

  async invalidatePattern(pattern: string) {
    const keys = await redis.keys(pattern)
    if (keys.length) {
      await redis.del(...keys)
    }
  }
}

export default redis 