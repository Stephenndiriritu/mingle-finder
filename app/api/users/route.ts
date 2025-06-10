import { withCache, invalidateCache } from '@/middleware/cache'
import { rateLimit } from '@/middleware/rate-limit'

export const GET = withCache(async (req: NextRequest) => {
  // Check rate limit
  const rateLimitResult = await rateLimit(req)
  if (rateLimitResult) return rateLimitResult

  // Your API logic here
  const users = await db.query('SELECT * FROM users')
  
  return NextResponse.json(users)
}, {
  ttl: 300, // Cache for 5 minutes
  tags: ['users']
})

export async function POST(req: NextRequest) {
  // Rate limit check
  const rateLimitResult = await rateLimit(req)
  if (rateLimitResult) return rateLimitResult

  // Your POST logic here
  const user = await db.query('INSERT INTO users...')
  
  // Invalidate users cache
  await invalidateCache(['users'])
  
  return NextResponse.json(user)
} 