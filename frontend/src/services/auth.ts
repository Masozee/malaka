import { apiClient } from '@/lib/api'

export interface LoginRequest {
  username: string
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
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem(this.TOKEN_KEY, response.token)
      apiClient.setToken(response.token)
    }
    
    return response
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    apiClient.setToken('')
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  isAuthenticated(): boolean {
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
    }
  }

  // Auto-login for development purposes
  async autoLogin(): Promise<boolean> {
    try {
      if (this.isAuthenticated()) {
        return true
      }

      // Try to login with test credentials
      await this.login({
        username: 'testuser',
        password: 'testpass'
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