/**
 * Procurement TypeScript Interfaces
 * Types for procurement module entities
 */

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// Purchase Request
export interface PurchaseRequest extends BaseEntity {
  request_number: string
  title: string
  description?: string
  requester_id: string
  requester_name?: string
  department: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'
  requested_date: string
  required_date?: string
  approved_by?: string
  approved_date?: string
  rejection_reason?: string
  total_amount: number
  currency: string
  notes?: string
  items?: PurchaseRequestItem[]
}

export interface PurchaseRequestItem extends BaseEntity {
  purchase_request_id: string
  item_name: string
  description?: string
  specification?: string
  quantity: number
  unit: string
  estimated_price: number
  currency: string
  supplier_id?: string
  supplier_name?: string
}

// Purchase Order
export interface PurchaseOrder extends BaseEntity {
  po_number: string
  supplier_id: string
  supplier_name?: string
  purchase_request_id?: string
  order_date: string
  expected_delivery_date?: string
  delivery_address: string
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
  payment_terms: string
  payment_status: 'unpaid' | 'partial' | 'paid'
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  currency: string
  notes?: string
  created_by?: string
  created_by_name?: string
  created_by_position?: string
  items?: PurchaseOrderItem[]
}

export interface PurchaseOrderItem extends BaseEntity {
  purchase_order_id: string
  item_name: string
  description?: string
  specification?: string
  quantity: number
  unit: string
  unit_price: number
  discount_percentage: number
  tax_percentage: number
  line_total: number
  received_quantity: number
  currency: string
}

// Contract
export interface Contract extends BaseEntity {
  contract_number: string
  title: string
  description?: string
  supplier_id: string
  supplier_name?: string
  contract_type: 'service' | 'supply' | 'framework' | 'one-time'
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed'
  start_date: string
  end_date: string
  value: number
  currency: string
  payment_terms: string
  terms_conditions?: string
  auto_renewal: boolean
  renewal_period?: number
  notice_period?: number
  signed_by?: string
  signed_date?: string
  attachments?: string[]
}

// Vendor Evaluation
export interface VendorEvaluation extends BaseEntity {
  evaluation_number: string
  supplier_id: string
  supplier_name?: string
  evaluation_period_start: string
  evaluation_period_end: string
  evaluator_id: string
  evaluator_name?: string
  status: 'draft' | 'completed' | 'approved'

  // Scoring criteria (1-5 scale)
  quality_score: number
  delivery_score: number
  price_score: number
  service_score: number
  compliance_score: number
  overall_score: number

  quality_comments?: string
  delivery_comments?: string
  price_comments?: string
  service_comments?: string
  compliance_comments?: string
  overall_comments?: string

  recommendation: 'preferred' | 'approved' | 'conditional' | 'not_recommended'
  action_items?: string
}

// Form Data Types
export interface PurchaseRequestFormData {
  title: string
  description: string
  department: string
  priority: PurchaseRequest['priority']
  required_date: string
  notes: string
  items: Omit<PurchaseRequestItem, keyof BaseEntity | 'purchase_request_id'>[]
}

export interface PurchaseOrderFormData {
  supplier_id: string
  purchase_request_id: string
  expected_delivery_date: string
  delivery_address: string
  payment_terms: string
  notes: string
  items: Omit<PurchaseOrderItem, keyof BaseEntity | 'purchase_order_id' | 'received_quantity'>[]
}

export interface ContractFormData {
  title: string
  description: string
  supplier_id: string
  contract_type: Contract['contract_type']
  start_date: string
  end_date: string
  value: number
  currency: string
  payment_terms: string
  terms_conditions: string
  auto_renewal: boolean
  renewal_period: number
  notice_period: number
}

export interface VendorEvaluationFormData {
  supplier_id: string
  evaluation_period_start: string
  evaluation_period_end: string
  quality_score: number
  delivery_score: number
  price_score: number
  service_score: number
  compliance_score: number
  quality_comments: string
  delivery_comments: string
  price_comments: string
  service_comments: string
  compliance_comments: string
  overall_comments: string
  recommendation: VendorEvaluation['recommendation']
  action_items: string
}

// List Response Types
export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export type PurchaseRequestListResponse = ListResponse<PurchaseRequest>
export type PurchaseOrderListResponse = ListResponse<PurchaseOrder>
export type ContractListResponse = ListResponse<Contract>
export type VendorEvaluationListResponse = ListResponse<VendorEvaluation>

// Statistics Types
export interface PurchaseRequestStats {
  total: number
  draft: number
  pending: number
  approved: number
  rejected: number
  total_amount: number
}

export interface ContractStats {
  total: number
  draft: number
  active: number
  expired: number
  terminated: number
  total_value: number
  expiring: number
}

export interface VendorEvaluationStats {
  total: number
  draft: number
  completed: number
  approved: number
  average_overall_score: number
  preferred_count: number
  approved_count: number
  conditional_count: number
  not_recommended_count: number
}

// Analytics Types
export interface TopSupplier {
  supplier_id: string
  supplier_name: string
  total_orders: number
  total_value: number
}

export interface RecentPO {
  id: string
  po_number: string
  supplier_name: string
  total_amount: number
  status: string
  created_at: string
}

export interface ProcurementOverview {
  total_purchase_requests: number
  pending_purchase_requests: number
  approved_purchase_requests: number
  total_purchase_orders: number
  draft_purchase_orders: number
  pending_approval_orders: number
  sent_purchase_orders: number
  received_purchase_orders: number
  total_po_value: number
  total_pr_value: number
  pending_payments: number
  total_contracts: number
  active_contracts: number
  expiring_contracts: number
  total_vendor_evaluations: number
  average_vendor_score: number
  top_suppliers: TopSupplier[]
  recent_purchase_orders: RecentPO[]
}

export interface SpendBySupplier {
  supplier_id: string
  supplier_name: string
  total_spend: number
  order_count: number
  percentage: number
}

export interface SpendByMonth {
  month: string
  total_spend: number
  order_count: number
}

export interface SpendByStatus {
  status: string
  total_spend: number
  order_count: number
}

export interface LargestOrder {
  id: string
  po_number: string
  supplier_name: string
  total_amount: number
  order_date: string
}

export interface SpendAnalytics {
  total_spend: number
  spend_by_supplier: SpendBySupplier[]
  spend_by_month: SpendByMonth[]
  spend_by_status: SpendByStatus[]
  average_order_value: number
  largest_order?: LargestOrder
}

export interface SupplierRanking {
  rank: number
  supplier_id: string
  supplier_name: string
  total_orders: number
  total_value: number
  average_value: number
  received_orders: number
  delivery_rate: number
}

export interface TopRatedSupplier {
  supplier_id: string
  supplier_name: string
  average_score: number
  evaluation_count: number
  recommendation: string
}

export interface SupplierByCategory {
  category: string
  count: number
}

export interface SupplierPerformance {
  total_suppliers: number
  active_suppliers: number
  supplier_rankings: SupplierRanking[]
  top_rated_suppliers: TopRatedSupplier[]
  suppliers_by_category: SupplierByCategory[]
}

export interface ContractByStatus {
  status: string
  count: number
  total_value: number
}

export interface ContractByType {
  contract_type: string
  count: number
  total_value: number
}

export interface ExpiringContract {
  id: string
  contract_number: string
  title: string
  supplier_name: string
  end_date: string
  value: number
  days_until_expiry: number
  auto_renewal: boolean
}

export interface RenewalPipeline {
  month: string
  count: number
  total_value: number
}

export interface ContractValueByMonth {
  month: string
  count: number
  total_value: number
}

export interface ContractAnalytics {
  total_contract_value: number
  active_contract_value: number
  contracts_by_status: ContractByStatus[]
  contracts_by_type: ContractByType[]
  expiring_contracts: ExpiringContract[]
  renewal_pipeline: RenewalPipeline[]
  contract_value_by_month: ContractValueByMonth[]
}
