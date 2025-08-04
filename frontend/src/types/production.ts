/**
 * Production Module Type Definitions
 */

// Base interfaces
export interface Supplier {
  id: string
  code: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  contactPerson: string
  paymentTerms: string
  status: 'active' | 'inactive' | 'suspended'
  rating: number
  totalOrders: number
  totalValue: number
  createdAt: string
  updatedAt: string
}

export interface Warehouse {
  id: string
  code: string
  name: string
  type: 'main' | 'satellite' | 'transit' | 'quarantine' | 'distribution' | 'retail'
  address: string
  city?: string
  capacity: number
  current_stock: number
  manager?: string
  phone?: string
  email?: string
  status: 'active' | 'inactive' | 'maintenance' | 'planned'
  zones?: string[]
  operating_hours?: Record<string, any>
  facilities?: string[]
  coordinates?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WarehouseZone {
  id: string
  code: string
  name: string
  type: 'storage' | 'picking' | 'packing' | 'staging'
  capacity: number
  currentStock: number
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplier: Pick<Supplier, 'id' | 'code' | 'name' | 'email'>
  warehouseId: string
  warehouse: Pick<Warehouse, 'id' | 'code' | 'name'>
  orderDate: string
  expectedDate: string
  deliveredDate?: string
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'delivered' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  items: PurchaseOrderItem[]
  subtotal: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  notes?: string
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  articleId: string
  articleCode: string
  articleName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity: number
  pendingQuantity: number
  specifications?: string
}

export interface WorkOrder {
  id: number
  work_order_number: string
  type: 'production' | 'assembly' | 'packaging' | 'repair' | 'maintenance'
  product_id: string
  product_code: string
  product_name: string
  quantity: number
  planned_start_date: string
  planned_end_date: string
  actual_start_date?: string
  actual_end_date?: string
  status: 'draft' | 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  warehouse_id: string
  supervisor?: string
  materials?: WorkOrderMaterial[]
  operations?: WorkOrderOperation[]
  total_cost: number
  actual_cost: number
  efficiency?: number
  quality_score?: number
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
  
  // Computed properties for backward compatibility (can be accessed via getters)
  workOrderNumber?: string
  productId?: string
  productCode?: string
  productName?: string
  plannedStartDate?: string
  plannedEndDate?: string
  actualStartDate?: string
  actualEndDate?: string
  warehouseId?: string
  assignedTo?: string[]
  warehouse?: Pick<Warehouse, 'id' | 'code' | 'name'>
  totalCost?: number
  actualCost?: number
  qualityScore?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface WorkOrderMaterial {
  id: string
  articleId: string
  articleCode: string
  articleName: string
  requiredQuantity: number
  allocatedQuantity: number
  consumedQuantity: number
  unitCost: number
  totalCost: number
  wasteQuantity: number
}

export interface WorkOrderOperation {
  id: string
  operationNumber: number
  name: string
  description: string
  plannedDuration: number
  actualDuration: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  assignedTo: string
  machineId?: string
  startTime?: string
  endTime?: string
  notes?: string
}

export interface QualityControl {
  id: string
  qcNumber: string
  type: 'incoming' | 'in_process' | 'final' | 'random'
  referenceType: 'purchase_order' | 'work_order' | 'finished_goods'
  referenceId: string
  referenceNumber: string
  productId: string
  productCode: string
  productName: string
  batchNumber: string
  quantityTested: number
  sampleSize: number
  testDate: string
  inspector: string
  status: 'draft' | 'testing' | 'passed' | 'failed' | 'conditional'
  overallScore: number
  tests: QualityTest[]
  defects: QualityDefect[]
  actions: QualityAction[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface QualityTest {
  id: string
  testName: string
  testType: 'visual' | 'measurement' | 'functional' | 'durability' | 'chemical'
  specification: string
  actualValue: string
  result: 'pass' | 'fail' | 'marginal'
  score: number
  notes?: string
}

export interface QualityDefect {
  id: string
  defectType: string
  description: string
  severity: 'minor' | 'major' | 'critical'
  quantity: number
  location?: string
  images?: string[]
}

export interface QualityAction {
  id: string
  actionType: 'accept' | 'reject' | 'rework' | 'quarantine' | 'conditional_accept'
  description: string
  assignedTo: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
  completedDate?: string
}

export interface ProductionPlan {
  id: string
  planNumber: string
  planName: string
  planType: 'weekly' | 'monthly' | 'quarterly' | 'custom'
  startDate: string
  endDate: string
  status: 'draft' | 'approved' | 'active' | 'completed' | 'cancelled'
  totalProducts: number
  totalQuantity: number
  totalValue: number
  items: ProductionPlanItem[]
  notes?: string
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface ProductionPlanItem {
  id: string
  productId: string
  productCode: string
  productName: string
  plannedQuantity: number
  producedQuantity: number
  pendingQuantity: number
  startDate: string
  endDate: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
}

// Filter interfaces
export interface SupplierFilters {
  search?: string
  status?: Supplier['status']
  city?: string
  country?: string
  ratingMin?: number
  ratingMax?: number
}

export interface WarehouseFilters {
  search?: string
  type?: Warehouse['type']
  status?: Warehouse['status']
  city?: string
  capacityMin?: number
  capacityMax?: number
}

export interface PurchaseOrderFilters {
  search?: string
  status?: PurchaseOrder['status']
  supplierId?: string
  warehouseId?: string
  priority?: PurchaseOrder['priority']
  startDate?: string
  endDate?: string
  amountMin?: number
  amountMax?: number
}

export interface WorkOrderFilters {
  search?: string
  type?: WorkOrder['type']
  status?: WorkOrder['status']
  priority?: WorkOrder['priority']
  warehouseId?: string
  assignedTo?: string
  startDate?: string
  endDate?: string
}

export interface QualityControlFilters {
  search?: string
  type?: QualityControl['type']
  status?: QualityControl['status']
  referenceType?: QualityControl['referenceType']
  inspector?: string
  startDate?: string
  endDate?: string
  scoreMin?: number
  scoreMax?: number
}

export interface ProductionPlanFilters {
  search?: string
  planType?: ProductionPlan['planType']
  status?: ProductionPlan['status']
  startDate?: string
  endDate?: string
}

// Form interfaces
export interface SupplierFormData {
  code: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  contactPerson: string
  paymentTerms: string
  status: Supplier['status']
}

export interface WarehouseFormData {
  code: string
  name: string
  type: Warehouse['type']
  address: string
  city: string
  capacity: number
  manager: string
  phone: string
  status: Warehouse['status']
  zones: Omit<WarehouseZone, 'id'>[]
}

export interface PurchaseOrderFormData {
  orderNumber: string
  supplierId: string
  warehouseId: string
  orderDate: string
  expectedDate: string
  priority: PurchaseOrder['priority']
  items: Omit<PurchaseOrderItem, 'id' | 'receivedQuantity' | 'pendingQuantity'>[]
  shippingCost: number
  notes?: string
}

export interface WorkOrderFormData {
  workOrderNumber: string
  type: WorkOrder['type']
  productId: string
  quantity: number
  plannedStartDate: string
  plannedEndDate: string
  priority: WorkOrder['priority']
  warehouseId: string
  assignedTo: string[]
  supervisor: string
  materials: Omit<WorkOrderMaterial, 'id' | 'allocatedQuantity' | 'consumedQuantity' | 'wasteQuantity'>[]
  operations: Omit<WorkOrderOperation, 'id' | 'actualDuration' | 'status' | 'startTime' | 'endTime'>[]
  notes?: string
}

export interface QualityControlFormData {
  qcNumber: string
  type: QualityControl['type']
  referenceType: QualityControl['referenceType']
  referenceId: string
  productId: string
  batchNumber: string
  quantityTested: number
  sampleSize: number
  testDate: string
  inspector: string
  tests: Omit<QualityTest, 'id' | 'result' | 'score'>[]
  notes?: string
}

// Dashboard summary interfaces
export interface ProductionSummary {
  totalWorkOrders: number
  activeWorkOrders: number
  completedWorkOrders: number
  delayedWorkOrders: number
  totalProduction: number
  averageEfficiency: number
  qualityScore: number
  onTimeDelivery: number
}

// Production Analytics interfaces
export interface ProductionCostAnalysis {
  id: string
  productId: string
  productCode: string
  productName: string
  unitsProduced: number
  materialCost: {
    total: number
    perUnit: number
    breakdown: {
      rawMaterials: number
      components: number
      consumables: number
    }
  }
  laborCost: {
    total: number
    perUnit: number
    hoursUsed: number
    hourlyRate: number
  }
  overheadCost: {
    total: number
    perUnit: number
    breakdown: {
      factory: number
      utilities: number
      depreciation: number
      other: number
    }
  }
  logisticsCost: {
    total: number
    perUnit: number
    breakdown: {
      inbound: number
      outbound: number
      storage: number
      handling: number
    }
  }
  totalCost: number
  costPerUnit: number
  revenue: number
  profit: number
  profitMargin: number
  periodStart: string
  periodEnd: string
}

export interface ProductionEfficiencyMetrics {
  id: string
  productId: string
  productCode: string
  productName: string
  overallEfficiency: number
  timeEfficiency: {
    plannedHours: number
    actualHours: number
    efficiency: number
  }
  materialEfficiency: {
    materialsPlanned: number
    materialsUsed: number
    waste: number
    efficiency: number
  }
  qualityScore: number
  defectRate: number
  reworkRate: number
  throughputRate: number
  cycleTime: number
  setupTime: number
  downtime: number
  periodStart: string
  periodEnd: string
}

export interface ProductionAnalytics {
  costAnalysis: ProductionCostAnalysis[]
  efficiencyMetrics: ProductionEfficiencyMetrics[]
}