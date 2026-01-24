/**
 * API Client Configuration
 * Centralized HTTP client for backend communication with caching
 */

import { frontendCache, cacheTTL } from './cache'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Initialize token from localStorage if available (browser only)
    this.initializeToken()
  }

  private initializeToken(): void {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('malaka_auth_token')
      if (storedToken) {
        // Verify token is not expired before using it
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]))
          const now = Date.now() / 1000
          if (payload.exp > now) {
            this.token = storedToken
          }
        } catch {
          // Invalid token format, ignore
        }
      }
    }
  }

  setToken(token: string) {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Try to initialize token if not set (fallback for race conditions)
    if (!this.token && !token) {
      this.initializeToken()
    }

    // Prioritize passed token, then instance token
    const authToken = token || this.token
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        const apiError = new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)

        // API error handling - silent for production

        throw apiError
      }

      return response.json()
    } catch (error) {
      // Error handling - silent for production
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>, options?: { cache?: boolean, ttl?: number, token?: string }): Promise<T> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
    }

    // Check cache first (skip if explicit token provided, assuming SSR/unique context)
    if (options?.cache !== false && !options?.token) {
      const cacheKey = `GET:${url}`
      const cached = frontendCache.get<T>(cacheKey)
      if (cached) {
        return cached
      }

      // Make request and cache result
      const result = await this.request<T>(url, {}, options?.token)
      frontendCache.set(cacheKey, result, options?.ttl || cacheTTL.userProfile)
      return result
    }

    return this.request<T>(url, {}, options?.token)
  }

  async post<T>(endpoint: string, data?: unknown, options?: { token?: string }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    }, options?.token)
  }

  async put<T>(endpoint: string, data?: unknown, options?: { token?: string }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    }, options?.token)
  }

  async delete<T>(endpoint: string, options?: { token?: string }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    }, options?.token)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Export as default and named export for compatibility
export default apiClient
export const api = apiClient