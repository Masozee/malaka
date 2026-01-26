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
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    TruckDeliveryIcon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    PlusSignIcon,
    EyeIcon,
    PencilEdit01Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    AlertCircleIcon,
    Calendar01Icon,
    Store01Icon,
    ArrowRight01Icon,
    PackageIcon,
    Coins01Icon
} from '@hugeicons/core-free-icons'
import { StockTransfer } from '@/services/inventory'

interface StockTransferDisplay extends StockTransfer {
    transfer_number?: string
    transfer_type?: 'warehouse_to_warehouse' | 'warehouse_to_store' | 'store_to_store' | 'return_to_warehouse'
    from_location?: string
    to_location?: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    total_quantity?: number
    estimated_value?: number
}

interface StockTransferListProps {
    initialData: StockTransferDisplay[]
}

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock01Icon },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: CheckmarkCircle01Icon },
    in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200', icon: TruckDeliveryIcon },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: AlertCircleIcon }
}

const priorityConfig = {
    low: { label: 'Low', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
    medium: { label: 'Medium', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
    high: { label: 'High', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
    urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' }
}

export default function StockTransferList({ initialData }: StockTransferListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [data, setData] = useState<StockTransferDisplay[]>(initialData)

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        const lower = searchQuery.toLowerCase()
        return data.filter(item =>
            (item.transfer_number && item.transfer_number.toLowerCase().includes(lower)) ||
            (item.from_location && item.from_location.toLowerCase().includes(lower)) ||
            (item.to_location && item.to_location.toLowerCase().includes(lower))
        )
    }, [data, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = data.length
        const pending = data.filter(i => ['draft', 'pending', 'approved'].includes(i.status)).length
        const inTransit = data.filter(i => i.status === 'in_transit').length
        const completed = data.filter(i => i.status === 'completed').length

        return { total, pending, inTransit, completed }
    }, [data])

    const handleDelete = async (item: StockTransferDisplay) => {
        if (confirm('Are you sure you want to delete this transfer?')) {
            // API call would go here
            setData(prev => prev.filter(i => i.id !== item.id))
            addToast({ type: 'success', title: 'Transfer deleted' })
        }
    }

    const columns: TanStackColumn<StockTransferDisplay>[] = useMemo(() => [
        {
            id: 'transferNumber',
            header: 'Transfer #',
            accessorKey: 'transfer_number',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/stock-transfer/${row.original.id}`}
                        className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.transfer_number}
                    </Link>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {new Date(row.original.transferDate || '').toLocaleDateString()}
                    </span>
                </div>
            )
        },
        {
            id: 'fromTo',
            header: 'Route',
            accessorKey: 'from_location',
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-sm">
                    <span className="max-w-[120px] truncate" title={row.original.from_location}>{row.original.from_location}</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="max-w-[120px] truncate" title={row.original.to_location}>{row.original.to_location}</span>
                </div>
            )
        },
        {
            id: 'items',
            header: 'Items',
            accessorKey: 'total_quantity',
            cell: ({ row }) => (
                <div className="text-center text-sm">
                    <span className="font-medium">{row.original.totalItems}</span> types
                    <div className="text-xs text-muted-foreground">
                        {row.original.total_quantity} qty
                    </div>
                </div>
            )
        },
        {
            id: 'priority',
            header: 'Priority',
            accessorKey: 'priority',
            cell: ({ row }) => {
                const priority = row.original.priority || 'medium'
                const config = priorityConfig[priority]
                return (
                    <Badge className={`${config.color} border-0 hover:bg-opacity-80`}>
                        {config.label}
                    </Badge>
                )
            }
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                // @ts-ignore
                const config = statusConfig[row.original.status] || statusConfig.pending
                return (
                    <Badge className={`${config.color} flex items-center gap-1 w-fit border-0`}>
                        <HugeiconsIcon icon={config.icon} className="h-3 w-3" />
                        {config.label}
                    </Badge>
                )
            }
        }
    ], [])

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
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                                <HugeiconsIcon icon={TruckDeliveryIcon} className="h-6 w-6" />
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
                                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                                <p className="text-2xl font-bold text-indigo-600">{stats.inTransit}</p>
                            </div>
                            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600">
                                <HugeiconsIcon icon={Store01Icon} className="h-6 w-6" />
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
                            placeholder="Search transfers..."
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
                    onEdit={(item) => router.push(`/inventory/stock-transfer/${item.id}/edit`)}
                    onDelete={handleDelete}
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
