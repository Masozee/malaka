/**
 * Sales Service
 * Handles API communication for all sales operations
 */

import { apiClient } from '@/lib/api'

// ============ Types ============

export interface SalesOrder {
  id: string
  customer_id: string
  order_date: string
  status: string
  total_amount: number
  created_at: string
  updated_at: string
}

export interface SalesOrderItem {
  id: string
  sales_order_id: string
  article_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface SalesInvoice {
  id: string
  sales_order_id: string
  invoice_date: string
  total_amount: number
  tax_amount: number
  grand_total: number
  created_at: string
  updated_at: string
}

export interface PosTransaction {
  id: string
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
  subtotal?: number
  tax_amount?: number
  discount_amount?: number
  payment_status?: string
  delivery_method?: string
  delivery_status?: string
  commission_rate?: number
  commission_amount?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface PosItem {
  id: string
  pos_transaction_id: string
  article_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface PosTransactionDetail extends PosTransaction {
  items: PosItem[]
}

export interface OnlineOrder {
  id: string
  marketplace: string
  order_id: string
  order_date: string
  total_amount: number
  status: string
  customer_id: string
  created_at: string
  updated_at: string
}

export interface ConsignmentSale {
  id: string
  consignee_id: string
  sales_date: string
  total_amount: number
  status: string
  created_at: string
  updated_at: string
}

export interface SalesReturn {
  id: string
  sales_invoice_id: string
  return_date: string
  reason: string
  total_amount: number
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  discount_rate: number
  min_purchase: number
  created_at: string
  updated_at: string
}

export interface SalesTarget {
  id: string
  user_id: string
  period_start: string
  period_end: string
  target_amount: number
  achieved_amount: number
  created_at: string
  updated_at: string
}

export interface SalesKompetitor {
  id: string
  competitor_name: string
  product_name: string
  price: number
  date_observed: string
  notes: string
  created_at: string
  updated_at: string
}

export interface ProsesMargin {
  id: string
  sales_order_id: string
  cost_of_goods: number
  selling_price: number
  margin_amount: number
  margin_percentage: number
  calculated_at: string
  notes: string
  created_at: string
  updated_at: string
}

export interface SalesRekonsiliasi {
  id: string
  reconciliation_date: string
  sales_amount: number
  payment_amount: number
  discrepancy: number
  status: string
  notes: string
  created_at: string
  updated_at: string
}

// ============ Service ============

const BASE = '/api/v1/sales'

async function fetchList<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await apiClient.get<{ data: T[] }>(`${BASE}/${endpoint}/`)
    return response.data || []
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return []
  }
}

async function fetchOne<T>(endpoint: string, id: string): Promise<T | null> {
  try {
    const response = await apiClient.get<{ data: T }>(`${BASE}/${endpoint}/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching ${endpoint}/${id}:`, error)
    return null
  }
}

async function create<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const response = await apiClient.post<{ data: T }>(`${BASE}/${endpoint}/`, data)
  return response.data
}

async function update<T>(endpoint: string, id: string, data: Record<string, unknown>): Promise<T> {
  const response = await apiClient.put<{ data: T }>(`${BASE}/${endpoint}/${id}`, data)
  return response.data
}

async function remove(endpoint: string, id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${endpoint}/${id}`)
}

// Sales Orders
export const salesOrderService = {
  getAll: () => fetchList<SalesOrder>('orders'),
  getById: (id: string) => fetchOne<SalesOrder>('orders', id),
  create: (data: Record<string, unknown>) => create<SalesOrder>('orders', data),
  update: (id: string, data: Record<string, unknown>) => update<SalesOrder>('orders', id, data),
  delete: (id: string) => remove('orders', id),
}

// Sales Invoices
export const salesInvoiceService = {
  getAll: () => fetchList<SalesInvoice>('invoices'),
  getById: (id: string) => fetchOne<SalesInvoice>('invoices', id),
  create: (data: Record<string, unknown>) => create<SalesInvoice>('invoices', data),
  update: (id: string, data: Record<string, unknown>) => update<SalesInvoice>('invoices', id, data),
  delete: (id: string) => remove('invoices', id),
}

// POS Transactions
export const posTransactionService = {
  getAll: () => fetchList<PosTransaction>('pos-transactions'),
  getById: (id: string) => fetchOne<PosTransactionDetail>('pos-transactions', id),
  create: (data: Record<string, unknown>) => create<PosTransaction>('pos-transactions', data),
  update: (id: string, data: Record<string, unknown>) => update<PosTransaction>('pos-transactions', id, data),
  delete: (id: string) => remove('pos-transactions', id),
}

// Online Orders
export const onlineOrderService = {
  getAll: () => fetchList<OnlineOrder>('online-orders'),
  getById: (id: string) => fetchOne<OnlineOrder>('online-orders', id),
  create: (data: Record<string, unknown>) => create<OnlineOrder>('online-orders', data),
  update: (id: string, data: Record<string, unknown>) => update<OnlineOrder>('online-orders', id, data),
  delete: (id: string) => remove('online-orders', id),
}

// Consignment Sales
export const consignmentSaleService = {
  getAll: () => fetchList<ConsignmentSale>('consignment-sales'),
  getById: (id: string) => fetchOne<ConsignmentSale>('consignment-sales', id),
  create: (data: Record<string, unknown>) => create<ConsignmentSale>('consignment-sales', data),
  update: (id: string, data: Record<string, unknown>) => update<ConsignmentSale>('consignment-sales', id, data),
  delete: (id: string) => remove('consignment-sales', id),
}

// Sales Returns
export const salesReturnService = {
  getAll: () => fetchList<SalesReturn>('returns'),
  getById: (id: string) => fetchOne<SalesReturn>('returns', id),
  create: (data: Record<string, unknown>) => create<SalesReturn>('returns', data),
  update: (id: string, data: Record<string, unknown>) => update<SalesReturn>('returns', id, data),
  delete: (id: string) => remove('returns', id),
}

// Promotions
export const promotionService = {
  getAll: () => fetchList<Promotion>('promotions'),
  getById: (id: string) => fetchOne<Promotion>('promotions', id),
  create: (data: Record<string, unknown>) => create<Promotion>('promotions', data),
  update: (id: string, data: Record<string, unknown>) => update<Promotion>('promotions', id, data),
  delete: (id: string) => remove('promotions', id),
}

// Sales Targets
export const salesTargetService = {
  getAll: () => fetchList<SalesTarget>('targets'),
  getById: (id: string) => fetchOne<SalesTarget>('targets', id),
  create: (data: Record<string, unknown>) => create<SalesTarget>('targets', data),
  update: (id: string, data: Record<string, unknown>) => update<SalesTarget>('targets', id, data),
  delete: (id: string) => remove('targets', id),
}

// Sales Kompetitor
export const salesKompetitorService = {
  getAll: () => fetchList<SalesKompetitor>('kompetitors'),
  getById: (id: string) => fetchOne<SalesKompetitor>('kompetitors', id),
  create: (data: Record<string, unknown>) => create<SalesKompetitor>('kompetitors', data),
  update: (id: string, data: Record<string, unknown>) => update<SalesKompetitor>('kompetitors', id, data),
  delete: (id: string) => remove('kompetitors', id),
}

// Proses Margin
export const prosesMarginService = {
  getAll: () => fetchList<ProsesMargin>('proses-margins'),
  getById: (id: string) => fetchOne<ProsesMargin>('proses-margins', id),
  create: (data: Record<string, unknown>) => create<ProsesMargin>('proses-margins', data),
  update: (id: string, data: Record<string, unknown>) => update<ProsesMargin>('proses-margins', id, data),
  delete: (id: string) => remove('proses-margins', id),
}

// Sales Rekonsiliasi
export const salesRekonsiliasiService = {
  getAll: () => fetchList<SalesRekonsiliasi>('rekonsiliasi'),
  getById: (id: string) => fetchOne<SalesRekonsiliasi>('rekonsiliasi', id),
  create: (data: Record<string, unknown>) => create<SalesRekonsiliasi>('rekonsiliasi', data),
  update: (id: string, data: Record<string, unknown>) => update<SalesRekonsiliasi>('rekonsiliasi', id, data),
  delete: (id: string) => remove('rekonsiliasi', id),
}
