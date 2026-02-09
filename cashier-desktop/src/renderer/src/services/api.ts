const API_BASE_URL = 'http://localhost:8080'

class ApiClient {
  private token: string | null = null

  constructor() {
    this.initializeToken()
  }

  private initializeToken(): void {
    const storedToken = localStorage.getItem('malaka_cashier_token')
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]))
        const now = Date.now() / 1000
        if (payload.exp > now) {
          this.token = storedToken
        } else {
          localStorage.removeItem('malaka_cashier_token')
        }
      } catch {
        localStorage.removeItem('malaka_cashier_token')
      }
    }
  }

  setToken(token: string): void {
    this.token = token
    if (token) {
      localStorage.setItem('malaka_cashier_token', token)
    } else {
      localStorage.removeItem('malaka_cashier_token')
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
export default apiClient
