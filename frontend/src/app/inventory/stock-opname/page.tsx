'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
    ArrowRight01Icon,
    NoteIcon,
    FileIcon
} from '@hugeicons/core-free-icons'
import { stockOpnameService, StockOpname } from '@/services/inventory'

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    planned: { label: 'Planned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: Calendar01Icon },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: AlertCircleIcon }
}

export default function StockOpnameListPage() {
    const router = useRouter()
    const [data, setData] = useState<StockOpname[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await stockOpnameService.getAll()
                setData(response.data)
            } catch (error) {
                console.error('Failed to fetch stock opname sessions:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        const lower = searchQuery.toLowerCase()
        return data.filter(item =>
            item.opnameNumber.toLowerCase().includes(lower) ||
            item.warehouseName.toLowerCase().includes(lower)
        )
    }, [data, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = data.length
        const planned = data.filter(i => i.status === 'planned').length
        const inProgress = data.filter(i => i.status === 'in_progress').length
        const completed = data.filter(i => i.status === 'completed').length
        return { total, planned, inProgress, completed }
    }, [data])

    const columns: TanStackColumn<StockOpname>[] = useMemo(() => [
        {
            id: 'opnameInfo',
            header: 'Session',
            accessorKey: 'opnameNumber',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/stock-opname/${row.original.id}`}
                        className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.opnameNumber}
                    </Link>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3" />
                        {new Date(row.original.date).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            id: 'warehouse',
            header: 'Warehouse',
            accessorKey: 'warehouseName',
            cell: ({ row }) => (
                <span className="text-sm font-medium">{row.original.warehouseName}</span>
            )
        },
        {
            id: 'items',
            header: 'Items',
            accessorKey: 'totalItems',
            cell: ({ row }) => (
                <div className="text-center">
                    <span className="font-medium text-sm">{row.original.totalItems}</span>
                </div>
            )
        },
        {
            id: 'variance',
            header: 'Variance',
            accessorKey: 'totalVariance',
            cell: ({ row }) => {
                const variance = row.original.totalVariance
                const isNegative = variance < 0
                const isPositive = variance > 0
                const color = isNegative ? 'text-red-600' : isPositive ? 'text-green-600' : 'text-gray-500'

                return (
                    <div className={`text-right font-medium ${color}`}>
                        {variance > 0 ? '+' : ''}{variance}
                    </div>
                )
            }
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = statusConfig[row.original.status]
                return (
                    <Badge className={`${config.color} border-0 capitalize flex w-fit items-center gap-1.5`}>
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
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/inventory/stock-opname/${row.original.id}`)}>
                        <HugeiconsIcon icon={EyeIcon} className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/inventory/stock-opname/${row.original.id}/edit`)}>
                        <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            )
        }
    ], [router])

    return (
        <TwoLevelLayout>
            <Header
                title="Stock Opname"
                description="Manage stock counting sessions and adjustments"
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Stock Opname' }
                ]}
                actions={
                    <Link href="/inventory/stock-opname/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Session
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
                                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600">
                                <HugeiconsIcon icon={FileIcon} className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Planned</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                                <HugeiconsIcon icon={Calendar01Icon} className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
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
                            placeholder="Search sessions..."
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
