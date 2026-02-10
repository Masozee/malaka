'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Download01Icon,
    PlusSignIcon,
    Settings01Icon,
    Clock01Icon,
    CheckmarkCircle01Icon,
    Search01Icon,
    EyeIcon,
    PencilEdit01Icon
} from '@hugeicons/core-free-icons'
import { stockAdjustmentService, StockAdjustment } from '@/services/inventory'

export default function StockAdjustmentsPage() {
    const router = useRouter()
    const { addToast } = useToast()
    const [mounted, setMounted] = useState(false)
    const [data, setData] = useState<StockAdjustment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        setMounted(true)
        fetchAdjustmentData()
    }, [])

    const fetchAdjustmentData = async () => {
        try {
            setLoading(true)
            const response = await stockAdjustmentService.getAll()
            setData(response.data)
        } catch (error) {
            console.error('Error fetching stock adjustment data:', error)
            addToast({ type: 'error', title: 'Failed to fetch adjustments' })
        } finally {
            setLoading(false)
        }
    }

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        const lower = searchQuery.toLowerCase()
        return data.filter(item =>
            (item.adjustmentNumber && item.adjustmentNumber.toLowerCase().includes(lower)) ||
            (item.articleName && item.articleName.toLowerCase().includes(lower)) ||
            (item.articleCode && item.articleCode.toLowerCase().includes(lower)) ||
            (item.warehouseName && item.warehouseName.toLowerCase().includes(lower)) ||
            (item.reason && item.reason.toLowerCase().includes(lower))
        )
    }, [data, searchQuery])

    const stats = useMemo(() => {
        const total = data.length
        const withReason = data.filter(i => !!i.reason).length
        const noReason = data.filter(i => !i.reason).length
        return { total, withReason, noReason }
    }, [data])

    const handleBatchExport = (items: StockAdjustment[]) => {
        const headers = ['Adjustment Number', 'Article', 'Warehouse', 'Quantity', 'Reason', 'Date']
        const rows = items.map(item => [
            item.adjustmentNumber,
            `${item.articleName} (${item.articleCode})`,
            `${item.warehouseName} (${item.warehouseCode})`,
            item.quantity,
            item.reason || '-',
            item.adjustmentDate ? new Date(item.adjustmentDate).toLocaleDateString('id-ID') : '-'
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `stock-adjustments-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const columns: TanStackColumn<StockAdjustment>[] = useMemo(() => [
        {
            id: 'adjustmentNumber',
            header: 'Adjustment',
            accessorKey: 'adjustmentNumber',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/adjustments/${row.original.id}`}
                        className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.adjustmentNumber}
                    </Link>
                    {row.original.adjustmentDate && (
                        <span className="text-xs text-muted-foreground">
                            {mounted ? new Date(row.original.adjustmentDate).toLocaleDateString('id-ID') : ''}
                        </span>
                    )}
                </div>
            )
        },
        {
            id: 'article',
            header: 'Article',
            accessorKey: 'articleName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.articleName || '-'}</span>
                    <span className="text-xs text-muted-foreground">{row.original.articleCode}</span>
                </div>
            )
        },
        {
            id: 'warehouse',
            header: 'Warehouse',
            accessorKey: 'warehouseName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.warehouseName || '-'}</span>
                    <span className="text-xs text-muted-foreground">{row.original.warehouseCode}</span>
                </div>
            )
        },
        {
            id: 'quantity',
            header: 'Quantity',
            accessorKey: 'quantity',
            cell: ({ row }) => {
                const qty = row.original.quantity
                const color = qty > 0 ? 'text-green-600' : qty < 0 ? 'text-red-600' : 'text-gray-600'
                return (
                    <div className={`font-medium text-sm text-center ${color}`}>
                        {qty > 0 ? '+' : ''}{qty}
                    </div>
                )
            }
        },
        {
            id: 'reason',
            header: 'Reason',
            accessorKey: 'reason',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                    {row.original.reason || '-'}
                </span>
            )
        }
    ], [mounted])

    return (
        <TwoLevelLayout>
            <Header
                title="Stock Adjustments"
                description="Manage inventory adjustments and corrections"
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Adjustments' }
                ]}
                actions={
                    <Link href="/inventory/adjustments/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Adjustment
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Adjustments</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">With Reason</p>
                                <p className="text-2xl font-bold">{stats.withReason}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">No Reason</p>
                                <p className="text-2xl font-bold">{stats.noReason}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search adjustments..."
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
                        <div className="text-muted-foreground">Loading adjustments...</div>
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
                                onClick: (item) => router.push(`/inventory/adjustments/${item.id}`),
                            },
                            {
                                label: 'Edit',
                                icon: PencilEdit01Icon,
                                onClick: (item) => router.push(`/inventory/adjustments/${item.id}/edit`),
                            }
                        ]}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
