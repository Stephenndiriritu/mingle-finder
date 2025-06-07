import { NextRequest } from "next/server"

interface TokenBucket {
  tokens: number
  lastRefill: number
}

export interface RateLimitOptions {
  tokensPerInterval: number
  interval: number // in milliseconds
}

const defaultOptions: RateLimitOptions = {
  tokensPerInterval: 10, // 10 requests
  interval: 60 * 1000, // per minute
}

// Use Map instead of LRUCache for simplicity
const tokenBuckets = new Map<string, TokenBucket>()

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of tokenBuckets.entries()) {
    if (now - bucket.lastRefill > defaultOptions.interval * 2) {
      tokenBuckets.delete(key)
    }
  }
}, 60 * 60 * 1000)

export function rateLimit(options: RateLimitOptions = defaultOptions) {
  return {
    check: (req: NextRequest, token: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const now = Date.now()
        let bucket = tokenBuckets.get(token)

        if (!bucket) {
          // Initialize new bucket
          bucket = {
            tokens: options.tokensPerInterval,
            lastRefill: now,
          }
        } else {
          // Refill tokens based on time elapsed
          const timePassed = now - bucket.lastRefill
          const refillAmount = Math.floor(timePassed / options.interval) * options.tokensPerInterval
          bucket.tokens = Math.min(options.tokensPerInterval, bucket.tokens + refillAmount)
          bucket.lastRefill = now
        }

        if (bucket.tokens > 0) {
          bucket.tokens--
          tokenBuckets.set(token, bucket)
          resolve()
        } else {
          reject(new Error('Rate limit exceeded'))
        }
      })
    }
  }
} 