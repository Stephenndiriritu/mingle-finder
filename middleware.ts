import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { apiRateLimit, authRateLimit } from './lib/rate-limit'

// Define paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/reset-password',
  '/verify-email',
  '/about',
  '/privacy',
  '/terms',
  '/features',
  '/success-stories',
  '/press',
  '/help',
  '/contact',
  '/careers',
  '/guidelines',
  '/safety',
  '/premium'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public assets and API routes without rate limiting
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    // Special rate limiting for auth endpoints
    if (pathname.includes('/auth') || pathname.includes('/login') || pathname.includes('/register')) {
      const rateLimitResponse = await authRateLimit(request)
      if (rateLimitResponse) return rateLimitResponse
    } else {
      // General API rate limiting
      const rateLimitResponse = await apiRateLimit(request)
      if (rateLimitResponse) return rateLimitResponse
    }
    return NextResponse.next()
  }

  // Check if the path is public
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // For protected routes (/app, /admin), let the page components handle authentication
  // This prevents redirect loops while still allowing protection
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/ (Next.js internals)
     * 2. /static (static files)
     * 3. All files with extensions (images, etc.)
     */
    '/((?!_next/|static/|.*\\..*$).*)',
  ],
}
