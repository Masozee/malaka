import type { EntityType } from '@/services/messaging'

export interface EntityTypeConfig {
  label: string
  color: string
  basePath: string
}

export const ENTITY_TYPE_CONFIG: Record<EntityType, EntityTypeConfig> = {
  sales_order: {
    label: 'Sales Order',
    color: 'blue',
    basePath: '/sales/orders',
  },
  purchase_order: {
    label: 'Purchase Order',
    color: 'indigo',
    basePath: '/procurement/purchase-orders',
  },
  purchase_request: {
    label: 'Purchase Request',
    color: 'violet',
    basePath: '/procurement/purchase-requests',
  },
  invoice: {
    label: 'Invoice',
    color: 'emerald',
    basePath: '/accounting/invoices',
  },
  journal_entry: {
    label: 'Journal Entry',
    color: 'teal',
    basePath: '/accounting/journal',
  },
  employee: {
    label: 'Employee',
    color: 'amber',
    basePath: '/hr/employees',
  },
  article: {
    label: 'Article',
    color: 'cyan',
    basePath: '/masterdata/articles',
  },
  work_order: {
    label: 'Work Order',
    color: 'orange',
    basePath: '/production/work-orders',
  },
  quality_control: {
    label: 'Quality Control',
    color: 'rose',
    basePath: '/production/quality-control',
  },
  goods_receipt: {
    label: 'Goods Receipt',
    color: 'lime',
    basePath: '/inventory/goods-receipt',
  },
  stock_transfer: {
    label: 'Stock Transfer',
    color: 'sky',
    basePath: '/inventory/stock-transfer',
  },
  supplier: {
    label: 'Supplier',
    color: 'purple',
    basePath: '/procurement/suppliers',
  },
  customer: {
    label: 'Customer',
    color: 'pink',
    basePath: '/masterdata/customers',
  },
  contract: {
    label: 'Contract',
    color: 'slate',
    basePath: '/procurement/contracts',
  },
}
