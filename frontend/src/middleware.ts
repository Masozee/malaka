import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('malaka_auth_token')?.value
  const isAuthenticated = token && isValidToken(token)

  // Handle login page - redirect authenticated users to dashboard
  if (pathname === '/login') {
    if (isAuthenticated) {
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    return NextResponse.next()
  }

  // All other matched routes require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/hr/:path*',
    '/accounting/:path*',
    '/inventory/:path*',
    '/sales/:path*',
    '/procurement/:path*',
    '/production/:path*',
    '/shipping/:path*',
    '/master-data/:path*',
    '/reports/:path*',
    '/calendar/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/guidelines/:path*',
    '/products/:path*',
    // Login page (for redirect when authenticated)
    '/login',
  ],
}
