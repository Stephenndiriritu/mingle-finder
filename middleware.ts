import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that don't require authentication
const publicPaths = [
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
  '/safety'
]

// Define paths that require admin access
const adminPaths = [
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/reports',
  '/admin/settings'
]

// Define paths that require premium subscription
const premiumPaths = [
  '/premium',
  '/app/advanced-search',
  '/app/boost',
  '/app/who-likes-me'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // For now, disable middleware authentication checks
  // TODO: Implement proper authentication middleware later
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel/|[\\w-]+\\.\\w+).*)',
  ],
} 
