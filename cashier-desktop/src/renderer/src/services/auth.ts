import { apiClient } from './api'

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
  private readonly TOKEN_KEY = 'malaka_cashier_token'
  private readonly USER_KEY = 'malaka_cashier_user'

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/v1/masterdata/users/login',
      { email, password }
    )

    if (response.token) {
      apiClient.setToken(response.token)
      localStorage.setItem(this.TOKEN_KEY, response.token)

      // Extract user info from token
      const user = this.decodeToken(response.token)
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      }
    }

    return response
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    apiClient.setToken('')
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY)
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    return null
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      return payload.exp > now
    } catch {
      return false
    }
  }

  decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.sub || payload.user_id || '',
        username: payload.username || payload.name || payload.email?.split('@')[0] || 'Cashier',
        email: payload.email || '',
        role: payload.role || 'cashier'
      }
    } catch {
      return null
    }
  }
}

export const authService = new AuthService()
export default authService
