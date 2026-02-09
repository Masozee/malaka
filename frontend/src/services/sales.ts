/**
 * Sales Service
 * Handles API communication for sales operations including direct sales, POS transactions
 */

import { apiClient } from '@/lib/api'

// Direct Sales / POS Transaction Types
export interface DirectSale {
  id: string
  transaction_date: string
  total_amount: number
  payment_method: 'cash' | 'card' | 'transfer' | 'installment'
  cashier_id: string
  sales_person?: string
  customer_name?: string
  customer_phone?: string
  customer_address?: string
  visit_type?: 'showroom' | 'home_visit' | 'office_visit' | 'exhibition'
  location?: string
  items?: DirectSaleItem[]
  subtotal?: number
  tax_amount?: number
  discount_amount?: number
  payment_status?: 'pending' | 'paid' | 'partial' | 'failed'
  delivery_method?: 'pickup' | 'delivery' | 'shipping'
  delivery_status?: 'pending' | 'delivered' | 'cancelled'
  commission_rate?: number
  commission_amount?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface DirectSaleItem {
  id: string
  product_code: string
  product_name: string
  size: string
  color: string
  quantity: number
  unit_price: number
  discount_percentage: number
  line_total: number
}

export interface SalesOrder {
  id: string
  order_number: string
  order_date: string
  customer_id: string
  customer_name: string
  total_amount: number
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled'
  items: SalesOrderItem[]
  created_at: string
  updated_at: string
}

export interface SalesOrderItem {
  id: string
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface SalesInvoice {
  id: string
  invoice_number: string
  invoice_date: string
  customer_id: string
  customer_name: string
  total_amount: number
  payment_status: 'pending' | 'paid' | 'overdue'
  created_at: string
  updated_at: string
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

export interface CreateDirectSaleRequest {
  transaction_date: string
  total_amount: number
  payment_method: string
  cashier_id: string
  sales_person?: string
  customer_name?: string
  customer_phone?: string
  customer_address?: string
  visit_type?: string
  location?: string
  notes?: string
}

export interface CreateSalesOrderRequest {
  order_date: string
  customer_id: string
  customer_name: string
  items: {
    product_code: string
    product_name: string
    quantity: number
    unit_price: number
  }[]
}

class SalesService {
  private readonly baseUrl = '/api/v1/sales'

  // Direct Sales / POS Transactions
  async getDirectSales(): Promise<DirectSale[]> {
    try {
      const response = await apiClient.get<{ data: DirectSale[] }>(`${this.baseUrl}/pos-transactions/`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching direct sales:', error)
      // Return mock data for now while backend is being implemented
      return []
    }
  }

  async getDirectSaleById(id: string): Promise<DirectSale | null> {
    try {
      const response = await apiClient.get<{ data: DirectSale }>(`${this.baseUrl}/pos-transactions/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching direct sale:', error)
      return null
    }
  }

  async createDirectSale(data: CreateDirectSaleRequest): Promise<DirectSale> {
    const response = await apiClient.post<{ data: DirectSale }>(`${this.baseUrl}/pos-transactions/`, data)
    return response.data
  }

  async createPosTransaction(data: CreatePosTransactionRequest): Promise<PosTransaction> {
    const response = await apiClient.post<{ data: PosTransaction }>(`${this.baseUrl}/pos-transactions/`, data)
    return response.data
  }

  async updateDirectSale(id: string, data: Partial<CreateDirectSaleRequest>): Promise<DirectSale> {
    const response = await apiClient.put<{ data: DirectSale }>(`${this.baseUrl}/pos-transactions/${id}`, data)
    return response.data
  }

  async deleteDirectSale(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/pos-transactions/${id}`)
  }

  // Sales Orders
  async getSalesOrders(): Promise<SalesOrder[]> {
    try {
      const response = await apiClient.get<{ data: SalesOrder[] }>(`${this.baseUrl}/orders/`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching sales orders:', error)
      return []
    }
  }

  async getSalesOrderById(id: string): Promise<SalesOrder | null> {
    try {
      const response = await apiClient.get<{ data: SalesOrder }>(`${this.baseUrl}/orders/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales order:', error)
      return null
    }
  }

  async createSalesOrder(data: CreateSalesOrderRequest): Promise<SalesOrder> {
    const response = await apiClient.post<{ data: SalesOrder }>(`${this.baseUrl}/orders/`, data)
    return response.data
  }

  async updateSalesOrder(id: string, data: Partial<CreateSalesOrderRequest>): Promise<SalesOrder> {
    const response = await apiClient.put<{ data: SalesOrder }>(`${this.baseUrl}/orders/${id}`, data)
    return response.data
  }

  async deleteSalesOrder(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/orders/${id}`)
  }

  // Sales Invoices
  async getSalesInvoices(): Promise<SalesInvoice[]> {
    try {
      const response = await apiClient.get<{ data: SalesInvoice[] }>(`${this.baseUrl}/invoices/`)
      return response.data || []
    } catch (error) {
      console.error('Error fetching sales invoices:', error)
      return []
    }
  }

  async getSalesInvoiceById(id: string): Promise<SalesInvoice | null> {
    try {
      const response = await apiClient.get<{ data: SalesInvoice }>(`${this.baseUrl}/invoices/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales invoice:', error)
      return null
    }
  }

  // Statistics
  async getSalesStats(): Promise<{
    totalSales: number
    todaySales: number
    totalRevenue: number
    pendingSales: number
    averageSale: number
  }> {
    try {
      const response = await apiClient.get<{ data: any }>(`${this.baseUrl}/stats`)
      return response.data
    } catch (error) {
      console.error('Error fetching sales stats:', error)
      // Return mock stats for now
      return {
        totalSales: 0,
        todaySales: 0,
        totalRevenue: 0,
        pendingSales: 0,
        averageSale: 0
      }
    }
  }
}

export const salesService = new SalesService()
export default salesService