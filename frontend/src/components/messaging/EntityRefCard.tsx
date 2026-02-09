'use client'

import type { EntityRef } from '@/services/messaging'

interface EntityRefCardProps {
  entityRef: EntityRef
  isMine: boolean
}

const ENTITY_LABELS: Record<string, string> = {
  sales_order: 'Sales Order',
  purchase_order: 'Purchase Order',
  purchase_request: 'Purchase Request',
  invoice: 'Invoice',
  journal_entry: 'Journal Entry',
  employee: 'Employee',
  article: 'Article',
  work_order: 'Work Order',
  quality_control: 'Quality Control',
  goods_receipt: 'Goods Receipt',
  stock_transfer: 'Stock Transfer',
  supplier: 'Supplier',
  customer: 'Customer',
  contract: 'Contract',
}

const STATUS_COLORS: Record<string, string> = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

export function EntityRefCard({ entityRef, isMine }: EntityRefCardProps) {
  const label = ENTITY_LABELS[entityRef.type] || entityRef.type
  const statusColorClass = entityRef.status_color
    ? STATUS_COLORS[entityRef.status_color] || STATUS_COLORS.gray
    : STATUS_COLORS.gray

  return (
    <a
      href={entityRef.url}
      className={`block p-2.5 rounded-lg border transition-colors ${
        isMine
          ? 'border-white/20 hover:bg-white/10'
          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] font-medium uppercase tracking-wide ${
          isMine ? 'text-white/50' : 'text-gray-400'
        }`}>
          {label}
        </span>
        {entityRef.status && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            isMine ? 'bg-white/20 text-white' : statusColorClass
          }`}>
            {entityRef.status}
          </span>
        )}
      </div>
      <p className={`text-sm font-medium ${isMine ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
        {entityRef.title}
      </p>
      {entityRef.subtitle && (
        <p className={`text-[11px] mt-0.5 ${isMine ? 'text-white/60' : 'text-gray-500'}`}>
          {entityRef.subtitle}
        </p>
      )}
    </a>
  )
}
