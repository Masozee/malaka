'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    TanStackDataTable,
    TanStackColumn
} from '@/components/ui/tanstack-data-table'
import { Badge } from '@/components/ui/badge'
import { EyeIcon, PencilEdit01Icon } from '@hugeicons/core-free-icons'
import { StockItem } from '@/services/inventory'

// Extended interface for display
export interface StockItemDisplay extends StockItem {
    category: string
    warehouse: string
}

interface StockControlListProps {
    data: StockItemDisplay[]
    onEdit: (item: StockItemDisplay) => void
    onBatchExport: (items: StockItemDisplay[]) => void
}

const statusConfig = {
    in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    low_stock: { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    overstock: { label: 'Overstock', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
}

export default function StockControlList({ data, onEdit, onBatchExport }: StockControlListProps) {
    const router = useRouter()

    const columns: TanStackColumn<StockItemDisplay>[] = useMemo(() => [
        {
            id: 'code',
            header: 'Code',
            accessorKey: 'code',
            cell: ({ row }) => (
                <Link
                    href={`/inventory/stock-control/${row.original.id}`}
                    className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {row.original.code}
                </Link>
            )
        },
        {
            id: 'name',
            header: 'Product Name',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.category}</span>
                </div>
            )
        },
        {
            id: 'warehouse',
            header: 'Warehouse',
            accessorKey: 'warehouse',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.warehouse}
                </span>
            )
        },
        {
            id: 'stock',
            header: 'Current Stock',
            accessorKey: 'currentStock',
            cell: ({ row }) => (
                <div className="text-center">
                    <div className="font-bold text-sm">
                        {row.original.currentStock.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                        Min: {row.original.minStock} | Max: {row.original.maxStock}
                    </div>
                </div>
            )
        },
        {
            id: 'unitCost',
            header: 'Unit Cost',
            accessorKey: 'unitCost',
            cell: ({ row }) => (
                <div className="text-right font-medium text-sm">
                    {(row.original.unitCost || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                </div>
            )
        },
        {
            id: 'totalValue',
            header: 'Total Value',
            accessorKey: 'totalValue',
            cell: ({ row }) => (
                <div className="text-right font-medium text-sm">
                    {(row.original.totalValue || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = statusConfig[row.original.status] || statusConfig.in_stock
                return (
                    <Badge className={`${config.color} border-0 whitespace-nowrap`}>
                        {config.label}
                    </Badge>
                )
            }
        }
    ], [])

    return (
        <TanStackDataTable
            data={data}
            columns={columns}
            enableRowSelection
            showColumnToggle={false}
            onBatchExport={onBatchExport}
            customActions={[
                {
                    label: 'View',
                    icon: EyeIcon,
                    onClick: (item) => router.push(`/inventory/stock-control/${item.id}`),
                },
                {
                    label: 'Edit',
                    icon: PencilEdit01Icon,
                    onClick: (item) => onEdit(item),
                }
            ]}
        />
    )
}
