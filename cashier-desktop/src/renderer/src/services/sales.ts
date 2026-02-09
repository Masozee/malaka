import { apiClient } from './api'

export interface Article {
  id: string
  code: string
  name: string
  barcode?: string
  price: number
  image_url?: string
  classification?: {
    id: string
    name: string
  }
}

// Helper function to construct full image URL from object key
export function getImageUrl(objectKey: string | undefined): string {
  if (!objectKey) return ''
  // If it's already a full URL, return as is
  if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
    return objectKey
  }
  // Use the media endpoint with full backend URL
  const baseUrl = localStorage.getItem('api_url') || 'http://localhost:8080'
  return `${baseUrl}/api/v1/media/${objectKey}`
}

export interface ArticleListResponse {
  data: Article[]
  total: number
}

export interface CreatePosItemRequest {
  article_id: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface CreatePosTransactionRequest {
  total_amount: number
  payment_method: string
  cashier_id: string
  items: CreatePosItemRequest[]
}

export interface PosTransaction {
  id: string
  transaction_date: string
  total_amount: number
  payment_method: string
  cashier_id: string
  created_at: string
  updated_at: string
}

export interface Promo {
  id: string
  code: string
  name: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  start_date: string
  end_date: string
  is_active: boolean
  min_purchase?: number
  max_discount?: number
}

export interface DashboardStats {
  total_transactions: number
  available_items: number
  cash_in_drawer: number
}

class SalesService {
  private readonly baseUrl = '/api/v1/sales'

  async getArticles(params?: { limit?: number; search?: string }): Promise<ArticleListResponse> {
    let url = '/api/v1/masterdata/articles/'
    const queryParams: string[] = []

    if (params?.limit) {
      queryParams.push(`limit=${params.limit}`)
    }
    if (params?.search) {
      queryParams.push(`search=${encodeURIComponent(params.search)}`)
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`
    }

    // Backend returns: { success, message, data: { data: Article[], pagination: {...} } }
    const response = await apiClient.get<{
      success: boolean
      message: string
      data: Article[] | { data: Article[]; pagination: { total_rows: number } }
    }>(url)

    // Handle both old format (direct array) and new paginated format
    if (Array.isArray(response.data)) {
      return {
        data: response.data || [],
        total: response.data?.length || 0
      }
    } else if (response.data && 'data' in response.data) {
      // New paginated format
      const paginatedData = response.data as { data: Article[]; pagination: { total_rows: number } }
      return {
        data: paginatedData.data || [],
        total: paginatedData.pagination?.total_rows || paginatedData.data?.length || 0
      }
    }

    return { data: [], total: 0 }
  }

  async createPosTransaction(data: CreatePosTransactionRequest): Promise<PosTransaction> {
    const response = await apiClient.post<{ data: PosTransaction }>(
      `${this.baseUrl}/pos-transactions/`,
      data
    )
    return response.data
  }

  async getPosTransactions(): Promise<PosTransaction[]> {
    try {
      const response = await apiClient.get<{ data: PosTransaction[] }>(
        `${this.baseUrl}/pos-transactions/`
      )
      return response.data || []
    } catch {
      return []
    }
  }

  async getTodayTransactionCount(): Promise<number> {
    try {
      const transactions = await this.getPosTransactions()
      const today = new Date().toISOString().split('T')[0]
      return transactions.filter((t) => t.transaction_date?.startsWith(today)).length
    } catch {
      return 0
    }
  }

  async getPromos(): Promise<Promo[]> {
    try {
      const response = await apiClient.get<{ data: Promo[] }>(`${this.baseUrl}/promos/`)
      return response.data || []
    } catch {
      return []
    }
  }

  async getActivePromos(): Promise<Promo[]> {
    try {
      const promos = await this.getPromos()
      const now = new Date()
      return promos.filter((p) => {
        const startDate = new Date(p.start_date)
        const endDate = new Date(p.end_date)
        return p.is_active && now >= startDate && now <= endDate
      })
    } catch {
      return []
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [transactions, articles] = await Promise.all([
        this.getPosTransactions(),
        this.getArticles({ limit: 1000 })
      ])

      const today = new Date().toISOString().split('T')[0]
      const todayTransactions = transactions.filter((t) =>
        t.transaction_date?.startsWith(today) || t.created_at?.startsWith(today)
      )

      const cashInDrawer = todayTransactions
        .filter((t) => t.payment_method === 'cash')
        .reduce((sum, t) => sum + (t.total_amount || 0), 0)

      return {
        total_transactions: todayTransactions.length,
        available_items: articles.total || articles.data?.length || 0,
        cash_in_drawer: cashInDrawer
      }
    } catch {
      return {
        total_transactions: 0,
        available_items: 0,
        cash_in_drawer: 0
      }
    }
  }
}

export const salesService = new SalesService()
export default salesService
