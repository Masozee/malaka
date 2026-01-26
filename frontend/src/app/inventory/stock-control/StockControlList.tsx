'use client'

import React, { useState, useMemo } from 'react'
import {
    TanStackDataTable,
    TanStackColumn
} from '@/components/ui/tanstack-data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EyeIcon, PencilEdit01Icon, Store01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { StockItem } from '@/services/inventory'

// Extended interface for display
export interface StockItemDisplay extends StockItem {
    category: string
    warehouse: string
}

interface StockControlListProps {
    data: StockItemDisplay[]
    onEdit: (item: StockItemDisplay) => void
}

const statusConfig = {
    in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    low_stock: { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
    out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    overstock: { label: 'Overstock', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
}

export default function StockControlList({ data, onEdit }: StockControlListProps) {

    const columns: TanStackColumn<StockItemDisplay>[] = useMemo(() => [
        {
            id: 'code',
            header: 'Code',
            accessorKey: 'code',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.code}</span>
            )
        },
        {
            id: 'name',
            header: 'Product Name',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-blue-600 dark:text-blue-400">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.category}</span>
                </div>
            )
        },
        {
            id: 'warehouse',
            header: 'Warehouse',
            accessorKey: 'warehouse',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HugeiconsIcon icon={Store01Icon} className="h-3 w-3" />
                    {row.original.warehouse}
                </div>
            )
        },
        {
            id: 'stock',
            header: 'Current Stock',
            accessorKey: 'currentStock',
            cell: ({ row }) => (
                <div className="text-center">
                    <div className="font-bold text-sm bg-muted py-1 rounded-md mb-1">
                        {row.original.currentStock.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap">
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
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <HugeiconsIcon icon={EyeIcon} className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(row.original)}>
                        <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            )
        }
    ], [onEdit])

    return (
        <TanStackDataTable
            data={data}
            columns={columns}
            pagination={{
                pageSize: 10,
                pageIndex: 0,
                totalRows: data.length,
                onPageChange: () => { }
            }}
        />
    )
}
