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
  }

  setToken(token: string) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
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

  async get<T>(endpoint: string, params?: Record<string, unknown>, options?: { cache?: boolean, ttl?: number }): Promise<T> {
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
    
    // Check cache first
    if (options?.cache !== false) {
      const cacheKey = `GET:${url}`
      const cached = frontendCache.get<T>(cacheKey)
      if (cached) {
        return cached
      }
      
      // Make request and cache result
      const result = await this.request<T>(url)
      frontendCache.set(cacheKey, result, options?.ttl || cacheTTL.userProfile)
      return result
    }
    
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Export as default and named export for compatibility
export default apiClient
export const api = apiClient