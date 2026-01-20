import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/api', '/_next', '/favicon.ico', '/manifest.json']

// Routes that should allow auto-login attempt (main app pages)
const protectedRoutes = [
  '/', '/dashboard', '/hr', '/accounting', '/inventory', '/sales', 
  '/procurement', '/production', '/shipping', '/master-data', '/reports', 
  '/calendar', '/profile', '/settings', '/guidelines', '/products'
]

// Check if a path is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route))
}

// Check if a path is protected and should trigger auth check
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

// Validate JWT token without server dependency
function isValidToken(token: string): boolean {
  try {
    if (!token || token.trim() === '') return false
    
    // Basic JWT structure validation
    const parts = token.split('.')
    if (parts.length !== 3) return false

    // Decode and validate payload
    const payload = JSON.parse(atob(parts[1]))
    const now = Date.now() / 1000
    
    // Check required fields
    if (!payload.exp) return false
    
    // Check if token has expired (with 60 second buffer for clock skew)
    return payload.exp > (now - 60)
  } catch (error) {
    console.error('[Middleware] Token validation error:', error)
    return false
  }
}

// Extract user data from JWT token
function getUserFromToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.sub || payload.user_id || payload.id || 'unknown',
      username: payload.username || payload.name || payload.preferred_username || 'user',
      email: payload.email || 'user@malaka.com',
      role: payload.role || payload.roles?.[0] || 'user',
      exp: payload.exp
    }
  } catch (error) {
    console.error('[Middleware] User extraction error:', error)
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const fullUrl = pathname + search
  
  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    console.log(`[Middleware] Public route: ${pathname}`)
    return NextResponse.next()
  }

  // Get token from multiple sources
  const cookieToken = request.cookies.get('malaka_auth_token')?.value
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
  const customToken = request.headers.get('x-auth-token')
  const token = cookieToken || headerToken || customToken

  console.log(`[Middleware] Checking route: ${fullUrl}`)
  console.log(`[Middleware] Token sources - Cookie: ${!!cookieToken}, Header: ${!!headerToken}, Custom: ${!!customToken}`)

  // Check if user is authenticated
  const isAuthenticated = token && isValidToken(token)
  
  if (isAuthenticated) {
    console.log(`[Middleware] User authenticated for ${fullUrl}`)
    
    // Extract user info for headers
    const user = getUserFromToken(token!)
    const response = NextResponse.next()
    
    // Add auth info to request headers
    response.headers.set('x-auth-token', token!)
    response.headers.set('x-authenticated', 'true')
    
    if (user) {
      response.headers.set('x-user-data', JSON.stringify(user))
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', user.role)
    }
    
    // Refresh token cookie with updated expiration (2 days)
    const cookieOptions = {
      httpOnly: false, // Allow JS access for frontend auth context
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 48 * 60 * 60, // 48 hours (2 days)
      path: '/'
    }
    
    response.cookies.set('malaka_auth_token', token!, cookieOptions)
    
    // Clear auth attempt cookie on successful authentication
    response.cookies.delete('auth_attempted')
    
    return response
  }

  // For protected routes without valid auth
  if (isProtectedRoute(pathname)) {
    console.log(`[Middleware] Protected route ${fullUrl} accessed without auth`)
    
    // Check if this is a first-time visit (no auth attempt yet)
    const authAttempted = request.cookies.get('auth_attempted')?.value
    const authAttemptTime = request.cookies.get('auth_attempt_time')?.value
    
    // Check if auth attempt is still valid (within 2 minutes)
    const isAuthAttemptValid = authAttemptTime && 
      (Date.now() - parseInt(authAttemptTime)) < 2 * 60 * 1000
    
    if (!authAttempted || !isAuthAttemptValid) {
      console.log(`[Middleware] First visit or expired attempt for ${fullUrl}, allowing auto-login`)
      
      // Allow the request to continue and let React handle auto-login
      const response = NextResponse.next()
      
      // Mark that an auth attempt will be made with timestamp
      response.cookies.set('auth_attempted', 'true', {
        maxAge: 2 * 60, // 2 minute timeout for auth attempt
        path: '/'
      })
      
      response.cookies.set('auth_attempt_time', Date.now().toString(), {
        maxAge: 2 * 60, // 2 minute timeout
        path: '/'
      })
      
      return response
    } else {
      console.log(`[Middleware] Auth already attempted for ${fullUrl}, redirecting to login`)
      
      // Auto-login was attempted but failed, redirect to login
      const loginUrl = new URL('/login', request.url)
      
      // Preserve full URL including search params for redirect
      if (fullUrl !== '/') {
        loginUrl.searchParams.set('redirect', encodeURIComponent(fullUrl))
      }
      
      // Clear the auth attempt cookies
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('auth_attempted')
      response.cookies.delete('auth_attempt_time')
      
      return response
    }
  }

  // For non-protected routes, allow access
  console.log(`[Middleware] Non-protected route ${fullUrl}, allowing access`)
  
  const response = NextResponse.next()
  response.headers.set('x-authenticated', 'false')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - .well-known (security files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|\.well-known).*)',
  ],
}