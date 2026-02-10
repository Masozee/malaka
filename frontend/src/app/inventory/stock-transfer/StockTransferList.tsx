'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    TruckDeliveryIcon,
    Search01Icon,
    Download01Icon,
    PlusSignIcon,
    EyeIcon,
    PencilEdit01Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    Store01Icon
} from '@hugeicons/core-free-icons'
import { StockTransfer } from '@/services/inventory'

interface StockTransferListProps {
    data: StockTransfer[]
    loading: boolean
}

const statusConfig: Record<string, { label: string, color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
    in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' }
}

export default function StockTransferList({ data, loading }: StockTransferListProps) {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        const lower = searchQuery.toLowerCase()
        return data.filter(item =>
            (item.transferNumber && item.transferNumber.toLowerCase().includes(lower)) ||
            (item.fromWarehouse && item.fromWarehouse.toLowerCase().includes(lower)) ||
            (item.toWarehouse && item.toWarehouse.toLowerCase().includes(lower)) ||
            (item.fromCode && item.fromCode.toLowerCase().includes(lower)) ||
            (item.toCode && item.toCode.toLowerCase().includes(lower)) ||
            (item.status && item.status.toLowerCase().includes(lower))
        )
    }, [data, searchQuery])

    const stats = useMemo(() => {
        const total = data.length
        const pending = data.filter(i => ['draft', 'pending', 'approved'].includes(i.status)).length
        const inTransit = data.filter(i => i.status === 'in_transit').length
        const completed = data.filter(i => i.status === 'completed').length
        return { total, pending, inTransit, completed }
    }, [data])

    const handleBatchExport = (items: StockTransfer[]) => {
        const headers = ['Transfer Number', 'From Warehouse', 'To Warehouse', 'Order Date', 'Status', 'Items', 'Quantity']
        const rows = items.map(item => [
            item.transferNumber,
            `${item.fromWarehouse} (${item.fromCode})`,
            `${item.toWarehouse} (${item.toCode})`,
            item.orderDate ? new Date(item.orderDate).toLocaleDateString('id-ID') : '-',
            item.status,
            item.totalItems,
            item.totalQuantity
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `stock-transfers-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const columns: TanStackColumn<StockTransfer>[] = useMemo(() => [
        {
            id: 'transferNumber',
            header: 'Transfer',
            accessorKey: 'transferNumber',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/stock-transfer/${row.original.id}`}
                        className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.transferNumber}
                    </Link>
                    {row.original.orderDate && (
                        <span className="text-xs text-muted-foreground">
                            {mounted ? new Date(row.original.orderDate).toLocaleDateString('id-ID') : ''}
                        </span>
                    )}
                </div>
            )
        },
        {
            id: 'fromWarehouse',
            header: 'From',
            accessorKey: 'fromWarehouse',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.fromWarehouse}</span>
                    <span className="text-xs text-muted-foreground">{row.original.fromCode}</span>
                </div>
            )
        },
        {
            id: 'toWarehouse',
            header: 'To',
            accessorKey: 'toWarehouse',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.toWarehouse}</span>
                    <span className="text-xs text-muted-foreground">{row.original.toCode}</span>
                </div>
            )
        },
        {
            id: 'items',
            header: 'Items',
            accessorKey: 'totalItems',
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    <span>{row.original.totalItems} items</span>
                    <span className="text-xs text-muted-foreground">{row.original.totalQuantity} qty</span>
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = statusConfig[row.original.status] || statusConfig.pending
                return (
                    <Badge className={`${config.color} border-0 whitespace-nowrap`}>
                        {config.label}
                    </Badge>
                )
            }
        }
    ], [mounted])

    return (
        <TwoLevelLayout>
            <Header
                title="Stock Transfer"
                description="Manage inventory movement between locations"
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Stock Transfer' }
                ]}
                actions={
                    <Link href="/inventory/stock-transfer/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Transfer
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Transfers</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={TruckDeliveryIcon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                                <p className="text-2xl font-bold text-indigo-600">{stats.inTransit}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Store01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transfers..."
                            className="pl-9 h-9 bg-white dark:bg-gray-900"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-9" onClick={() => handleBatchExport(filteredData)}>
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Loading transfers...</div>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={filteredData}
                        columns={columns}
                        enableRowSelection
                        showColumnToggle={false}
                        onBatchExport={handleBatchExport}
                        customActions={[
                            {
                                label: 'View',
                                icon: EyeIcon,
                                onClick: (item) => router.push(`/inventory/stock-transfer/${item.id}`),
                            },
                            {
                                label: 'Edit',
                                icon: PencilEdit01Icon,
                                onClick: (item) => router.push(`/inventory/stock-transfer/${item.id}/edit`),
                            }
                        ]}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
