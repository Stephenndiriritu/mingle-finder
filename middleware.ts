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

  // Check authentication for protected routes
  const token = request.cookies.get('auth-token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    // Redirect to login for protected routes
    if (pathname.startsWith('/app') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // For admin routes, we'll let the page component handle admin verification
  // since we need to verify the token and check admin status from database

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
