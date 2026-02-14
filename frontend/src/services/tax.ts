/**
 * Tax API Services
 * Type-safe API calls for all Tax endpoints (under accounting module)
 */

import { apiClient } from '@/lib/api'

// ==================== Types ====================

export interface Tax {
  id: string
  tax_code: string
  tax_name: string
  tax_type: string
  tax_rate: number
  description: string
  is_active: boolean
  effective_date: string
  expiry_date: string | null
  company_id: string
  created_at: string
  updated_at: string
}

export interface TaxFormData {
  tax_code: string
  tax_name: string
  tax_type: string
  tax_rate: number
  description?: string
  is_active?: boolean
  effective_date?: string
  expiry_date?: string
  company_id?: string
}

export interface TaxTransaction {
  id: string
  tax_id: string
  transaction_date: string
  transaction_type: string
  base_amount: number
  tax_amount: number
  total_amount: number
  reference_type: string
  reference_id: string
  reference_number: string
  customer_id: string
  supplier_id: string
  company_id: string
  created_at: string
}

export interface TaxTransactionFormData {
  tax_id: string
  transaction_date: string
  transaction_type: string
  base_amount: number
  tax_amount: number
  reference_type?: string
  reference_id?: string
  reference_number?: string
  customer_id?: string
  supplier_id?: string
  company_id?: string
}

export interface TaxReturn {
  id: string
  return_number: string
  tax_type: string
  period_start: string
  period_end: string
  filing_date: string
  due_date: string
  status: string
  total_sales: number
  total_purchases: number
  output_tax: number
  input_tax: number
  tax_payable: number
  tax_paid: number
  penalty_amount: number
  interest_amount: number
  total_due: number
  submitted_by: string
  submitted_at: string | null
  paid_at: string | null
  company_id: string
  created_at: string
}

export interface TaxReturnFormData {
  return_number: string
  tax_type: string
  period_start: string
  period_end: string
  filing_date?: string
  due_date: string
  total_sales?: number
  total_purchases?: number
  output_tax?: number
  input_tax?: number
  tax_payable?: number
  company_id?: string
}

// ==================== API Response wrapper ====================

interface ApiResp<T> {
  success: boolean
  message: string
  data: T
}

// ==================== Service Classes ====================

class TaxMasterService {
  private readonly baseUrl = '/api/v1/accounting/taxes'

  async getAll(): Promise<Tax[]> {
    const resp = await apiClient.get<ApiResp<Tax[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<Tax> {
    const resp = await apiClient.get<ApiResp<Tax>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: TaxFormData): Promise<Tax> {
    const resp = await apiClient.post<ApiResp<Tax>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async update(id: string, data: TaxFormData): Promise<Tax> {
    const resp = await apiClient.put<ApiResp<Tax>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class TaxTransactionService {
  private readonly baseUrl = '/api/v1/accounting/tax-transactions'

  async getAll(type?: string): Promise<TaxTransaction[]> {
    const params = type ? { type } : undefined
    const resp = await apiClient.get<ApiResp<TaxTransaction[]>>(`${this.baseUrl}/`, params)
    return resp.data || []
  }

  async getById(id: string): Promise<TaxTransaction> {
    const resp = await apiClient.get<ApiResp<TaxTransaction>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: TaxTransactionFormData): Promise<TaxTransaction> {
    const resp = await apiClient.post<ApiResp<TaxTransaction>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async update(id: string, data: TaxTransactionFormData): Promise<TaxTransaction> {
    const resp = await apiClient.put<ApiResp<TaxTransaction>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class TaxReturnService {
  private readonly baseUrl = '/api/v1/accounting/tax-returns'

  async getAll(status?: string): Promise<TaxReturn[]> {
    const params = status ? { status } : undefined
    const resp = await apiClient.get<ApiResp<TaxReturn[]>>(`${this.baseUrl}/`, params)
    return resp.data || []
  }

  async getById(id: string): Promise<TaxReturn> {
    const resp = await apiClient.get<ApiResp<TaxReturn>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: TaxReturnFormData): Promise<TaxReturn> {
    const resp = await apiClient.post<ApiResp<TaxReturn>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async update(id: string, data: TaxReturnFormData): Promise<TaxReturn> {
    const resp = await apiClient.put<ApiResp<TaxReturn>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async submit(id: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/submit`, {})
  }

  async pay(id: string, amount: number): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/pay`, { amount })
  }
}

// ==================== Singleton Exports ====================

export const taxMasterService = new TaxMasterService()
export const taxTransactionService = new TaxTransactionService()
export const taxReturnService = new TaxReturnService()
