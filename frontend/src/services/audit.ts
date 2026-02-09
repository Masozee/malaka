import { apiClient } from '@/lib/api'

export interface AuditLogEntry {
  id: string
  user_id: string
  method: string
  path: string
  module: string
  resource: string
  action: string
  status_code: number
  ip_address: string
  user_agent: string
  request_body?: string
  created_at: string
}

class AuditService {
  async getUserActivityLog(userId: string): Promise<AuditLogEntry[]> {
    const res = await apiClient.get<{ data: AuditLogEntry[] }>(`/api/v1/admin/audit/users/${userId}`)
    return res.data
  }

  async getSystemAuditLog(): Promise<AuditLogEntry[]> {
    const res = await apiClient.get<{ data: AuditLogEntry[] }>('/api/v1/admin/audit')
    return res.data
  }
}

export const auditService = new AuditService()

/** Map a module+resource+action to a human-readable label */
export function formatAuditAction(entry: AuditLogEntry): string {
  const actionVerbs: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
  }

  const resourceLabels: Record<string, string> = {
    articles: 'article',
    companies: 'company',
    users: 'user',
    customers: 'customer',
    suppliers: 'supplier',
    classifications: 'classification',
    colors: 'color',
    models: 'model',
    sizes: 'size',
    barcodes: 'barcode',
    prices: 'price',
    warehouses: 'warehouse',
    depstores: 'department store',
    divisions: 'division',
    'courier-rates': 'courier rate',
    'gallery-images': 'gallery image',
    'purchase-orders': 'purchase order',
    'stock-movements': 'stock movement',
    'stock-balances': 'stock balance',
    'transfer-orders': 'transfer order',
    'goods-receipts': 'goods receipt',
    'stock-adjustments': 'stock adjustment',
    orders: 'sales order',
    invoices: 'invoice',
    'pos-transactions': 'POS transaction',
    promotions: 'promotion',
    'sales-returns': 'sales return',
    'sales-targets': 'sales target',
    shipments: 'shipment',
    airwaybills: 'airwaybill',
    manifests: 'manifest',
    couriers: 'courier',
    employees: 'employee',
    'leave-requests': 'leave request',
    'payroll-periods': 'payroll period',
    'training-programs': 'training program',
    'performance-reviews': 'performance review',
    'journal-entries': 'journal entry',
    'chart-of-accounts': 'chart of account',
    'cost-centers': 'cost center',
    budgets: 'budget',
    'fixed-assets': 'fixed asset',
    'financial-periods': 'financial period',
    roles: 'role',
    permissions: 'permission',
    invitations: 'invitation',
    events: 'event',
    settings: 'setting',
    'production-plans': 'production plan',
    'work-orders': 'work order',
    'quality-controls': 'quality control',
    'purchase-requests': 'purchase request',
    rfqs: 'RFQ',
    contracts: 'contract',
  }

  const verb = actionVerbs[entry.action] || entry.action
  const resource = resourceLabels[entry.resource] || entry.resource.replace(/-/g, ' ')

  return `${verb} ${resource}`
}

/** Get a color class based on the HTTP method */
export function getMethodColor(method: string): string {
  switch (method) {
    case 'POST':
      return 'bg-green-100 text-green-800'
    case 'PUT':
    case 'PATCH':
      return 'bg-blue-100 text-blue-800'
    case 'DELETE':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
