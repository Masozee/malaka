import { apiClient, ApiResponse } from '@/lib/api'

// ==================== Types ====================

export interface QueryParams {
  start_date?: string   // "2006-01-02"
  end_date?: string     // "2006-01-02"
  granularity?: 'daily' | 'weekly' | 'monthly'
  group_by?: string
  limit?: number
}

export interface TimeSeriesPoint {
  date: string
  value: number
  label?: string
}

export interface RankedItem {
  id: string
  name: string
  value: number
  quantity?: number
  rank: number
}

export interface OverviewKPI {
  label: string
  value: number
  change: number        // percentage change vs prior period
  prior_value: number
  unit: string          // "currency" | "count" | "hours" | "percentage"
}

export interface OverviewResponse {
  revenue: OverviewKPI
  orders: OverviewKPI
  procurement_spend: OverviewKPI
  inventory_value: OverviewKPI
  attendance: OverviewKPI
}

export interface SyncStatusItem {
  table_name: string
  last_synced_at: string
  rows_synced: number
  sync_type: string
}

// ==================== Service ====================

const BASE = '/api/v1/analytics'

function buildParams(params?: QueryParams): Record<string, unknown> {
  if (!params) return {}
  const p: Record<string, unknown> = {}
  if (params.start_date) p.start_date = params.start_date
  if (params.end_date) p.end_date = params.end_date
  if (params.granularity) p.granularity = params.granularity
  if (params.group_by) p.group_by = params.group_by
  if (params.limit) p.limit = params.limit
  return p
}

export const analyticsService = {
  // Cross-module KPI overview
  async getOverview(params?: QueryParams): Promise<ApiResponse<OverviewResponse>> {
    return apiClient.get<ApiResponse<OverviewResponse>>(`${BASE}/overview`, buildParams(params))
  },

  // Sales analytics
  async getSalesRevenue(params?: QueryParams): Promise<ApiResponse<TimeSeriesPoint[]>> {
    return apiClient.get<ApiResponse<TimeSeriesPoint[]>>(`${BASE}/sales/revenue`, buildParams(params))
  },

  async getTopProducts(params?: QueryParams): Promise<ApiResponse<RankedItem[]>> {
    return apiClient.get<ApiResponse<RankedItem[]>>(`${BASE}/sales/products`, buildParams(params))
  },

  async getTopCustomers(params?: QueryParams): Promise<ApiResponse<RankedItem[]>> {
    return apiClient.get<ApiResponse<RankedItem[]>>(`${BASE}/sales/customers`, buildParams(params))
  },

  // Procurement analytics
  async getProcurementSpend(params?: QueryParams): Promise<ApiResponse<TimeSeriesPoint[]>> {
    return apiClient.get<ApiResponse<TimeSeriesPoint[]>>(`${BASE}/procurement/spend`, buildParams(params))
  },

  async getTopSuppliers(params?: QueryParams): Promise<ApiResponse<RankedItem[]>> {
    return apiClient.get<ApiResponse<RankedItem[]>>(`${BASE}/procurement/suppliers`, buildParams(params))
  },

  // Inventory analytics
  async getInventoryMovements(params?: QueryParams): Promise<ApiResponse<TimeSeriesPoint[]>> {
    return apiClient.get<ApiResponse<TimeSeriesPoint[]>>(`${BASE}/inventory/movements`, buildParams(params))
  },

  // Financial analytics
  async getFinancialLedger(params?: QueryParams): Promise<ApiResponse<TimeSeriesPoint[]>> {
    return apiClient.get<ApiResponse<TimeSeriesPoint[]>>(`${BASE}/financial/ledger`, buildParams(params))
  },

  // HR analytics
  async getAttendanceTrend(params?: QueryParams): Promise<ApiResponse<TimeSeriesPoint[]>> {
    return apiClient.get<ApiResponse<TimeSeriesPoint[]>>(`${BASE}/hr/attendance`, buildParams(params))
  },

  // Sync status (admin)
  async getSyncStatus(): Promise<ApiResponse<SyncStatusItem[]>> {
    return apiClient.get<ApiResponse<SyncStatusItem[]>>(`${BASE}/sync/status`)
  },
}

export default analyticsService
