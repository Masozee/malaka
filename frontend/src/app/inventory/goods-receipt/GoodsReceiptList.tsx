'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    TruckDeliveryIcon,
    Search01Icon,
    Download01Icon,
    PlusSignIcon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    Coins01Icon,
    SentIcon,
    EyeIcon,
    PencilEdit01Icon
} from '@hugeicons/core-free-icons'
import { goodsReceiptService } from '@/services/inventory'
import { apiClient } from '@/lib/api'

interface GoodsReceiptRow {
    id: string
    purchase_order_id: string
    receipt_date: string
    warehouse_id: string
    created_at?: string
    updated_at?: string
    receiptNumber?: string
    gr_number?: string
    supplierName?: string
    status?: string
    totalAmount?: number
    totalItems?: number
    totalQuantity?: number
    poNumber?: string
    warehouse?: string
    currency?: string
    notes?: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200' },
    POSTED: { label: 'Posted', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
}

export default function GoodsReceiptList() {
    const router = useRouter()
    const { addToast } = useToast()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [data, setData] = useState<GoodsReceiptRow[]>([])

    useEffect(() => {
        setMounted(true)
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await goodsReceiptService.getAll()
            setData(result.data as GoodsReceiptRow[])
        } catch (error) {
            console.error('Failed to fetch goods receipts:', error)
            addToast({ type: 'error', title: 'Failed to load goods receipts' })
        } finally {
            setLoading(false)
        }
    }

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        const lower = searchQuery.toLowerCase()
        return data.filter(item =>
            (item.receiptNumber && item.receiptNumber.toLowerCase().includes(lower)) ||
            (item.gr_number && item.gr_number.toLowerCase().includes(lower)) ||
            (item.supplierName && item.supplierName.toLowerCase().includes(lower)) ||
            (item.poNumber && item.poNumber.toLowerCase().includes(lower))
        )
    }, [data, searchQuery])

    const stats = useMemo(() => {
        const total = data.length
        const draft = data.filter(i => i.status === 'DRAFT').length
        const posted = data.filter(i => i.status === 'POSTED').length
        const totalValue = data.reduce((sum, i) => sum + (i.totalAmount || 0), 0)
        return { total, draft, posted, totalValue }
    }, [data])

    const handlePost = async (item: GoodsReceiptRow) => {
        if (item.status !== 'DRAFT') {
            addToast({ type: 'error', title: 'Only draft receipts can be posted' })
            return
        }
        if (!confirm('Post this goods receipt? This will update stock and create journal entries.')) return

        try {
            await apiClient.post(`/api/v1/inventory/goods-receipts/${item.id}/post`, {})
            addToast({ type: 'success', title: 'Goods receipt posted successfully' })
            fetchData()
        } catch (error) {
            console.error('Failed to post goods receipt:', error)
            addToast({ type: 'error', title: 'Failed to post goods receipt' })
        }
    }

    const handleBatchExport = (items: GoodsReceiptRow[]) => {
        const headers = ['Receipt #', 'PO #', 'Supplier', 'Warehouse', 'Date', 'Items', 'Value', 'Status']
        const rows = items.map(item => [
            item.gr_number || item.receiptNumber || item.id.substring(0, 8),
            item.poNumber || '-',
            item.supplierName || '-',
            item.warehouse || '-',
            item.receipt_date ? new Date(item.receipt_date).toLocaleDateString('id-ID') : '-',
            item.totalItems || 0,
            item.totalAmount || 0,
            item.status || 'DRAFT'
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `goods-receipts-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const columns: TanStackColumn<GoodsReceiptRow>[] = useMemo(() => [
        {
            id: 'receiptNumber',
            header: 'Receipt #',
            accessorKey: 'receiptNumber',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/goods-receipt/${row.original.id}`}
                        className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.gr_number || row.original.receiptNumber || row.original.id.substring(0, 8)}
                    </Link>
                    {row.original.poNumber && (
                        <span className="text-xs text-muted-foreground">
                            PO: {row.original.poNumber}
                        </span>
                    )}
                </div>
            )
        },
        {
            id: 'supplier',
            header: 'Supplier',
            accessorKey: 'supplierName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.supplierName || '-'}</span>
                    <span className="text-xs text-muted-foreground">{row.original.warehouse || '-'}</span>
                </div>
            )
        },
        {
            id: 'date',
            header: 'Date',
            accessorKey: 'receipt_date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {mounted && row.original.receipt_date ? new Date(row.original.receipt_date).toLocaleDateString('id-ID') : '-'}
                </span>
            )
        },
        {
            id: 'items',
            header: 'Items',
            accessorKey: 'totalItems',
            cell: ({ row }) => (
                <div className="text-center text-sm font-medium">
                    {row.original.totalItems || 0}
                </div>
            )
        },
        {
            id: 'value',
            header: 'Value',
            accessorKey: 'totalAmount',
            cell: ({ row }) => (
                <div className="font-medium text-sm">
                    {mounted ? ((row.original.totalAmount || 0)).toLocaleString('id-ID', { style: 'currency', currency: row.original.currency || 'IDR', maximumFractionDigits: 0 }) : '-'}
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = statusConfig[row.original.status || 'DRAFT'] || statusConfig.DRAFT
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
                title="Goods Receipt"
                description="Manage incoming inventory deliveries"
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Goods Receipt' }
                ]}
                actions={
                    <Link href="/inventory/goods-receipt/create">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Receipt
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={TruckDeliveryIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Receipts</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Coins01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">
                                    {mounted ? `${(stats.totalValue / 1000000).toLocaleString('id-ID')}M` : '-'}
                                </p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                                <p className="text-2xl font-bold">{stats.draft}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Posted</p>
                                <p className="text-2xl font-bold">{stats.posted}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search receipts..."
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
                        <div className="text-muted-foreground">Loading receipts...</div>
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
                                onClick: (item) => router.push(`/inventory/goods-receipt/${item.id}`),
                            },
                            {
                                label: 'Post',
                                icon: SentIcon,
                                onClick: (item) => handlePost(item),
                            },
                            {
                                label: 'Edit',
                                icon: PencilEdit01Icon,
                                onClick: (item) => router.push(`/inventory/goods-receipt/${item.id}/edit`),
                            }
                        ]}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
