import { apiClient } from '@/lib/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface User {
  id: string
  username: string
  email: string
  role: string
}

class AuthService {
  private readonly TOKEN_KEY = 'malaka_auth_token'
  private readonly USER_KEY = 'malaka_user'

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/v1/masterdata/users/login', credentials)
    
    // Store token in both localStorage and cookies (browser only)
    if (response.token && typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, response.token)
      
      // Store in cookies for middleware access
      this.setTokenCookie(response.token)
      
      apiClient.setToken(response.token)
    }
    
    return response
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
      
      // Remove token from cookies
      this.removeTokenCookie()
    }
    apiClient.setToken('')
  }

  private setTokenCookie(token: string): void {
    if (typeof window === 'undefined') return

    // Calculate expiration from token, default to 48 hours (2 days)
    let maxAge = 48 * 60 * 60 // Default 48 hours (2 days) in seconds

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000)
        // Use token expiry or 48 hours, whichever is smaller
        const tokenMaxAge = Math.max(0, payload.exp - now)
        maxAge = Math.min(maxAge, tokenMaxAge)
      }
    } catch {
      // Use default if token parsing fails
    }

    const secureFlag = location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`
  }

  private removeTokenCookie(): void {
    if (typeof window === 'undefined') return
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  isAuthenticated(): boolean {
    // Server-side rendering safety check
    if (typeof window === 'undefined') return false
    
    const token = this.getToken()
    if (!token) return false
    
    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      return payload.exp > now
    } catch {
      return false
    }
  }

  initializeAuth(): void {
    const token = this.getToken()
    if (token && this.isAuthenticated()) {
      apiClient.setToken(token)
      // Ensure token is also in cookies for middleware
      this.setTokenCookie(token)
    }
  }

  // Auto-login for development purposes
  async autoLogin(): Promise<boolean> {
    try {
      if (this.isAuthenticated()) {
        return true
      }

      // Try to login with dev credentials
      await this.login({
        email: 'dev@malaka.co.id',
        password: '687654'
      })

      return true
    } catch (error) {
      console.error('Auto-login failed:', error)
      return false
    }
  }
}

export const authService = new AuthService()
export default authService