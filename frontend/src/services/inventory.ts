/**
 * Inventory API Services  
 * Type-safe API calls for all Inventory endpoints
 */

import { apiClient } from '@/lib/api'

// Base inventory interfaces
export interface StockItem {
  id: string
  code: string
  name: string
  category?: string
  warehouse?: string
  currentStock: number
  minStock?: number
  maxStock?: number
  unitCost?: number
  totalValue?: number
  lastUpdated?: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
}

export interface GoodsReceipt {
  id: string
  purchase_order_id: string
  receipt_date: string
  warehouse_id: string
  created_at?: string
  updated_at?: string
  // Calculated/joined fields from backend
  receiptNumber?: string
  supplierName?: string
  status?: 'pending' | 'approved' | 'completed'
  totalAmount?: number
  totalItems?: number
  items?: GoodsReceiptItem[]
  // Additional display fields
  poNumber?: string
  expectedDate?: string
  receivedBy?: string
  warehouse?: string
  notes?: string
}

export interface GoodsReceiptItem {
  id: string
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface GoodsIssue {
  id: string
  issueNumber: string
  issueDate: string
  status: 'pending' | 'approved' | 'completed'
  totalItems: number
  destination?: string
  items: GoodsIssueItem[]
}

export interface GoodsIssueItem {
  id: string
  productCode: string
  productName: string
  quantity: number
  unitCost: number
  totalCost: number
}

export interface StockTransfer {
  id: string
  transferNumber: string
  transferDate: string
  fromWarehouse: string
  toWarehouse: string
  status: 'pending' | 'in_transit' | 'completed'
  totalItems: number
  items: StockTransferItem[]
}

export interface StockTransferItem {
  id: string
  productCode: string
  productName: string
  quantity: number
}

export interface StockAdjustment {
  id: string
  adjustmentNumber: string
  adjustmentDate: string
  reason: string
  status: 'pending' | 'approved' | 'completed'
  totalItems: number
  items: StockAdjustmentItem[]
}

export interface StockAdjustmentItem {
  id: string
  productCode: string
  productName: string
  currentStock: number
  adjustedStock: number
  difference: number
  reason: string
}

export interface PurchaseOrder {
  id: string
  supplier_id: string
  order_date: string
  status: string
  total_amount: number
  created_at?: string
  updated_at?: string
  // Related data populated by backend
  supplier?: {
    id: string
    name: string
    code: string
    contact_person: string
    phone: string
    email: string
    address: string
  }
  items?: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  article_id: string
  quantity: number
  unit_price: number
  total_price: number
  // Related data populated by backend
  article?: {
    id: string
    code: string
    name: string
    description: string
  }
}

export interface InventoryFilters {
  page?: number
  limit?: number
  search?: string
  warehouse?: string
  status?: string
  category?: string
}

// Base CRUD service class for inventory
abstract class BaseInventoryService<T> {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async getAll(filters?: InventoryFilters): Promise<{data: T[], total: number, page: number, limit: number}> {
    const response = await apiClient.get<{success: boolean, message: string, data: T[]}>(`/api/v1/inventory/${this.endpoint}`, filters)
    return {
      data: response.data || [],
      total: response.data?.length || 0,
      page: 1,
      limit: response.data?.length || 0
    }
  }

  async getById(id: string): Promise<T> {
    const response = await apiClient.get<{success: boolean, message: string, data: T}>(`/api/v1/inventory/${this.endpoint}/${id}`)
    return response.data
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<{success: boolean, message: string, data: T}>(`/api/v1/inventory/${this.endpoint}`, data)
    return response.data
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<{success: boolean, message: string, data: T}>(`/api/v1/inventory/${this.endpoint}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/inventory/${this.endpoint}/${id}`)
  }
}

// Specific service implementations
class StockService extends BaseInventoryService<StockItem> {
  constructor() {
    super('stock/balance')
  }

  // Override getAll to use the stock control endpoint
  async getAll(filters?: InventoryFilters): Promise<{data: StockItem[], total: number, page: number, limit: number}> {
    const backendResponse = await apiClient.get<{success: boolean, message: string, data: StockItem[]}>(`/api/v1/inventory/stock/control`, filters)
    const stockItems = backendResponse.data || []
    return {
      data: stockItems,
      total: stockItems.length,
      page: 1,
      limit: stockItems.length
    }
  }

  async getStockMovements(filters?: InventoryFilters) {
    const response = await apiClient.get<{success: boolean, message: string, data: any[]}>('/api/v1/inventory/stock/movements', filters)
    return {
      data: response.data || [],
      total: response.data?.length || 0,
      page: 1,
      limit: response.data?.length || 0
    }
  }

  async recordStockMovement(movement: any) {
    const response = await apiClient.post<{success: boolean, message: string, data: any}>('/api/v1/inventory/stock/movements', movement)
    return response.data
  }
}

class GoodsReceiptService extends BaseInventoryService<GoodsReceipt> {
  constructor() {
    super('goods-receipts')
  }

  // Override getAll to match backend API response
  async getAll(filters?: InventoryFilters): Promise<{data: GoodsReceipt[], total: number, page: number, limit: number}> {
    const response = await apiClient.get<{success: boolean, message: string, data: GoodsReceipt[]}>(`/api/v1/inventory/goods-receipts/`, filters)
    const receipts = response.data || []
    
    // Transform the data to add calculated fields
    const transformedReceipts = receipts.map(receipt => ({
      ...receipt,
      receiptNumber: receipt.receiptNumber || `GR-${receipt.id?.slice(-8)}`,
      supplierName: receipt.supplierName || 'Unknown Supplier',
      status: receipt.status || 'pending' as const,
      totalAmount: receipt.totalAmount || 0,
      totalItems: receipt.totalItems || 0,
      poNumber: receipt.poNumber || receipt.purchase_order_id,
      warehouse: receipt.warehouse || 'Main Warehouse',
      expectedDate: receipt.expectedDate || receipt.receipt_date,
      receivedBy: receipt.receivedBy || '',
      notes: receipt.notes || ''
    }))
    
    return {
      data: transformedReceipts,
      total: transformedReceipts.length,
      page: 1,
      limit: transformedReceipts.length
    }
  }
}

class GoodsIssueService extends BaseInventoryService<GoodsIssue> {
  constructor() {
    super('goods-issues')
  }
}

class StockTransferService extends BaseInventoryService<StockTransfer> {
  constructor() {
    super('transfers')
  }
}

class StockAdjustmentService extends BaseInventoryService<StockAdjustment> {
  constructor() {
    super('adjustments')
  }
}

class PurchaseOrderService extends BaseInventoryService<PurchaseOrder> {
  constructor() {
    super('purchase-orders')
  }

  // Override getAll to handle the enhanced purchase order data structure
  async getAll(filters?: InventoryFilters): Promise<{data: PurchaseOrder[], total: number, page: number, limit: number}> {
    const response = await apiClient.get<{success: boolean, message: string, data: PurchaseOrder[]}>(`/api/v1/inventory/purchase-orders/`, filters)
    const purchaseOrders = response.data || []
    
    return {
      data: purchaseOrders,
      total: purchaseOrders.length,
      page: 1,
      limit: purchaseOrders.length
    }
  }
}

// Export service instances
export const stockService = new StockService()
export const goodsReceiptService = new GoodsReceiptService()
export const goodsIssueService = new GoodsIssueService()
export const stockTransferService = new StockTransferService()  
export const stockAdjustmentService = new StockAdjustmentService()
export const purchaseOrderService = new PurchaseOrderService()

// Export services object for easy import
export const inventoryServices = {
  stock: stockService,
  goodsReceipt: goodsReceiptService,
  goodsIssue: goodsIssueService,
  stockTransfer: stockTransferService,
  stockAdjustment: stockAdjustmentService,
  purchaseOrder: purchaseOrderService
}