/**
 * Inventory API Services
 * Type-safe API calls for all Inventory endpoints
 */

import { apiClient } from '@/lib/api'

// ===== Stock Control (enriched by backend DTO) =====
export interface StockItem {
  id: string
  code: string
  name: string
  category?: string
  warehouse?: string
  warehouse_code?: string
  currentStock: number
  minStock?: number
  maxStock?: number
  unitCost?: number
  totalValue?: number
  lastUpdated?: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock'
  article_details?: {
    id: string
    name: string
    description: string
    barcode: string
    price: number
  }
  warehouse_details?: {
    id: string
    code: string
    name: string
    city: string
    type: string
    status: string
  }
}

// ===== Goods Receipt (enriched by backend DTO) =====
export interface GoodsReceipt {
  id: string
  purchase_order_id: string
  receipt_date: string
  warehouse_id: string
  created_at?: string
  updated_at?: string
  // Enriched fields from backend DTO (camelCase)
  receiptNumber?: string
  supplierName?: string
  status?: string
  totalAmount?: number
  totalItems?: number
  items?: GoodsReceiptItem[]
  poNumber?: string
  warehouse?: string
  notes?: string
  receivedBy?: string
}

export interface GoodsReceiptItem {
  id: string
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// ===== Goods Issue (enriched by backend DTO) =====
export interface GoodsIssue {
  id: string
  issueNumber: string
  warehouseId: string
  warehouseName: string
  warehouseCode: string
  issueDate: string
  status: string
  notes: string
  totalItems: number
  totalQuantity: number
  createdAt: string
  updatedAt: string
}

export interface GoodsIssueItem {
  id: string
  articleId: string
  articleName: string
  articleCode: string
  quantity: number
  notes: string
}

export interface GoodsIssueDetail extends GoodsIssue {
  items: GoodsIssueItem[]
}

export interface CreateGoodsIssueRequest {
  warehouse_id: string
  issue_date: string
  status: string
  notes?: string
  items?: { article_id: string, quantity: number, notes?: string }[]
}

export interface UpdateGoodsIssueRequest {
  warehouse_id?: string
  issue_date?: string
  status?: string
  notes?: string
}

// ===== Stock Transfer (enriched by backend DTO) =====
export interface StockTransfer {
  id: string
  transferNumber: string
  fromWarehouseId: string
  fromWarehouse: string
  fromCode: string
  toWarehouseId: string
  toWarehouse: string
  toCode: string
  orderDate: string
  status: string
  notes: string
  totalItems: number
  totalQuantity: number
  shippedDate?: string
  receivedDate?: string
  approvedDate?: string
  cancelledDate?: string
  shippedBy?: string
  receivedBy?: string
  approvedBy?: string
  cancelledBy?: string
  createdBy?: string
  shippedByName?: string
  receivedByName?: string
  approvedByName?: string
  cancelledByName?: string
  createdByName?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

export interface StockTransferItem {
  id: string
  articleId: string
  articleName: string
  articleCode: string
  quantity: number
  receivedQuantity: number
  hasDiscrepancy: boolean
}

export interface StockTransferDetail extends StockTransfer {
  items: StockTransferItem[]
}

// ===== Stock Adjustment (enriched by backend DTO) =====
export interface StockAdjustment {
  id: string
  adjustmentNumber: string
  articleId: string
  articleName: string
  articleCode: string
  warehouseId: string
  warehouseName: string
  warehouseCode: string
  quantity: number
  adjustmentDate: string
  reason: string
  createdAt: string
  updatedAt: string
}

// ===== Stock Opname (enriched by backend DTO) =====
export interface StockOpname {
  id: string
  opnameNumber: string
  warehouseId: string
  warehouseName: string
  warehouseCode: string
  opnameDate: string
  status: string
  createdAt: string
  updatedAt: string
}

// ===== Return Supplier (matches backend entity) =====
export interface ReturnSupplier {
  id: string
  returnNumber: string
  supplierId: string
  supplierName: string
  returnDate: string
  reason: string
  createdAt: string
  updatedAt: string
}

// ===== Purchase Order (deprecated - use procurement module) =====
export interface PurchaseOrder {
  id: string
  supplier_id: string
  order_date: string
  status: string
  total_amount: number
  created_at?: string
  updated_at?: string
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
  article?: {
    id: string
    code: string
    name: string
    description: string
  }
}

// ===== Barcode Print Job (no backend endpoint yet) =====
export interface BarcodePrintJob {
  id: string
  jobNumber: string
  jobName: string
  barcodeType: 'ean13' | 'code128' | 'qr' | 'datamatrix' | 'code39'
  template: string
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'paused'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  totalLabels: number
  printedLabels: number
  failedLabels: number
  createdDate: string
  startTime?: string
  completedTime?: string
  printerName: string
  requestedBy: string
  paperSize: string
  labelDimensions: string
  notes?: string
}

export interface InventoryFilters {
  page?: number
  limit?: number
  search?: string
  warehouse?: string
  status?: string
  category?: string
  [key: string]: any
}

// Base CRUD service class for inventory
abstract class BaseInventoryService<T> {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async getAll(filters?: InventoryFilters): Promise<{ data: T[], total: number, page: number, limit: number }> {
    const response = await apiClient.get<{ success: boolean, message: string, data: T[] }>(`/api/v1/inventory/${this.endpoint}/`, filters)
    return {
      data: response.data || [],
      total: response.data?.length || 0,
      page: 1,
      limit: response.data?.length || 0
    }
  }

  async getById(id: string): Promise<T> {
    const response = await apiClient.get<{ success: boolean, message: string, data: T }>(`/api/v1/inventory/${this.endpoint}/${id}`)
    return response.data
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<{ success: boolean, message: string, data: T }>(`/api/v1/inventory/${this.endpoint}/`, data)
    return response.data
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<{ success: boolean, message: string, data: T }>(`/api/v1/inventory/${this.endpoint}/${id}`, data)
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

  // Override getById to use the stock control endpoint
  async getById(id: string): Promise<StockItem> {
    const response = await apiClient.get<{ success: boolean, message: string, data: StockItem }>(`/api/v1/inventory/stock/control/${id}`)
    return response.data
  }

  // Override getAll to use the stock control endpoint
  async getAll(filters?: InventoryFilters): Promise<{ data: StockItem[], total: number, page: number, limit: number }> {
    const backendResponse = await apiClient.get<{ success: boolean, message: string, data: StockItem[] }>(`/api/v1/inventory/stock/control`, filters)
    const stockItems = backendResponse.data || []
    return {
      data: stockItems,
      total: stockItems.length,
      page: 1,
      limit: stockItems.length
    }
  }

  async getStockMovements(filters?: InventoryFilters) {
    const response = await apiClient.get<{ success: boolean, message: string, data: any[] }>('/api/v1/inventory/stock/movements', filters)
    return {
      data: response.data || [],
      total: response.data?.length || 0,
      page: 1,
      limit: response.data?.length || 0
    }
  }

  async recordStockMovement(movement: any) {
    const response = await apiClient.post<{ success: boolean, message: string, data: any }>('/api/v1/inventory/stock/movements', movement)
    return response.data
  }
}

class GoodsReceiptService extends BaseInventoryService<GoodsReceipt> {
  constructor() {
    super('goods-receipts')
  }

  // Override getAll to match backend API response
  async getAll(filters?: InventoryFilters): Promise<{ data: GoodsReceipt[], total: number, page: number, limit: number }> {
    const response = await apiClient.get<{ success: boolean, message: string, data: GoodsReceipt[] }>(`/api/v1/inventory/goods-receipts/`, filters)
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

  async createIssue(data: CreateGoodsIssueRequest): Promise<GoodsIssue> {
    const payload = {
      ...data,
      issue_date: data.issue_date ? new Date(data.issue_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const response = await apiClient.post<{ success: boolean, data: GoodsIssue }>('/api/v1/inventory/goods-issues/', payload)
    return response.data
  }

  async updateIssue(id: string, data: UpdateGoodsIssueRequest): Promise<GoodsIssue> {
    const payload: any = { ...data }
    if (data.issue_date) {
      payload.issue_date = new Date(data.issue_date + 'T00:00:00Z').toISOString()
    }
    const response = await apiClient.put<{ success: boolean, data: GoodsIssue }>(`/api/v1/inventory/goods-issues/${id}`, payload)
    return response.data
  }
}

class StockTransferService extends BaseInventoryService<StockTransfer> {
  constructor() {
    super('transfers')
  }

  async approve(id: string): Promise<StockTransfer> {
    const response = await apiClient.post<{ success: boolean, data: StockTransfer }>(`/api/v1/inventory/transfers/${id}/approve`, {})
    return response.data
  }

  async ship(id: string): Promise<StockTransfer> {
    const response = await apiClient.post<{ success: boolean, data: StockTransfer }>(`/api/v1/inventory/transfers/${id}/ship`, {})
    return response.data
  }

  async receive(id: string, items: { item_id: string, received_quantity: number }[]): Promise<StockTransfer> {
    const response = await apiClient.post<{ success: boolean, data: StockTransfer }>(`/api/v1/inventory/transfers/${id}/receive`, { items })
    return response.data
  }

  async cancel(id: string, reason: string): Promise<StockTransfer> {
    const response = await apiClient.post<{ success: boolean, data: StockTransfer }>(`/api/v1/inventory/transfers/${id}/cancel`, { reason })
    return response.data
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
  async getAll(filters?: InventoryFilters): Promise<{ data: PurchaseOrder[], total: number, page: number, limit: number }> {
    const response = await apiClient.get<{ success: boolean, message: string, data: PurchaseOrder[] }>(`/api/v1/inventory/purchase-orders/`, filters)
    const purchaseOrders = response.data || []

    return {
      data: purchaseOrders,
      total: purchaseOrders.length,
      page: 1,
      limit: purchaseOrders.length
    }
  }
}

class BarcodeService extends BaseInventoryService<BarcodePrintJob> {
  constructor() {
    super('barcode-jobs')
  }
}

class ReturnSupplierService extends BaseInventoryService<ReturnSupplier> {
  constructor() {
    super('return-suppliers')
  }
}

class StockOpnameService extends BaseInventoryService<StockOpname> {
  constructor() {
    super('opnames')
  }
}

// Export service instances
export const stockService = new StockService()
export const goodsReceiptService = new GoodsReceiptService()
export const goodsIssueService = new GoodsIssueService()
export const stockTransferService = new StockTransferService()
export const stockAdjustmentService = new StockAdjustmentService()
export const purchaseOrderService = new PurchaseOrderService()
export const barcodeService = new BarcodeService()
export const returnSupplierService = new ReturnSupplierService()
export const stockOpnameService = new StockOpnameService()

// Export services object for easy import
export const inventoryServices = {
  stock: stockService,
  goodsReceipt: goodsReceiptService,
  goodsIssue: goodsIssueService,
  stockTransfer: stockTransferService,
  stockAdjustment: stockAdjustmentService,
  purchaseOrder: purchaseOrderService,
  barcode: barcodeService,
  returnSupplier: returnSupplierService,
  stockOpname: stockOpnameService
}
