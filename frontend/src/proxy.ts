import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/auth/signup',
  '/about',
  '/contact',
]

// Public route prefixes
const publicPrefixes = [
  '/api/',
  '/_next/',
  '/images/',
  '/assets/',
  '/favicon',
]

// Validate JWT token
function isValidToken(token: string): boolean {
  try {
    if (!token || token.trim() === '') return false

    const parts = token.split('.')
    if (parts.length !== 3) return false

    const payload = JSON.parse(atob(parts[1]))
    const now = Date.now() / 1000

    if (!payload.exp) return false

    // Check if token has expired (with 60 second buffer)
    return payload.exp > (now - 60)
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public prefixes (static assets, API, etc.)
  if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Allow exact public routes
  if (publicRoutes.includes(pathname)) {
    const token = request.cookies.get('malaka_auth_token')?.value
    const isAuthenticated = token && isValidToken(token)

    // If authenticated and on login page, redirect to dashboard
    if (pathname === '/login' && isAuthenticated) {
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    return NextResponse.next()
  }

  // All other routes require authentication
  const token = request.cookies.get('malaka_auth_token')?.value
  const isAuthenticated = token && isValidToken(token)

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
