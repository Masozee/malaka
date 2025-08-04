/**
 * Production Service
 * API service for production-related operations
 */

import { apiClient } from '@/lib/api'
import type { PaginatedResponse, PaginationParams } from '@/lib/api'
import type {
  Supplier,
  Warehouse,
  PurchaseOrder,
  WorkOrder,
  QualityControl,
  ProductionPlan,
  SupplierFilters,
  WarehouseFilters,
  PurchaseOrderFilters,
  WorkOrderFilters,
  QualityControlFilters,
  ProductionPlanFilters,
  SupplierFormData,
  WarehouseFormData,
  PurchaseOrderFormData,
  WorkOrderFormData,
  QualityControlFormData,
  ProductionSummary
} from '@/types/production'

export class ProductionService {
  private static readonly BASE_URL = '/api/v1/production'

  // Supplier methods
  static async getSuppliers(
    params: PaginationParams & SupplierFilters = {}
  ): Promise<PaginatedResponse<Supplier>> {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    )
    return apiClient.get<PaginatedResponse<Supplier>>(`${this.BASE_URL}/suppliers`, filteredParams)
  }

  static async getSupplierById(id: string): Promise<Supplier> {
    return apiClient.get<Supplier>(`${this.BASE_URL}/suppliers/${id}`)
  }

  static async createSupplier(data: SupplierFormData): Promise<Supplier> {
    return apiClient.post<Supplier>(`${this.BASE_URL}/suppliers`, data)
  }

  static async updateSupplier(id: string, data: Partial<SupplierFormData>): Promise<Supplier> {
    return apiClient.put<Supplier>(`${this.BASE_URL}/suppliers/${id}`, data)
  }

  static async deleteSupplier(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_URL}/suppliers/${id}`)
  }

  // Warehouse methods - using masterdata endpoint since warehouses are master data
  static async getWarehouses(
    params: PaginationParams & WarehouseFilters = {}
  ): Promise<{success: boolean, message: string, data: Warehouse[]}> {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    )
    return apiClient.get<{success: boolean, message: string, data: Warehouse[]}>(`/api/v1/masterdata/warehouses/`, filteredParams)
  }

  static async getWarehouseById(id: string): Promise<Warehouse> {
    return apiClient.get<Warehouse>(`/api/v1/masterdata/warehouses/${id}`)
  }

  static async createWarehouse(data: WarehouseFormData): Promise<Warehouse> {
    return apiClient.post<Warehouse>(`/api/v1/masterdata/warehouses`, data)
  }

  static async updateWarehouse(id: string, data: Partial<WarehouseFormData>): Promise<Warehouse> {
    return apiClient.put<Warehouse>(`/api/v1/masterdata/warehouses/${id}`, data)
  }

  static async deleteWarehouse(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/masterdata/warehouses/${id}`)
  }

  // Purchase Order methods
  static async getPurchaseOrders(
    params: PaginationParams & PurchaseOrderFilters = {}
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    )
    return apiClient.get<PaginatedResponse<PurchaseOrder>>(`${this.BASE_URL}/purchase-orders`, filteredParams)
  }

  static async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(`${this.BASE_URL}/purchase-orders/${id}`)
  }

  static async createPurchaseOrder(data: PurchaseOrderFormData): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`${this.BASE_URL}/purchase-orders`, data)
  }

  static async updatePurchaseOrder(id: string, data: Partial<PurchaseOrderFormData>): Promise<PurchaseOrder> {
    return apiClient.put<PurchaseOrder>(`${this.BASE_URL}/purchase-orders/${id}`, data)
  }

  static async deletePurchaseOrder(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_URL}/purchase-orders/${id}`)
  }

  // Work Order methods
  static async getWorkOrders(
    params: PaginationParams & WorkOrderFilters = {}
  ): Promise<{success: boolean, message: string, data: WorkOrder[]}> {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    )
    return apiClient.get<{success: boolean, message: string, data: WorkOrder[]}>(`${this.BASE_URL}/work-orders/`, filteredParams)
  }

  static async getWorkOrderById(id: string): Promise<WorkOrder> {
    return apiClient.get<WorkOrder>(`${this.BASE_URL}/work-orders/${id}`)
  }

  static async createWorkOrder(data: WorkOrderFormData): Promise<WorkOrder> {
    return apiClient.post<WorkOrder>(`${this.BASE_URL}/work-orders`, data)
  }

  static async updateWorkOrder(id: string, data: Partial<WorkOrderFormData>): Promise<WorkOrder> {
    return apiClient.put<WorkOrder>(`${this.BASE_URL}/work-orders/${id}`, data)
  }

  static async deleteWorkOrder(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_URL}/work-orders/${id}`)
  }

  // Quality Control methods
  static async getQualityControls(
    params: PaginationParams & QualityControlFilters = {}
  ): Promise<PaginatedResponse<QualityControl>> {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    )
    return apiClient.get<PaginatedResponse<QualityControl>>(`${this.BASE_URL}/quality-control`, filteredParams)
  }

  static async getQualityControlById(id: string): Promise<QualityControl> {
    return apiClient.get<QualityControl>(`${this.BASE_URL}/quality-control/${id}`)
  }

  static async createQualityControl(data: QualityControlFormData): Promise<QualityControl> {
    return apiClient.post<QualityControl>(`${this.BASE_URL}/quality-control`, data)
  }

  static async updateQualityControl(id: string, data: Partial<QualityControlFormData>): Promise<QualityControl> {
    return apiClient.put<QualityControl>(`${this.BASE_URL}/quality-control/${id}`, data)
  }

  static async deleteQualityControl(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_URL}/quality-control/${id}`)
  }

  // Production Plan methods
  static async getProductionPlans(
    params: PaginationParams & ProductionPlanFilters = {}
  ): Promise<PaginatedResponse<ProductionPlan>> {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    )
    return apiClient.get<PaginatedResponse<ProductionPlan>>(`${this.BASE_URL}/production-plans`, filteredParams)
  }

  static async getProductionPlanById(id: string): Promise<ProductionPlan> {
    return apiClient.get<ProductionPlan>(`${this.BASE_URL}/production-plans/${id}`)
  }

  static async getProductionSummary(): Promise<ProductionSummary> {
    return apiClient.get<ProductionSummary>(`${this.BASE_URL}/summary`)
  }
}

// Mock data for development
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    code: 'SUP001',
    name: 'PT Bahan Baku Indonesia',
    email: 'orders@bahanbaku.co.id',
    phone: '021-555-0001',
    address: 'Jl. Industri No. 123',
    city: 'Jakarta',
    country: 'Indonesia',
    contactPerson: 'Ahmad Supplier',
    paymentTerms: 'Net 30',
    status: 'active',
    rating: 4.5,
    totalOrders: 156,
    totalValue: 2450000000,
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2024-07-20T14:30:00Z'
  },
  {
    id: '2',
    code: 'SUP002',
    name: 'CV Kulit Prima',
    email: 'info@kulitprima.com',
    phone: '031-555-0002',
    address: 'Jl. Raya Sepatu No. 45',
    city: 'Surabaya',
    country: 'Indonesia',
    contactPerson: 'Sari Leather',
    paymentTerms: 'Net 15',
    status: 'active',
    rating: 4.8,
    totalOrders: 89,
    totalValue: 1890000000,
    createdAt: '2023-03-10T10:15:00Z',
    updatedAt: '2024-07-22T09:45:00Z'
  },
  {
    id: '3',
    code: 'SUP003',
    name: 'Sole & Rubber Co',
    email: 'sales@solerubber.co.id',
    phone: '022-555-0003',
    address: 'Kawasan Industri Bandung',
    city: 'Bandung',
    country: 'Indonesia',
    contactPerson: 'Dedi Rubber',
    paymentTerms: 'Net 45',
    status: 'active',
    rating: 4.2,
    totalOrders: 203,
    totalValue: 3200000000,
    createdAt: '2022-11-20T15:30:00Z',
    updatedAt: '2024-07-18T16:20:00Z'
  }
]

export const mockWarehouses: Warehouse[] = [
  {
    id: '1',
    code: 'WH001',
    name: 'Main Warehouse Jakarta',
    type: 'main',
    address: 'Jl. Gudang Raya No. 100',
    city: 'Jakarta',
    capacity: 50000,
    currentStock: 32500,
    manager: 'Budi Warehouse',
    phone: '021-555-1001',
    status: 'active',
    zones: [
      { id: '1', code: 'A01', name: 'Raw Materials A', type: 'storage', capacity: 15000, currentStock: 9800 },
      { id: '2', code: 'B01', name: 'Finished Goods B', type: 'storage', capacity: 20000, currentStock: 13200 },
      { id: '3', code: 'P01', name: 'Picking Zone', type: 'picking', capacity: 5000, currentStock: 3500 },
      { id: '4', code: 'S01', name: 'Staging Area', type: 'staging', capacity: 10000, currentStock: 6000 }
    ],
    createdAt: '2022-01-01T00:00:00Z',
    updatedAt: '2024-07-25T08:30:00Z'
  },
  {
    id: '2',
    code: 'WH002',
    name: 'Satellite Warehouse Surabaya',
    type: 'satellite',
    address: 'Jl. Industri Surabaya No. 75',
    city: 'Surabaya',
    capacity: 25000,
    currentStock: 18200,
    manager: 'Sari Gudang',
    phone: '031-555-1002',
    status: 'active',
    zones: [
      { id: '5', code: 'A02', name: 'Materials Storage', type: 'storage', capacity: 15000, currentStock: 11200 },
      { id: '6', code: 'P02', name: 'Pick & Pack', type: 'picking', capacity: 10000, currentStock: 7000 }
    ],
    createdAt: '2022-06-15T10:00:00Z',
    updatedAt: '2024-07-23T14:15:00Z'
  }
]

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    supplierId: '1',
    supplier: { id: '1', code: 'SUP001', name: 'PT Bahan Baku Indonesia', email: 'orders@bahanbaku.co.id' },
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    orderDate: '2024-07-20',
    expectedDate: '2024-07-30',
    deliveredDate: undefined,
    status: 'confirmed',
    priority: 'normal',
    items: [
      {
        id: '1',
        articleId: 'ART001',
        articleCode: 'LEATHER-001',
        articleName: 'Premium Leather Black',
        quantity: 100,
        unitPrice: 150000,
        totalPrice: 15000000,
        receivedQuantity: 0,
        pendingQuantity: 100,
        specifications: 'Full grain leather, 2mm thickness'
      },
      {
        id: '2',
        articleId: 'ART002',
        articleCode: 'SOLE-001',
        articleName: 'Rubber Sole Premium',
        quantity: 100,
        unitPrice: 85000,
        totalPrice: 8500000,
        receivedQuantity: 0,
        pendingQuantity: 100,
        specifications: 'Anti-slip, size 39-44'
      }
    ],
    subtotal: 23500000,
    taxAmount: 2350000,
    shippingCost: 150000,
    totalAmount: 26000000,
    notes: 'Urgent order for new product line',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: 'manager@malaka.co.id',
    createdAt: '2024-07-20T09:00:00Z',
    updatedAt: '2024-07-22T11:30:00Z'
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    supplierId: '2',
    supplier: { id: '2', code: 'SUP002', name: 'CV Kulit Prima', email: 'info@kulitprima.com' },
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    orderDate: '2024-07-22',
    expectedDate: '2024-08-05',
    deliveredDate: undefined,
    status: 'sent',
    priority: 'high',
    items: [
      {
        id: '3',
        articleId: 'ART003',
        articleCode: 'LEATHER-002',
        articleName: 'Suede Leather Brown',
        quantity: 150,
        unitPrice: 180000,
        totalPrice: 27000000,
        receivedQuantity: 0,
        pendingQuantity: 150,
        specifications: 'Premium suede, 1.8mm thickness'
      },
      {
        id: '4',
        articleId: 'ART004',
        articleCode: 'LINING-001',
        articleName: 'Fabric Lining Beige',
        quantity: 300,
        unitPrice: 25000,
        totalPrice: 7500000,
        receivedQuantity: 0,
        pendingQuantity: 300,
        specifications: 'Breathable fabric lining'
      }
    ],
    subtotal: 34500000,
    taxAmount: 3450000,
    shippingCost: 200000,
    totalAmount: 38150000,
    notes: 'Premium leather for luxury line',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: undefined,
    createdAt: '2024-07-22T14:15:00Z',
    updatedAt: '2024-07-22T14:15:00Z'
  },
  {
    id: '3',
    orderNumber: 'PO-2024-003',
    supplierId: '3',
    supplier: { id: '3', code: 'SUP003', name: 'Sole & Rubber Co', email: 'sales@solerubber.co.id' },
    warehouseId: '2',
    warehouse: { id: '2', code: 'WH002', name: 'Satellite Warehouse Surabaya' },
    orderDate: '2024-07-18',
    expectedDate: '2024-07-28',
    deliveredDate: '2024-07-26T16:30:00Z',
    status: 'delivered',
    priority: 'normal',
    items: [
      {
        id: '5',
        articleId: 'ART005',
        articleCode: 'SOLE-002',
        articleName: 'EVA Sole White',
        quantity: 200,
        unitPrice: 65000,
        totalPrice: 13000000,
        receivedQuantity: 200,
        pendingQuantity: 0,
        specifications: 'Lightweight EVA, density 0.2'
      },
      {
        id: '6',
        articleId: 'ART006',
        articleCode: 'HEEL-001',
        articleName: 'Rubber Heel Black',
        quantity: 80,
        unitPrice: 45000,
        totalPrice: 3600000,
        receivedQuantity: 80,
        pendingQuantity: 0,
        specifications: 'Anti-slip rubber heel'
      }
    ],
    subtotal: 16600000,
    taxAmount: 1660000,
    shippingCost: 120000,
    totalAmount: 18380000,
    notes: 'Regular monthly order',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: 'manager@malaka.co.id',
    createdAt: '2024-07-18T10:20:00Z',
    updatedAt: '2024-07-26T16:30:00Z'
  },
  {
    id: '4',
    orderNumber: 'PO-2024-004',
    supplierId: '1',
    supplier: { id: '1', code: 'SUP001', name: 'PT Bahan Baku Indonesia', email: 'orders@bahanbaku.co.id' },
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    orderDate: '2024-07-25',
    expectedDate: '2024-08-08',
    deliveredDate: undefined,
    status: 'draft',
    priority: 'low',
    items: [
      {
        id: '7',
        articleId: 'ART007',
        articleCode: 'THREAD-001',
        articleName: 'Polyester Thread Black',
        quantity: 500,
        unitPrice: 8000,
        totalPrice: 4000000,
        receivedQuantity: 0,
        pendingQuantity: 500,
        specifications: '40/2 polyester thread'
      },
      {
        id: '8',
        articleId: 'ART008',
        articleCode: 'GLUE-001',
        articleName: 'Shoe Adhesive Clear',
        quantity: 50,
        unitPrice: 35000,
        totalPrice: 1750000,
        receivedQuantity: 0,
        pendingQuantity: 50,
        specifications: 'High-strength polyurethane adhesive'
      }
    ],
    subtotal: 5750000,
    taxAmount: 575000,
    shippingCost: 80000,
    totalAmount: 6405000,
    notes: 'Consumables restocking',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: undefined,
    createdAt: '2024-07-25T11:45:00Z',
    updatedAt: '2024-07-25T11:45:00Z'
  },
  {
    id: '5',
    orderNumber: 'PO-2024-005',
    supplierId: '2',
    supplier: { id: '2', code: 'SUP002', name: 'CV Kulit Prima', email: 'info@kulitprima.com' },
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    orderDate: '2024-07-21',
    expectedDate: '2024-08-02',
    deliveredDate: undefined,
    status: 'partial',
    priority: 'high',
    items: [
      {
        id: '9',
        articleId: 'ART009',
        articleCode: 'LEATHER-003',
        articleName: 'Patent Leather Red',
        quantity: 80,
        unitPrice: 220000,
        totalPrice: 17600000,
        receivedQuantity: 40,
        pendingQuantity: 40,
        specifications: 'High-gloss patent leather'
      },
      {
        id: '10',
        articleId: 'ART010',
        articleCode: 'BUCKLE-001',
        articleName: 'Metal Buckle Silver',
        quantity: 100,
        unitPrice: 15000,
        totalPrice: 1500000,
        receivedQuantity: 100,
        pendingQuantity: 0,
        specifications: 'Stainless steel buckle'
      }
    ],
    subtotal: 19100000,
    taxAmount: 1910000,
    shippingCost: 150000,
    totalAmount: 21160000,
    notes: 'Partial delivery due to supply shortage',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: 'manager@malaka.co.id',
    createdAt: '2024-07-21T09:30:00Z',
    updatedAt: '2024-07-24T13:20:00Z'
  },
  {
    id: '6',
    orderNumber: 'PO-2024-006',
    supplierId: '3',
    supplier: { id: '3', code: 'SUP003', name: 'Sole & Rubber Co', email: 'sales@solerubber.co.id' },
    warehouseId: '2',
    warehouse: { id: '2', code: 'WH002', name: 'Satellite Warehouse Surabaya' },
    orderDate: '2024-07-26',
    expectedDate: '2024-08-10',
    deliveredDate: undefined,
    status: 'cancelled',
    priority: 'normal',
    items: [
      {
        id: '11',
        articleId: 'ART011',
        articleCode: 'SOLE-003',
        articleName: 'Crepe Sole Natural',
        quantity: 120,
        unitPrice: 95000,
        totalPrice: 11400000,
        receivedQuantity: 0,
        pendingQuantity: 0,
        specifications: 'Natural crepe rubber sole'
      }
    ],
    subtotal: 11400000,
    taxAmount: 1140000,
    shippingCost: 100000,
    totalAmount: 12640000,
    notes: 'Cancelled due to quality concerns',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: undefined,
    createdAt: '2024-07-26T15:00:00Z',
    updatedAt: '2024-07-27T10:15:00Z'
  },
  {
    id: '7',
    orderNumber: 'PO-2024-007',
    supplierId: '1',
    supplier: { id: '1', code: 'SUP001', name: 'PT Bahan Baku Indonesia', email: 'orders@bahanbaku.co.id' },
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    orderDate: '2024-07-19',
    expectedDate: '2024-07-29',
    deliveredDate: undefined,
    status: 'confirmed',
    priority: 'urgent',
    items: [
      {
        id: '12',
        articleId: 'ART012',
        articleCode: 'LEATHER-004',
        articleName: 'Nappa Leather Navy',
        quantity: 60,
        unitPrice: 280000,
        totalPrice: 16800000,
        receivedQuantity: 0,
        pendingQuantity: 60,
        specifications: 'Soft nappa leather, premium grade'
      },
      {
        id: '13',
        articleId: 'ART013',
        articleCode: 'ZIPPER-001',
        articleName: 'YKK Zipper Black',
        quantity: 200,
        unitPrice: 12000,
        totalPrice: 2400000,
        receivedQuantity: 0,
        pendingQuantity: 200,
        specifications: 'Heavy-duty YKK zipper'
      }
    ],
    subtotal: 19200000,
    taxAmount: 1920000,
    shippingCost: 180000,
    totalAmount: 21300000,
    notes: 'Rush order for special collection',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: 'manager@malaka.co.id',
    createdAt: '2024-07-19T08:15:00Z',
    updatedAt: '2024-07-19T16:45:00Z'
  },
  {
    id: '8',
    orderNumber: 'PO-2024-008',
    supplierId: '2',
    supplier: { id: '2', code: 'SUP002', name: 'CV Kulit Prima', email: 'info@kulitprima.com' },
    warehouseId: '2',
    warehouse: { id: '2', code: 'WH002', name: 'Satellite Warehouse Surabaya' },
    orderDate: '2024-07-23',
    expectedDate: '2024-08-06',
    deliveredDate: undefined,
    status: 'sent',
    priority: 'normal',
    items: [
      {
        id: '14',
        articleId: 'ART014',
        articleCode: 'FABRIC-001',
        articleName: 'Canvas Fabric Olive',
        quantity: 250,
        unitPrice: 45000,
        totalPrice: 11250000,
        receivedQuantity: 0,
        pendingQuantity: 250,
        specifications: '12oz canvas fabric'
      },
      {
        id: '15',
        articleId: 'ART015',
        articleCode: 'EYELET-001',
        articleName: 'Brass Eyelets Gold',
        quantity: 1000,
        unitPrice: 2500,
        totalPrice: 2500000,
        receivedQuantity: 0,
        pendingQuantity: 1000,
        specifications: '5mm brass eyelets'
      }
    ],
    subtotal: 13750000,
    taxAmount: 1375000,
    shippingCost: 130000,
    totalAmount: 15255000,
    notes: 'Materials for casual line',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: 'supervisor@malaka.co.id',
    createdAt: '2024-07-23T12:30:00Z',
    updatedAt: '2024-07-23T12:30:00Z'
  },
  {
    id: '9',
    orderNumber: 'PO-2024-009',
    supplierId: '3',
    supplier: { id: '3', code: 'SUP003', name: 'Sole & Rubber Co', email: 'sales@solerubber.co.id' },
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    orderDate: '2024-07-24',
    expectedDate: '2024-08-07',
    deliveredDate: undefined,
    status: 'confirmed',
    priority: 'high',
    items: [
      {
        id: '16',
        articleId: 'ART016',
        articleCode: 'SOLE-004',
        articleName: 'TPU Sole Clear',
        quantity: 180,
        unitPrice: 75000,
        totalPrice: 13500000,
        receivedQuantity: 0,
        pendingQuantity: 180,
        specifications: 'Transparent TPU sole'
      },
      {
        id: '17',
        articleId: 'ART017',
        articleCode: 'INSOLE-001',
        articleName: 'Memory Foam Insole',
        quantity: 200,
        unitPrice: 30000,
        totalPrice: 6000000,
        receivedQuantity: 0,
        pendingQuantity: 200,
        specifications: 'High-density memory foam'
      }
    ],
    subtotal: 19500000,
    taxAmount: 1950000,
    shippingCost: 170000,
    totalAmount: 21620000,
    notes: 'Premium comfort materials',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: 'manager@malaka.co.id',
    createdAt: '2024-07-24T10:45:00Z',
    updatedAt: '2024-07-24T14:20:00Z'
  },
  {
    id: '10',
    orderNumber: 'PO-2024-010',
    supplierId: '1',
    supplier: { id: '1', code: 'SUP001', name: 'PT Bahan Baku Indonesia', email: 'orders@bahanbaku.co.id' },
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    orderDate: '2024-07-15',
    expectedDate: '2024-07-25',
    deliveredDate: '2024-07-24T14:00:00Z',
    status: 'delivered',
    priority: 'normal',
    items: [
      {
        id: '18',
        articleId: 'ART018',
        articleCode: 'POLISH-001',
        articleName: 'Leather Polish Black',
        quantity: 100,
        unitPrice: 18000,
        totalPrice: 1800000,
        receivedQuantity: 100,
        pendingQuantity: 0,
        specifications: 'Premium wax-based polish'
      },
      {
        id: '19',
        articleId: 'ART019',
        articleCode: 'CLEANER-001',
        articleName: 'Leather Cleaner',
        quantity: 80,
        unitPrice: 22000,
        totalPrice: 1760000,
        receivedQuantity: 80,
        pendingQuantity: 0,
        specifications: 'pH-balanced leather cleaner'
      }
    ],
    subtotal: 3560000,
    taxAmount: 356000,
    shippingCost: 60000,
    totalAmount: 3976000,
    notes: 'Maintenance supplies',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: 'supervisor@malaka.co.id',
    createdAt: '2024-07-15T09:20:00Z',
    updatedAt: '2024-07-24T14:00:00Z'
  },
  {
    id: '11',
    orderNumber: 'PO-2024-011',
    supplierId: '2',
    supplier: { id: '2', code: 'SUP002', name: 'CV Kulit Prima', email: 'info@kulitprima.com' },
    warehouseId: '2',
    warehouse: { id: '2', code: 'WH002', name: 'Satellite Warehouse Surabaya' },
    orderDate: '2024-07-27',
    expectedDate: '2024-08-12',
    deliveredDate: undefined,
    status: 'draft',
    priority: 'low',
    items: [
      {
        id: '20',
        articleId: 'ART020',
        articleCode: 'LEATHER-005',
        articleName: 'Vintage Leather Tan',
        quantity: 90,
        unitPrice: 195000,
        totalPrice: 17550000,
        receivedQuantity: 0,
        pendingQuantity: 90,
        specifications: 'Distressed vintage finish'
      }
    ],
    subtotal: 17550000,
    taxAmount: 1755000,
    shippingCost: 140000,
    totalAmount: 19445000,
    notes: 'For heritage collection development',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: undefined,
    createdAt: '2024-07-27T16:30:00Z',
    updatedAt: '2024-07-27T16:30:00Z'
  },
  {
    id: '12',
    orderNumber: 'PO-2024-012',
    supplierId: '3',
    supplier: { id: '3', code: 'SUP003', name: 'Sole & Rubber Co', email: 'sales@solerubber.co.id' },
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    orderDate: '2024-07-28',
    expectedDate: '2024-08-15',
    deliveredDate: undefined,
    status: 'sent',
    priority: 'urgent',
    items: [
      {
        id: '21',
        articleId: 'ART021',
        articleCode: 'SOLE-005',
        articleName: 'Vibram Sole Black',
        quantity: 150,
        unitPrice: 120000,
        totalPrice: 18000000,
        receivedQuantity: 0,
        pendingQuantity: 150,
        specifications: 'Premium Vibram outdoor sole'
      },
      {
        id: '22',
        articleId: 'ART022',
        articleCode: 'SHANK-001',
        articleName: 'Steel Shank',
        quantity: 150,
        unitPrice: 25000,
        totalPrice: 3750000,
        receivedQuantity: 0,
        pendingQuantity: 150,
        specifications: 'Tempered steel arch support'
      }
    ],
    subtotal: 21750000,
    taxAmount: 2175000,
    shippingCost: 200000,
    totalAmount: 24125000,
    notes: 'Premium outdoor collection materials',
    createdBy: 'purchasing@malaka.co.id',
    approvedBy: 'manager@malaka.co.id',
    createdAt: '2024-07-28T13:15:00Z',
    updatedAt: '2024-07-28T13:15:00Z'
  }
]

export const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    workOrderNumber: 'WO-2024-001',
    type: 'production',
    productId: 'PROD001',
    productCode: 'SHOE-001',
    productName: 'Classic Oxford Brown',
    quantity: 50,
    plannedStartDate: '2024-07-25',
    plannedEndDate: '2024-07-30',
    actualStartDate: '2024-07-25',
    actualEndDate: undefined,
    status: 'in_progress',
    priority: 'high',
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    assignedTo: ['EMP001', 'EMP002', 'EMP003'],
    supervisor: 'EMP004',
    materials: [
      {
        id: '1',
        articleId: 'ART001',
        articleCode: 'LEATHER-001',
        articleName: 'Premium Leather Brown',
        requiredQuantity: 50,
        allocatedQuantity: 50,
        consumedQuantity: 25,
        unitCost: 150000,
        totalCost: 7500000,
        wasteQuantity: 2
      },
      {
        id: '2',
        articleId: 'ART002',
        articleCode: 'SOLE-001',
        articleName: 'Rubber Sole Premium',
        requiredQuantity: 50,
        allocatedQuantity: 50,
        consumedQuantity: 25,
        unitCost: 85000,
        totalCost: 4250000,
        wasteQuantity: 1
      }
    ],
    operations: [
      {
        id: '1',
        operationNumber: 1,
        name: 'Cutting',
        description: 'Cut leather according to patterns',
        plannedDuration: 8,
        actualDuration: 6,
        status: 'completed',
        assignedTo: 'EMP001',
        machineId: 'MACH001',
        startTime: '2024-07-25T08:00:00Z',
        endTime: '2024-07-25T14:00:00Z',
        notes: 'Completed ahead of schedule'
      },
      {
        id: '2',
        operationNumber: 2,
        name: 'Stitching',
        description: 'Stitch upper parts together',
        plannedDuration: 12,
        actualDuration: 8,
        status: 'in_progress',
        assignedTo: 'EMP002',
        machineId: 'MACH002',
        startTime: '2024-07-25T14:00:00Z',
        endTime: undefined,
        notes: 'Progress going well'
      },
      {
        id: '3',
        operationNumber: 3,
        name: 'Assembly',
        description: 'Attach sole to upper',
        plannedDuration: 6,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP003',
        machineId: 'MACH003',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      }
    ],
    totalCost: 15000000,
    actualCost: 8750000,
    efficiency: 85.5,
    qualityScore: 0,
    notes: 'Priority order for VIP customer',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-24T16:00:00Z',
    updatedAt: '2024-07-25T14:30:00Z'
  },
  {
    id: '2',
    workOrderNumber: 'WO-2024-002',
    type: 'production',
    productId: 'PROD002',
    productCode: 'SHOE-002',
    productName: 'Sports Sneaker White',
    quantity: 100,
    plannedStartDate: '2024-07-28',
    plannedEndDate: '2024-08-05',
    actualStartDate: undefined,
    actualEndDate: undefined,
    status: 'scheduled',
    priority: 'normal',
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    assignedTo: ['EMP005', 'EMP006', 'EMP007', 'EMP008'],
    supervisor: 'EMP009',
    materials: [
      {
        id: '3',
        articleId: 'ART003',
        articleCode: 'FABRIC-001',
        articleName: 'Canvas Fabric White',
        requiredQuantity: 100,
        allocatedQuantity: 100,
        consumedQuantity: 0,
        unitCost: 45000,
        totalCost: 4500000,
        wasteQuantity: 0
      },
      {
        id: '4',
        articleId: 'ART004',
        articleCode: 'SOLE-002',
        articleName: 'EVA Sole White',
        requiredQuantity: 100,
        allocatedQuantity: 100,
        consumedQuantity: 0,
        unitCost: 65000,
        totalCost: 6500000,
        wasteQuantity: 0
      },
      {
        id: '5',
        articleId: 'ART005',
        articleCode: 'LACES-001',
        articleName: 'Polyester Laces White',
        requiredQuantity: 200,
        allocatedQuantity: 200,
        consumedQuantity: 0,
        unitCost: 5000,
        totalCost: 1000000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '4',
        operationNumber: 1,
        name: 'Pattern Cutting',
        description: 'Cut fabric according to sneaker patterns',
        plannedDuration: 10,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP005',
        machineId: 'MACH004',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '5',
        operationNumber: 2,
        name: 'Stitching & Assembly',
        description: 'Stitch upper parts and prepare for sole attachment',
        plannedDuration: 16,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP006',
        machineId: 'MACH005',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '6',
        operationNumber: 3,
        name: 'Sole Molding',
        description: 'Mold and attach EVA soles',
        plannedDuration: 8,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP007',
        machineId: 'MACH006',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '7',
        operationNumber: 4,
        name: 'Finishing',
        description: 'Add laces, final inspection, packaging',
        plannedDuration: 6,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP008',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      }
    ],
    totalCost: 25000000,
    actualCost: 0,
    efficiency: 0,
    qualityScore: 0,
    notes: 'Large batch for sports retail chain',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-26T10:00:00Z',
    updatedAt: '2024-07-26T10:00:00Z'
  },
  {
    id: '3',
    workOrderNumber: 'WO-2024-003',
    type: 'production',
    productId: 'PROD003',
    productCode: 'BOOT-001',
    productName: 'Work Boot Black',
    quantity: 75,
    plannedStartDate: '2024-07-22',
    plannedEndDate: '2024-07-28',
    actualStartDate: '2024-07-22',
    actualEndDate: '2024-07-27',
    status: 'completed',
    priority: 'high',
    warehouseId: '2',
    warehouse: { id: '2', code: 'WH002', name: 'Satellite Warehouse Surabaya' },
    assignedTo: ['EMP010', 'EMP011'],
    supervisor: 'EMP012',
    materials: [
      {
        id: '6',
        articleId: 'ART006',
        articleCode: 'LEATHER-002',
        articleName: 'Work Leather Black',
        requiredQuantity: 75,
        allocatedQuantity: 75,
        consumedQuantity: 75,
        unitCost: 180000,
        totalCost: 13500000,
        wasteQuantity: 3
      },
      {
        id: '7',
        articleId: 'ART007',
        articleCode: 'SOLE-003',
        articleName: 'Rubber Work Sole',
        requiredQuantity: 75,
        allocatedQuantity: 75,
        consumedQuantity: 75,
        unitCost: 95000,
        totalCost: 7125000,
        wasteQuantity: 1
      },
      {
        id: '8',
        articleId: 'ART008',
        articleCode: 'STEEL-001',
        articleName: 'Steel Toe Cap',
        requiredQuantity: 75,
        allocatedQuantity: 75,
        consumedQuantity: 75,
        unitCost: 45000,
        totalCost: 3375000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '8',
        operationNumber: 1,
        name: 'Leather Cutting',
        description: 'Cut thick work leather with reinforcement patterns',
        plannedDuration: 12,
        actualDuration: 11,
        status: 'completed',
        assignedTo: 'EMP010',
        machineId: 'MACH007',
        startTime: '2024-07-22T08:00:00Z',
        endTime: '2024-07-22T19:00:00Z',
        notes: 'Good efficiency with new cutting die'
      },
      {
        id: '9',
        operationNumber: 2,
        name: 'Steel Toe Installation',
        description: 'Install and secure steel toe caps',
        plannedDuration: 6,
        actualDuration: 6,
        status: 'completed',
        assignedTo: 'EMP011',
        machineId: 'MACH008',
        startTime: '2024-07-23T08:00:00Z',
        endTime: '2024-07-23T14:00:00Z',
        notes: 'All steel caps passed quality check'
      },
      {
        id: '10',
        operationNumber: 3,
        name: 'Heavy Stitching',
        description: 'Double-stitch upper with reinforced thread',
        plannedDuration: 18,
        actualDuration: 16,
        status: 'completed',
        assignedTo: 'EMP010',
        machineId: 'MACH009',
        startTime: '2024-07-23T14:00:00Z',
        endTime: '2024-07-24T22:00:00Z',
        notes: 'Machine performed well, ahead of schedule'
      },
      {
        id: '11',
        operationNumber: 4,
        name: 'Sole Bonding',
        description: 'Bond heavy-duty sole with industrial adhesive',
        plannedDuration: 8,
        actualDuration: 8,
        status: 'completed',
        assignedTo: 'EMP011',
        machineId: 'MACH010',
        startTime: '2024-07-25T08:00:00Z',
        endTime: '2024-07-25T16:00:00Z',
        notes: 'Strong bond achieved, passed pull tests'
      },
      {
        id: '12',
        operationNumber: 5,
        name: 'Quality Control',
        description: 'Final inspection and safety compliance check',
        plannedDuration: 4,
        actualDuration: 3,
        status: 'completed',
        assignedTo: 'EMP012',
        machineId: undefined,
        startTime: '2024-07-26T13:00:00Z',
        endTime: '2024-07-26T16:00:00Z',
        notes: '100% pass rate, excellent quality'
      }
    ],
    totalCost: 32500000,
    actualCost: 31200000,
    efficiency: 92.8,
    qualityScore: 98.5,
    notes: 'Industrial order completed successfully',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-20T14:00:00Z',
    updatedAt: '2024-07-27T16:30:00Z'
  },
  {
    id: '4',
    workOrderNumber: 'WO-2024-004',
    type: 'assembly',
    productId: 'PROD004',
    productCode: 'SANDAL-001',
    productName: 'Summer Sandal Brown',
    quantity: 200,
    plannedStartDate: '2024-07-30',
    plannedEndDate: '2024-08-03',
    actualStartDate: undefined,
    actualEndDate: undefined,
    status: 'draft',
    priority: 'normal',
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    assignedTo: ['EMP013', 'EMP014'],
    supervisor: 'EMP015',
    materials: [
      {
        id: '9',
        articleId: 'ART009',
        articleCode: 'LEATHER-003',
        articleName: 'Sandal Leather Brown',
        requiredQuantity: 200,
        allocatedQuantity: 0,
        consumedQuantity: 0,
        unitCost: 65000,
        totalCost: 13000000,
        wasteQuantity: 0
      },
      {
        id: '10',
        articleId: 'ART010',
        articleCode: 'SOLE-004',
        articleName: 'EVA Sandal Sole',
        requiredQuantity: 200,
        allocatedQuantity: 0,
        consumedQuantity: 0,
        unitCost: 35000,
        totalCost: 7000000,
        wasteQuantity: 0
      },
      {
        id: '11',
        articleId: 'ART011',
        articleCode: 'STRAP-001',
        articleName: 'Adjustable Strap Brown',
        requiredQuantity: 400,
        allocatedQuantity: 0,
        consumedQuantity: 0,
        unitCost: 15000,
        totalCost: 6000000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '13',
        operationNumber: 1,
        name: 'Strap Cutting',
        description: 'Cut and prepare leather straps',
        plannedDuration: 6,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP013',
        machineId: 'MACH011',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '14',
        operationNumber: 2,
        name: 'Sole Preparation',
        description: 'Prepare EVA soles and attachment points',
        plannedDuration: 4,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP014',
        machineId: 'MACH012',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '15',
        operationNumber: 3,
        name: 'Assembly',
        description: 'Assemble straps to sole base',
        plannedDuration: 8,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP013',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      }
    ],
    totalCost: 26000000,
    actualCost: 0,
    efficiency: 0,
    qualityScore: 0,
    notes: 'Summer collection batch for retail stores',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-28T09:30:00Z',
    updatedAt: '2024-07-28T09:30:00Z'
  },
  {
    id: '5',
    workOrderNumber: 'WO-2024-005',
    type: 'production',
    productId: 'PROD005',
    productCode: 'SHOE-003',
    productName: 'Formal Loafer Black',
    quantity: 60,
    plannedStartDate: '2024-07-26',
    plannedEndDate: '2024-08-01',
    actualStartDate: '2024-07-26',
    actualEndDate: undefined,
    status: 'paused',
    priority: 'low',
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    assignedTo: ['EMP016', 'EMP017'],
    supervisor: 'EMP018',
    materials: [
      {
        id: '12',
        articleId: 'ART012',
        articleCode: 'LEATHER-004',
        articleName: 'Patent Leather Black',
        requiredQuantity: 60,
        allocatedQuantity: 60,
        consumedQuantity: 15,
        unitCost: 220000,
        totalCost: 13200000,
        wasteQuantity: 1
      },
      {
        id: '13',
        articleId: 'ART013',
        articleCode: 'SOLE-005',
        articleName: 'Leather Sole Brown',
        requiredQuantity: 60,
        allocatedQuantity: 60,
        consumedQuantity: 15,
        unitCost: 85000,
        totalCost: 5100000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '16',
        operationNumber: 1,
        name: 'Pattern Cutting',
        description: 'Precision cutting of patent leather',
        plannedDuration: 8,
        actualDuration: 4,
        status: 'completed',
        assignedTo: 'EMP016',
        machineId: 'MACH013',
        startTime: '2024-07-26T08:00:00Z',
        endTime: '2024-07-26T12:00:00Z',
        notes: 'Clean cuts achieved'
      },
      {
        id: '17',
        operationNumber: 2,
        name: 'Upper Construction',
        description: 'Stitch and shape upper parts',
        plannedDuration: 12,
        actualDuration: 6,
        status: 'paused',
        assignedTo: 'EMP017',
        machineId: 'MACH014',
        startTime: '2024-07-26T13:00:00Z',
        endTime: undefined,
        notes: 'Paused due to machine maintenance requirement'
      }
    ],
    totalCost: 22000000,
    actualCost: 5500000,
    efficiency: 75.0,
    qualityScore: 0,
    notes: 'Production paused for machine maintenance',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-25T11:00:00Z',
    updatedAt: '2024-07-26T15:30:00Z'
  },
  {
    id: '6',
    workOrderNumber: 'WO-2024-006',
    type: 'repair',
    productId: 'PROD006',
    productCode: 'SHOE-004',
    productName: 'Luxury Heel Black',
    quantity: 25,
    plannedStartDate: '2024-07-29',
    plannedEndDate: '2024-08-02',
    actualStartDate: undefined,
    actualEndDate: undefined,
    status: 'cancelled',
    priority: 'urgent',
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    assignedTo: ['EMP019'],
    supervisor: 'EMP020',
    materials: [
      {
        id: '14',
        articleId: 'ART014',
        articleCode: 'HEEL-001',
        articleName: 'Stiletto Heel 10cm',
        requiredQuantity: 25,
        allocatedQuantity: 0,
        consumedQuantity: 0,
        unitCost: 125000,
        totalCost: 3125000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '18',
        operationNumber: 1,
        name: 'Damage Assessment',
        description: 'Assess extent of heel damage',
        plannedDuration: 2,
        actualDuration: 0,
        status: 'skipped',
        assignedTo: 'EMP019',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: 'Order cancelled before assessment'
      }
    ],
    totalCost: 5000000,
    actualCost: 0,
    efficiency: 0,
    qualityScore: 0,
    notes: 'Cancelled due to client change of mind',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-28T14:00:00Z',
    updatedAt: '2024-07-28T16:45:00Z'
  },
  {
    id: '7',
    workOrderNumber: 'WO-2024-007',
    type: 'packaging',
    productId: 'PROD007',
    productCode: 'SHOE-005',
    productName: 'Running Shoe Blue',
    quantity: 120,
    plannedStartDate: '2024-07-31',
    plannedEndDate: '2024-08-02',
    actualStartDate: undefined,
    actualEndDate: undefined,
    status: 'scheduled',
    priority: 'high',
    warehouseId: '2',
    warehouse: { id: '2', code: 'WH002', name: 'Satellite Warehouse Surabaya' },
    assignedTo: ['EMP021', 'EMP022', 'EMP023'],
    supervisor: 'EMP024',
    materials: [
      {
        id: '15',
        articleId: 'ART015',
        articleCode: 'BOX-001',
        articleName: 'Shoe Box Premium',
        requiredQuantity: 120,
        allocatedQuantity: 120,
        consumedQuantity: 0,
        unitCost: 8000,
        totalCost: 960000,
        wasteQuantity: 0
      },
      {
        id: '16',
        articleId: 'ART016',
        articleCode: 'PAPER-001',
        articleName: 'Tissue Paper White',
        requiredQuantity: 240,
        allocatedQuantity: 240,
        consumedQuantity: 0,
        unitCost: 1500,
        totalCost: 360000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '19',
        operationNumber: 1,
        name: 'Quality Check',
        description: 'Final quality inspection before packaging',
        plannedDuration: 4,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP021',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '20',
        operationNumber: 2,
        name: 'Packaging',
        description: 'Pack shoes in boxes with tissue paper',
        plannedDuration: 6,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP022',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '21',
        operationNumber: 3,
        name: 'Labeling & Shipping Prep',
        description: 'Apply labels and prepare for shipment',
        plannedDuration: 3,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP023',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      }
    ],
    totalCost: 2500000,
    actualCost: 0,
    efficiency: 0,
    qualityScore: 0,
    notes: 'Bulk packaging for export order',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-29T16:00:00Z',
    updatedAt: '2024-07-29T16:00:00Z'
  },
  {
    id: '8',
    workOrderNumber: 'WO-2024-008',
    type: 'maintenance',
    productId: 'PROD008',
    productCode: 'EQUIP-001',
    productName: 'Stitching Machine Overhaul',
    quantity: 3,
    plannedStartDate: '2024-08-01',
    plannedEndDate: '2024-08-03',
    actualStartDate: undefined,
    actualEndDate: undefined,
    status: 'scheduled',
    priority: 'urgent',
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    assignedTo: ['EMP025'],
    supervisor: 'EMP026',
    materials: [
      {
        id: '17',
        articleId: 'ART017',
        articleCode: 'PART-001',
        articleName: 'Machine Parts Kit',
        requiredQuantity: 3,
        allocatedQuantity: 3,
        consumedQuantity: 0,
        unitCost: 2500000,
        totalCost: 7500000,
        wasteQuantity: 0
      },
      {
        id: '18',
        articleId: 'ART018',
        articleCode: 'OIL-001',
        articleName: 'Machine Oil Premium',
        requiredQuantity: 6,
        allocatedQuantity: 6,
        consumedQuantity: 0,
        unitCost: 150000,
        totalCost: 900000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '22',
        operationNumber: 1,
        name: 'Disassembly',
        description: 'Carefully disassemble machines for inspection',
        plannedDuration: 8,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP025',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '23',
        operationNumber: 2,
        name: 'Parts Replacement',
        description: 'Replace worn parts and components',
        plannedDuration: 12,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP025',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '24',
        operationNumber: 3,
        name: 'Reassembly & Testing',
        description: 'Reassemble and test machine operation',
        plannedDuration: 6,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP025',
        machineId: undefined,
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      }
    ],
    totalCost: 12000000,
    actualCost: 0,
    efficiency: 0,
    qualityScore: 0,
    notes: 'Critical maintenance to prevent production delays',
    createdBy: 'maintenance@malaka.co.id',
    createdAt: '2024-07-30T08:00:00Z',
    updatedAt: '2024-07-30T08:00:00Z'
  },
  {
    id: '9',
    workOrderNumber: 'WO-2024-009',
    type: 'production',
    productId: 'PROD009',
    productCode: 'SHOE-006',
    productName: 'Kids Sneaker Rainbow',
    quantity: 150,
    plannedStartDate: '2024-08-05',
    plannedEndDate: '2024-08-12',
    actualStartDate: undefined,
    actualEndDate: undefined,
    status: 'draft',
    priority: 'normal',
    warehouseId: '1',
    warehouse: { id: '1', code: 'WH001', name: 'Main Warehouse Jakarta' },
    assignedTo: ['EMP027', 'EMP028', 'EMP029'],
    supervisor: 'EMP030',
    materials: [
      {
        id: '19',
        articleId: 'ART019',
        articleCode: 'FABRIC-002',
        articleName: 'Colorful Mesh Fabric',
        requiredQuantity: 150,
        allocatedQuantity: 0,
        consumedQuantity: 0,
        unitCost: 55000,
        totalCost: 8250000,
        wasteQuantity: 0
      },
      {
        id: '20',
        articleId: 'ART020',
        articleCode: 'SOLE-006',
        articleName: 'Kids EVA Sole Multi',
        requiredQuantity: 150,
        allocatedQuantity: 0,
        consumedQuantity: 0,
        unitCost: 42000,
        totalCost: 6300000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '25',
        operationNumber: 1,
        name: 'Colorful Cutting',
        description: 'Cut mesh fabric in various colors',
        plannedDuration: 10,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP027',
        machineId: 'MACH015',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '26',
        operationNumber: 2,
        name: 'Pattern Matching',
        description: 'Match color patterns and assemble uppers',
        plannedDuration: 14,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP028',
        machineId: 'MACH016',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '27',
        operationNumber: 3,
        name: 'Assembly & Finishing',
        description: 'Attach soles and add finishing touches',
        plannedDuration: 12,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP029',
        machineId: 'MACH017',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      }
    ],
    totalCost: 18500000,
    actualCost: 0,
    efficiency: 0,
    qualityScore: 0,
    notes: 'Back-to-school special collection',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-30T15:30:00Z',
    updatedAt: '2024-07-30T15:30:00Z'
  },
  {
    id: '10',
    workOrderNumber: 'WO-2024-010',
    type: 'production',
    productId: 'PROD010',
    productCode: 'BOOT-002',
    productName: 'Hiking Boot Brown',
    quantity: 80,
    plannedStartDate: '2024-08-03',
    plannedEndDate: '2024-08-10',
    actualStartDate: undefined,
    actualEndDate: undefined,
    status: 'scheduled',
    priority: 'high',
    warehouseId: '2',
    warehouse: { id: '2', code: 'WH002', name: 'Satellite Warehouse Surabaya' },
    assignedTo: ['EMP031', 'EMP032'],
    supervisor: 'EMP033',
    materials: [
      {
        id: '21',
        articleId: 'ART021',
        articleCode: 'LEATHER-005',
        articleName: 'Waterproof Leather Brown',
        requiredQuantity: 80,
        allocatedQuantity: 80,
        consumedQuantity: 0,
        unitCost: 195000,
        totalCost: 15600000,
        wasteQuantity: 0
      },
      {
        id: '22',
        articleId: 'ART022',
        articleCode: 'SOLE-007',
        articleName: 'Hiking Sole Vibram',
        requiredQuantity: 80,
        allocatedQuantity: 80,
        consumedQuantity: 0,
        unitCost: 120000,
        totalCost: 9600000,
        wasteQuantity: 0
      },
      {
        id: '23',
        articleId: 'ART023',
        articleCode: 'LINING-001',
        articleName: 'Breathable Lining',
        requiredQuantity: 80,
        allocatedQuantity: 80,
        consumedQuantity: 0,
        unitCost: 35000,
        totalCost: 2800000,
        wasteQuantity: 0
      }
    ],
    operations: [
      {
        id: '28',
        operationNumber: 1,
        name: 'Waterproof Treatment',
        description: 'Apply waterproof treatment to leather',
        plannedDuration: 6,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP031',
        machineId: 'MACH018',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '29',
        operationNumber: 2,
        name: 'Heavy-Duty Construction',
        description: 'Reinforce stitching for outdoor use',
        plannedDuration: 16,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP032',
        machineId: 'MACH019',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      },
      {
        id: '30',
        operationNumber: 3,
        name: 'Sole Attachment',
        description: 'Attach Vibram hiking soles',
        plannedDuration: 8,
        actualDuration: 0,
        status: 'pending',
        assignedTo: 'EMP031',
        machineId: 'MACH020',
        startTime: undefined,
        endTime: undefined,
        notes: undefined
      }
    ],
    totalCost: 35000000,
    actualCost: 0,
    efficiency: 0,
    qualityScore: 0,
    notes: 'Outdoor sports collection for adventure stores',
    createdBy: 'production@malaka.co.id',
    createdAt: '2024-07-31T12:00:00Z',
    updatedAt: '2024-07-31T12:00:00Z'
  }
]

export const mockQualityControls: QualityControl[] = [
  {
    id: '1',
    qcNumber: 'QC-2024-001',
    type: 'final',
    referenceType: 'work_order',
    referenceId: '1',
    referenceNumber: 'WO-2024-001',
    productId: 'PROD001',
    productCode: 'SHOE-001',
    productName: 'Classic Oxford Brown',
    batchNumber: 'BATCH-20240725-001',
    quantityTested: 10,
    sampleSize: 10,
    testDate: '2024-07-25',
    inspector: 'EMP005',
    status: 'testing',
    overallScore: 0,
    tests: [
      {
        id: '1',
        testName: 'Visual Inspection',
        testType: 'visual',
        specification: 'No visible defects, uniform color',
        actualValue: 'Minor scratches on 2 pieces',
        result: 'marginal',
        score: 7.5,
        notes: 'Acceptable within tolerance'
      },
      {
        id: '2',
        testName: 'Sole Adhesion',
        testType: 'functional',
        specification: 'Minimum 50N pull force',
        actualValue: '65N average',
        result: 'pass',
        score: 9.0,
        notes: 'Excellent adhesion strength'
      }
    ],
    defects: [],
    actions: [],
    notes: 'Final inspection before packaging',
    createdAt: '2024-07-25T15:00:00Z',
    updatedAt: '2024-07-25T16:30:00Z'
  }
]

export const mockProductionPlans: ProductionPlan[] = [
  {
    id: '1',
    planNumber: 'PLAN-2024-001',
    planName: 'Q3 2024 Production Plan',
    planType: 'quarterly',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    status: 'active',
    totalProducts: 5,
    totalQuantity: 1250,
    totalValue: 875000000,
    items: [
      {
        id: '1',
        productId: 'PROD001',
        productCode: 'SHOE-001',
        productName: 'Classic Oxford Brown',
        plannedQuantity: 300,
        producedQuantity: 150,
        pendingQuantity: 150,
        startDate: '2024-07-01',
        endDate: '2024-07-31',
        priority: 'high',
        status: 'in_progress'
      },
      {
        id: '2',
        productId: 'PROD002',
        productCode: 'SHOE-002',
        productName: 'Sports Sneaker White',
        plannedQuantity: 500,
        producedQuantity: 0,
        pendingQuantity: 500,
        startDate: '2024-08-01',
        endDate: '2024-08-31',
        priority: 'normal',
        status: 'pending'
      }
    ],
    notes: 'Quarterly production plan for footwear division',
    createdBy: 'planning@malaka.co.id',
    approvedBy: 'manager@malaka.co.id',
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-07-20T14:30:00Z'
  },
  {
    id: '2',
    planNumber: 'PLAN-2024-002',
    planName: 'Monthly Production Plan - August',
    planType: 'monthly',
    startDate: '2024-08-01',
    endDate: '2024-08-31',
    status: 'approved',
    totalProducts: 3,
    totalQuantity: 800,
    totalValue: 560000000,
    items: [
      {
        id: '3',
        productId: 'PROD003',
        productCode: 'BOOT-001',
        productName: 'Work Boot Black',
        plannedQuantity: 200,
        producedQuantity: 0,
        pendingQuantity: 200,
        startDate: '2024-08-01',
        endDate: '2024-08-15',
        priority: 'urgent',
        status: 'pending'
      }
    ],
    notes: 'Focus on work boot production for enterprise clients',
    createdBy: 'planning@malaka.co.id',
    createdAt: '2024-07-15T09:00:00Z',
    updatedAt: '2024-07-18T11:20:00Z'
  },
  {
    id: '3',
    planNumber: 'PLAN-2024-003',
    planName: 'Weekly Production Plan - Week 30',
    planType: 'weekly',
    startDate: '2024-07-22',
    endDate: '2024-07-28',
    status: 'completed',
    totalProducts: 2,
    totalQuantity: 150,
    totalValue: 105000000,
    items: [
      {
        id: '4',
        productId: 'PROD004',
        productCode: 'SANDAL-001',
        productName: 'Summer Sandal Brown',
        plannedQuantity: 150,
        producedQuantity: 150,
        pendingQuantity: 0,
        startDate: '2024-07-22',
        endDate: '2024-07-28',
        priority: 'normal',
        status: 'completed'
      }
    ],
    notes: 'Weekly production completed on schedule',
    createdBy: 'planning@malaka.co.id',
    approvedBy: 'supervisor@malaka.co.id',
    createdAt: '2024-07-20T08:00:00Z',
    updatedAt: '2024-07-28T17:00:00Z'
  }
]

export const mockProductionSummary: ProductionSummary = {
  totalWorkOrders: 45,
  activeWorkOrders: 12,
  completedWorkOrders: 28,
  delayedWorkOrders: 3,
  totalProduction: 1250,
  averageEfficiency: 87.3,
  qualityScore: 94.2,
  onTimeDelivery: 91.5
}

// Mock production analytics data
export const mockProductionAnalytics = {
  costAnalysis: [
    {
      id: '1',
      productId: 'PROD001',
      productCode: 'SHOE-001',
      productName: 'Classic Oxford Brown',
      unitsProduced: 150,
      materialCost: {
        total: 22500000,
        perUnit: 150000,
        breakdown: {
          rawMaterials: 15750000,
          components: 4500000,
          consumables: 2250000
        }
      },
      laborCost: {
        total: 9000000,
        perUnit: 60000,
        hoursUsed: 300,
        hourlyRate: 30000
      },
      overheadCost: {
        total: 6750000,
        perUnit: 45000,
        breakdown: {
          factory: 3375000,
          utilities: 1350000,
          depreciation: 1350000,
          other: 675000
        }
      },
      logisticsCost: {
        total: 3750000,
        perUnit: 25000,
        breakdown: {
          inbound: 1500000,
          outbound: 1200000,
          storage: 750000,
          handling: 300000
        }
      },
      totalCost: 42000000,
      costPerUnit: 280000,
      revenue: 52500000,
      profit: 10500000,
      profitMargin: 20.0,
      periodStart: '2024-07-01',
      periodEnd: '2024-07-31'
    },
    {
      id: '2',
      productId: 'PROD002',
      productCode: 'SHOE-002',
      productName: 'Sports Sneaker White',
      unitsProduced: 200,
      materialCost: {
        total: 24000000,
        perUnit: 120000,
        breakdown: {
          rawMaterials: 14400000,
          components: 6000000,
          consumables: 3600000
        }
      },
      laborCost: {
        total: 8000000,
        perUnit: 40000,
        hoursUsed: 320,
        hourlyRate: 25000
      },
      overheadCost: {
        total: 6000000,
        perUnit: 30000,
        breakdown: {
          factory: 3000000,
          utilities: 1200000,
          depreciation: 1200000,
          other: 600000
        }
      },
      logisticsCost: {
        total: 4000000,
        perUnit: 20000,
        breakdown: {
          inbound: 1600000,
          outbound: 1400000,
          storage: 600000,
          handling: 400000
        }
      },
      totalCost: 42000000,
      costPerUnit: 210000,
      revenue: 56000000,
      profit: 14000000,
      profitMargin: 25.0,
      periodStart: '2024-07-01',
      periodEnd: '2024-07-31'
    },
    {
      id: '3',
      productId: 'PROD003',
      productCode: 'BOOT-001',
      productName: 'Work Boot Black',
      unitsProduced: 100,
      materialCost: {
        total: 20000000,
        perUnit: 200000,
        breakdown: {
          rawMaterials: 14000000,
          components: 4000000,
          consumables: 2000000
        }
      },
      laborCost: {
        total: 12000000,
        perUnit: 120000,
        hoursUsed: 400,
        hourlyRate: 30000
      },
      overheadCost: {
        total: 8000000,
        perUnit: 80000,
        breakdown: {
          factory: 4000000,
          utilities: 1600000,
          depreciation: 1600000,
          other: 800000
        }
      },
      logisticsCost: {
        total: 3000000,
        perUnit: 30000,
        breakdown: {
          inbound: 1200000,
          outbound: 1000000,
          storage: 500000,
          handling: 300000
        }
      },
      totalCost: 43000000,
      costPerUnit: 430000,
      revenue: 50000000,
      profit: 7000000,
      profitMargin: 14.0,
      periodStart: '2024-07-01',
      periodEnd: '2024-07-31'
    }
  ],
  efficiencyMetrics: [
    {
      id: '1',
      productId: 'PROD001',
      productCode: 'SHOE-001',
      productName: 'Classic Oxford Brown',
      overallEfficiency: 87.5,
      timeEfficiency: {
        plannedHours: 280,
        actualHours: 300,
        efficiency: 93.3
      },
      materialEfficiency: {
        materialsPlanned: 150,
        materialsUsed: 152,
        waste: 5,
        efficiency: 96.7
      },
      qualityScore: 96.8,
      defectRate: 3.2,
      reworkRate: 1.5,
      throughputRate: 0.5,
      cycleTime: 120,
      setupTime: 30,
      downtime: 15,
      periodStart: '2024-07-01',
      periodEnd: '2024-07-31'
    },
    {
      id: '2',
      productId: 'PROD002',
      productCode: 'SHOE-002',
      productName: 'Sports Sneaker White',
      overallEfficiency: 92.1,
      timeEfficiency: {
        plannedHours: 300,
        actualHours: 320,
        efficiency: 93.8
      },
      materialEfficiency: {
        materialsPlanned: 200,
        materialsUsed: 205,
        waste: 8,
        efficiency: 94.6
      },
      qualityScore: 98.2,
      defectRate: 1.8,
      reworkRate: 0.8,
      throughputRate: 0.63,
      cycleTime: 95,
      setupTime: 25,
      downtime: 8,
      periodStart: '2024-07-01',
      periodEnd: '2024-07-31'
    },
    {
      id: '3',
      productId: 'PROD003',
      productCode: 'BOOT-001',
      productName: 'Work Boot Black',
      overallEfficiency: 82.4,
      timeEfficiency: {
        plannedHours: 380,
        actualHours: 400,
        efficiency: 95.0
      },
      materialEfficiency: {
        materialsPlanned: 100,
        materialsUsed: 103,
        waste: 6,
        efficiency: 91.3
      },
      qualityScore: 94.5,
      defectRate: 5.5,
      reworkRate: 2.8,
      throughputRate: 0.25,
      cycleTime: 240,
      setupTime: 45,
      downtime: 25,
      periodStart: '2024-07-01',
      periodEnd: '2024-07-31'
    }
  ]
}