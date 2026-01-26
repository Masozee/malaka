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
    PackageIcon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    PlusSignIcon,
    EyeIcon,
    PencilEdit01Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    AlertCircleIcon,
    ShoppingBag01Icon,
    TruckDeliveryIcon,
    ArrowRight01Icon,
    Coins01Icon
} from '@hugeicons/core-free-icons'
import { GoodsIssue } from '@/services/inventory'

interface GoodsIssueDisplay extends GoodsIssue {
    customerName?: string
    orderNumber?: string
    requestedDate?: string
    issuedBy?: string
    warehouse?: string
    issueType?: 'sales_order' | 'transfer' | 'return' | 'adjustment'
    notes?: string
}

interface GoodsIssueListProps {
    initialData: GoodsIssueDisplay[]
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: CheckmarkCircle01Icon },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: AlertCircleIcon }
}

const typeConfig = {
    sales_order: { label: 'Sales Order', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300', icon: ShoppingBag01Icon },
    transfer: { label: 'Transfer', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300', icon: ArrowRight01Icon },
    return: { label: 'Return', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300', icon: ArrowRight01Icon },
    adjustment: { label: 'Adjustment', color: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: CheckmarkCircle01Icon }
}

export default function GoodsIssueList({ initialData }: GoodsIssueListProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [data, setData] = useState<GoodsIssueDisplay[]>(initialData)

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        const lower = searchQuery.toLowerCase()
        return data.filter(item =>
            (item.issueNumber && item.issueNumber.toLowerCase().includes(lower)) ||
            (item.customerName && item.customerName.toLowerCase().includes(lower)) ||
            (item.orderNumber && item.orderNumber.toLowerCase().includes(lower))
        )
    }, [data, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = data.length
        const pending = data.filter(i => i.status === 'pending').length
        const completed = data.filter(i => i.status === 'completed').length
        const totalValue = data.reduce((acc, curr) => acc + ((curr.totalItems || 0) * 45), 0) // Mock value calc

        return { total, pending, completed, totalValue }
    }, [data])

    const columns: TanStackColumn<GoodsIssueDisplay>[] = useMemo(() => [
        {
            id: 'issueNumber',
            header: 'Issue #',
            accessorKey: 'issueNumber',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                        {row.original.issueNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {new Date(row.original.requestedDate || '').toLocaleDateString()}
                    </span>
                </div>
            )
        },
        {
            id: 'customer',
            header: 'Customer / Order',
            accessorKey: 'customerName',
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium truncate max-w-[150px]" title={row.original.customerName}>
                        {row.original.customerName || 'Internal'}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.original.orderNumber}</span>
                </div>
            )
        },
        {
            id: 'type',
            header: 'Type',
            accessorKey: 'issueType',
            cell: ({ row }) => {
                const type = row.original.issueType || 'sales_order'
                const config = typeConfig[type]
                return (
                    <Badge className={`${config.color} border-0 flex items-center gap-1 w-fit`}>
                        <HugeiconsIcon icon={config.icon} className="h-3 w-3" />
                        {config.label}
                    </Badge>
                )
            }
        },
        {
            id: 'warehouse',
            header: 'Warehouse',
            accessorKey: 'warehouse',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.original.warehouse}</span>
            )
        },
        {
            id: 'items',
            header: 'Items',
            accessorKey: 'totalItems',
            cell: ({ row }) => (
                <div className="text-center font-medium bg-muted py-1 rounded-md text-xs w-12 mx-auto">
                    {row.original.totalItems}
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                // @ts-ignore
                const config = statusConfig[row.original.status] || statusConfig.pending
                return (
                    <Badge className={`${config.color} flex items-center gap-1 w-fit border-0 px-2 py-0.5`}>
                        <HugeiconsIcon icon={config.icon} className="h-3 w-3" />
                        {config.label}
                    </Badge>
                )
            }
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HugeiconsIcon icon={EyeIcon} className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {row.original.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            )
        }
    ], [])

    return (
        <TwoLevelLayout>
            <Header
                title="Goods Issue"
                description="Process outgoing inventory and shipments"
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Goods Issue' }
                ]}
                actions={
                    <Button>
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                        New Issue
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                                <HugeiconsIcon icon={PackageIcon} className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
                                <HugeiconsIcon icon={Coins01Icon} className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center text-yellow-600">
                                <HugeiconsIcon icon={Clock01Icon} className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-end gap-2">
                    <div className="relative">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search issues..."
                            className="pl-9 w-64"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {/* Table */}
                <TanStackDataTable
                    data={filteredData}
                    columns={columns}
                    pagination={{
                        pageSize: 10,
                        pageIndex: 0,
                        totalRows: filteredData.length,
                        onPageChange: () => { }
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
