/**
 * Procurement API Services
 * Type-safe API calls for all Procurement endpoints
 */

import { apiClient } from '@/lib/api'
import type {
  PurchaseRequest,
  PurchaseRequestFormData,
  PurchaseRequestListResponse,
  PurchaseRequestStats,
  PurchaseOrder,
  PurchaseOrderFormData,
  PurchaseOrderListResponse,
  Contract,
  ContractFormData,
  ContractListResponse,
  ContractStats,
  VendorEvaluation,
  VendorEvaluationFormData,
  VendorEvaluationListResponse,
  VendorEvaluationStats,
  ProcurementOverview,
  SpendAnalytics,
  SupplierPerformance,
  ContractAnalytics,
} from '@/types/procurement'

interface ProcurementFilters {
  [key: string]: string | number | undefined
  search?: string
  status?: string
  supplier_id?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Purchase Request Service
class PurchaseRequestService {
  private readonly baseUrl = '/api/v1/procurement/purchase-requests'

  async getAll(filters?: ProcurementFilters, token?: string): Promise<PurchaseRequestListResponse> {
    const response = await apiClient.get<{
      success: boolean
      message: string
      data: PurchaseRequest[] | { data: PurchaseRequest[]; pagination: { page: number; limit: number; total_rows: number } }
    }>(`${this.baseUrl}/`, filters, { token })

    if (Array.isArray(response.data)) {
      return {
        data: response.data || [],
        total: response.data?.length || 0,
        page: 1,
        limit: response.data?.length || 0
      }
    }

    const paginatedData = response.data as { data: PurchaseRequest[]; pagination: { page: number; limit: number; total_rows: number } }
    return {
      data: paginatedData.data || [],
      total: paginatedData.pagination.total_rows || 0,
      page: paginatedData.pagination.page || 1,
      limit: paginatedData.pagination.limit || 10
    }
  }

  async getById(id: string): Promise<PurchaseRequest> {
    const response = await apiClient.get<{ success: boolean; message: string; data: PurchaseRequest }>(`${this.baseUrl}/${id}`)
    return response.data
  }

  async create(data: PurchaseRequestFormData): Promise<PurchaseRequest> {
    // Transform date to RFC3339 format expected by backend
    const payload = {
      ...data,
      required_date: data.required_date ? new Date(data.required_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseRequest }>(`${this.baseUrl}/`, payload)
    return response.data
  }

  async update(id: string, data: Partial<PurchaseRequestFormData>): Promise<PurchaseRequest> {
    // Transform date to RFC3339 format expected by backend
    const payload = {
      ...data,
      required_date: data.required_date ? new Date(data.required_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.put<{ success: boolean; message: string; data: PurchaseRequest }>(`${this.baseUrl}/${id}`, payload)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`)
  }

  async approve(id: string): Promise<PurchaseRequest> {
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseRequest }>(`${this.baseUrl}/${id}/approve`)
    return response.data
  }

  async reject(id: string, reason: string): Promise<PurchaseRequest> {
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseRequest }>(`${this.baseUrl}/${id}/reject`, { reason })
    return response.data
  }

  async submit(id: string): Promise<PurchaseRequest> {
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseRequest }>(`${this.baseUrl}/${id}/submit`)
    return response.data
  }

  async cancel(id: string): Promise<PurchaseRequest> {
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseRequest }>(`${this.baseUrl}/${id}/cancel`)
    return response.data
  }

  async getStats(): Promise<PurchaseRequestStats> {
    const response = await apiClient.get<{ success: boolean; message: string; data: PurchaseRequestStats }>(`${this.baseUrl}/stats`)
    return response.data
  }

  async addItem(id: string, item: { item_name: string; quantity: number; unit: string; estimated_price: number; currency?: string; description?: string; specification?: string; supplier_id?: string }): Promise<void> {
    await apiClient.post<{ success: boolean; message: string }>(`${this.baseUrl}/${id}/items`, item)
  }

  async deleteItem(id: string, itemId: string): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}/items/${itemId}`)
  }
}

// Purchase Order Service
class PurchaseOrderService {
  private readonly baseUrl = '/api/v1/procurement/purchase-orders'

  async getAll(filters?: ProcurementFilters, token?: string): Promise<PurchaseOrderListResponse> {
    const response = await apiClient.get<{
      success: boolean
      message: string
      data: PurchaseOrder[] | { data: PurchaseOrder[]; pagination: { page: number; limit: number; total_rows: number } }
    }>(`${this.baseUrl}/`, filters, { token })

    if (Array.isArray(response.data)) {
      return {
        data: response.data || [],
        total: response.data?.length || 0,
        page: 1,
        limit: response.data?.length || 0
      }
    }

    const paginatedData = response.data as { data: PurchaseOrder[]; pagination: { page: number; limit: number; total_rows: number } }
    return {
      data: paginatedData.data || [],
      total: paginatedData.pagination.total_rows || 0,
      page: paginatedData.pagination.page || 1,
      limit: paginatedData.pagination.limit || 10
    }
  }

  async getById(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.get<{ success: boolean; message: string; data: PurchaseOrder }>(`${this.baseUrl}/${id}`)
    return response.data
  }

  async create(data: PurchaseOrderFormData): Promise<PurchaseOrder> {
    // Transform date to RFC3339 format expected by backend
    const payload = {
      ...data,
      expected_delivery_date: data.expected_delivery_date ? new Date(data.expected_delivery_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseOrder }>(`${this.baseUrl}/`, payload)
    return response.data
  }

  async update(id: string, data: Partial<PurchaseOrderFormData>): Promise<PurchaseOrder> {
    // Transform date to RFC3339 format expected by backend
    const payload = {
      ...data,
      expected_delivery_date: data.expected_delivery_date ? new Date(data.expected_delivery_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.put<{ success: boolean; message: string; data: PurchaseOrder }>(`${this.baseUrl}/${id}`, payload)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`)
  }

  async send(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseOrder }>(`${this.baseUrl}/${id}/send`)
    return response.data
  }

  async confirm(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseOrder }>(`${this.baseUrl}/${id}/confirm`)
    return response.data
  }

  async receive(id: string, receivedItems: { item_id: string; quantity: number }[]): Promise<PurchaseOrder> {
    const response = await apiClient.post<{ success: boolean; message: string; data: PurchaseOrder }>(`${this.baseUrl}/${id}/receive`, { items: receivedItems })
    return response.data
  }
}

// Contract Service
class ContractService {
  private readonly baseUrl = '/api/v1/procurement/contracts'

  async getAll(filters?: ProcurementFilters, token?: string): Promise<ContractListResponse> {
    const response = await apiClient.get<{
      success: boolean
      message: string
      data: Contract[] | { data: Contract[]; pagination: { page: number; limit: number; total_rows: number } }
    }>(`${this.baseUrl}/`, filters, { token })

    if (Array.isArray(response.data)) {
      return {
        data: response.data || [],
        total: response.data?.length || 0,
        page: 1,
        limit: response.data?.length || 0
      }
    }

    const paginatedData = response.data as { data: Contract[]; pagination: { page: number; limit: number; total_rows: number } }
    return {
      data: paginatedData.data || [],
      total: paginatedData.pagination.total_rows || 0,
      page: paginatedData.pagination.page || 1,
      limit: paginatedData.pagination.limit || 10
    }
  }

  async getById(id: string): Promise<Contract> {
    const response = await apiClient.get<{ success: boolean; message: string; data: Contract }>(`${this.baseUrl}/${id}`)
    return response.data
  }

  async create(data: ContractFormData): Promise<Contract> {
    // Transform dates to RFC3339 format expected by backend
    const payload = {
      ...data,
      start_date: data.start_date ? new Date(data.start_date + 'T00:00:00Z').toISOString() : undefined,
      end_date: data.end_date ? new Date(data.end_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.post<{ success: boolean; message: string; data: Contract }>(`${this.baseUrl}/`, payload)
    return response.data
  }

  async update(id: string, data: Partial<ContractFormData>): Promise<Contract> {
    // Transform dates to RFC3339 format expected by backend
    const payload = {
      ...data,
      start_date: data.start_date ? new Date(data.start_date + 'T00:00:00Z').toISOString() : undefined,
      end_date: data.end_date ? new Date(data.end_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.put<{ success: boolean; message: string; data: Contract }>(`${this.baseUrl}/${id}`, payload)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`)
  }

  async terminate(id: string, reason: string): Promise<Contract> {
    const response = await apiClient.post<{ success: boolean; message: string; data: Contract }>(`${this.baseUrl}/${id}/terminate`, { reason })
    return response.data
  }

  async renew(id: string, newEndDate: string): Promise<Contract> {
    const response = await apiClient.post<{ success: boolean; message: string; data: Contract }>(`${this.baseUrl}/${id}/renew`, { new_end_date: newEndDate })
    return response.data
  }

  async activate(id: string): Promise<Contract> {
    const response = await apiClient.post<{ success: boolean; message: string; data: Contract }>(`${this.baseUrl}/${id}/activate`)
    return response.data
  }

  async getExpiring(days: number = 30): Promise<Contract[]> {
    const response = await apiClient.get<{ success: boolean; message: string; data: Contract[] }>(`${this.baseUrl}/expiring`, { days })
    return response.data || []
  }

  async getStats(): Promise<ContractStats> {
    const response = await apiClient.get<{ success: boolean; message: string; data: ContractStats }>(`${this.baseUrl}/stats`)
    return response.data
  }

  getStatusColor(status: Contract['status']): string {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'draft':
        return 'text-gray-600 bg-gray-100'
      case 'expired':
        return 'text-red-600 bg-red-100'
      case 'terminated':
        return 'text-orange-600 bg-orange-100'
      case 'renewed':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }
}

// Vendor Evaluation Service
class VendorEvaluationService {
  private readonly baseUrl = '/api/v1/procurement/vendor-evaluations'

  async getAll(filters?: ProcurementFilters, token?: string): Promise<VendorEvaluationListResponse> {
    const response = await apiClient.get<{
      success: boolean
      message: string
      data: VendorEvaluation[] | { data: VendorEvaluation[]; pagination: { page: number; limit: number; total_rows: number } }
    }>(`${this.baseUrl}/`, filters, { token })

    if (Array.isArray(response.data)) {
      return {
        data: response.data || [],
        total: response.data?.length || 0,
        page: 1,
        limit: response.data?.length || 0
      }
    }

    const paginatedData = response.data as { data: VendorEvaluation[]; pagination: { page: number; limit: number; total_rows: number } }
    return {
      data: paginatedData.data || [],
      total: paginatedData.pagination.total_rows || 0,
      page: paginatedData.pagination.page || 1,
      limit: paginatedData.pagination.limit || 10
    }
  }

  async getById(id: string): Promise<VendorEvaluation> {
    const response = await apiClient.get<{ success: boolean; message: string; data: VendorEvaluation }>(`${this.baseUrl}/${id}`)
    return response.data
  }

  async create(data: VendorEvaluationFormData): Promise<VendorEvaluation> {
    // Transform dates to RFC3339 format expected by backend
    const payload = {
      ...data,
      evaluation_period_start: data.evaluation_period_start ? new Date(data.evaluation_period_start + 'T00:00:00Z').toISOString() : undefined,
      evaluation_period_end: data.evaluation_period_end ? new Date(data.evaluation_period_end + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.post<{ success: boolean; message: string; data: VendorEvaluation }>(`${this.baseUrl}/`, payload)
    return response.data
  }

  async update(id: string, data: Partial<VendorEvaluationFormData>): Promise<VendorEvaluation> {
    // Transform dates to RFC3339 format expected by backend
    const payload = {
      ...data,
      evaluation_period_start: data.evaluation_period_start ? new Date(data.evaluation_period_start + 'T00:00:00Z').toISOString() : undefined,
      evaluation_period_end: data.evaluation_period_end ? new Date(data.evaluation_period_end + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.put<{ success: boolean; message: string; data: VendorEvaluation }>(`${this.baseUrl}/${id}`, payload)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`)
  }

  async complete(id: string): Promise<VendorEvaluation> {
    const response = await apiClient.post<{ success: boolean; message: string; data: VendorEvaluation }>(`${this.baseUrl}/${id}/complete`)
    return response.data
  }

  async approve(id: string): Promise<VendorEvaluation> {
    const response = await apiClient.post<{ success: boolean; message: string; data: VendorEvaluation }>(`${this.baseUrl}/${id}/approve`)
    return response.data
  }

  getScoreColor(score: number): string {
    if (score >= 4.5) return 'text-green-600 bg-green-100'
    if (score >= 3.5) return 'text-blue-600 bg-blue-100'
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  getRecommendationColor(recommendation: VendorEvaluation['recommendation']): string {
    switch (recommendation) {
      case 'preferred':
        return 'text-green-600 bg-green-100'
      case 'approved':
        return 'text-blue-600 bg-blue-100'
      case 'conditional':
        return 'text-yellow-600 bg-yellow-100'
      case 'not_recommended':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  async getBySupplier(supplierId: string): Promise<VendorEvaluation[]> {
    const response = await apiClient.get<{ success: boolean; message: string; data: VendorEvaluation[] }>(`${this.baseUrl}/supplier/${supplierId}`)
    return response.data || []
  }

  async getSupplierScore(supplierId: string): Promise<{ average_score: number }> {
    const response = await apiClient.get<{ success: boolean; message: string; data: { average_score: number } }>(`${this.baseUrl}/supplier/${supplierId}/score`)
    return response.data
  }

  async getStats(): Promise<VendorEvaluationStats> {
    const response = await apiClient.get<{ success: boolean; message: string; data: VendorEvaluationStats }>(`${this.baseUrl}/stats`)
    return response.data
  }

  getStatusColor(status: VendorEvaluation['status']): string {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'completed':
        return 'text-blue-600 bg-blue-100'
      case 'draft':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }
}

// Analytics Service
class AnalyticsService {
  private readonly baseUrl = '/api/v1/procurement/analytics'

  async getOverview(): Promise<ProcurementOverview> {
    const response = await apiClient.get<{ success: boolean; message: string; data: ProcurementOverview }>(`${this.baseUrl}/overview`)
    return response.data
  }

  async getSpendAnalytics(startDate?: string, endDate?: string): Promise<SpendAnalytics> {
    const params: Record<string, string> = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    const response = await apiClient.get<{ success: boolean; message: string; data: SpendAnalytics }>(`${this.baseUrl}/spend`, params)
    return response.data
  }

  async getSupplierPerformance(): Promise<SupplierPerformance> {
    const response = await apiClient.get<{ success: boolean; message: string; data: SupplierPerformance }>(`${this.baseUrl}/suppliers`)
    return response.data
  }

  async getContractAnalytics(): Promise<ContractAnalytics> {
    const response = await apiClient.get<{ success: boolean; message: string; data: ContractAnalytics }>(`${this.baseUrl}/contracts`)
    return response.data
  }

  formatCurrency(value: number, currency: string = 'IDR'): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  formatCompactCurrency(value: number): string {
    if (value >= 1e12) return `Rp ${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `Rp ${(value / 1e3).toFixed(1)}K`
    return `Rp ${value}`
  }
}

// Export service instances
export const purchaseRequestService = new PurchaseRequestService()
export const purchaseOrderService = new PurchaseOrderService()
export const contractService = new ContractService()
export const vendorEvaluationService = new VendorEvaluationService()
export const analyticsService = new AnalyticsService()

// Export all services
export const procurementServices = {
  purchaseRequest: purchaseRequestService,
  purchaseOrder: purchaseOrderService,
  contract: contractService,
  vendorEvaluation: vendorEvaluationService,
  analytics: analyticsService,
}
