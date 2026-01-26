'use client'

import { useState, useMemo } from 'react'
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
    UserIcon,
    Invoice01Icon,
    Coins01Icon
} from '@hugeicons/core-free-icons'
import { GoodsReceipt } from '@/services/inventory'

interface GoodsReceiptListProps {
    initialData: GoodsReceipt[]
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: CheckmarkCircle01Icon }, // Using checkmark for approved as well for now
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: AlertCircleIcon }
}

export default function GoodsReceiptList({ initialData }: GoodsReceiptListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [data, setData] = useState<GoodsReceipt[]>(initialData)

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        const lower = searchQuery.toLowerCase()
        return data.filter(item =>
            (item.receiptNumber && item.receiptNumber.toLowerCase().includes(lower)) ||
            (item.supplierName && item.supplierName.toLowerCase().includes(lower)) ||
            (item.poNumber && item.poNumber.toLowerCase().includes(lower))
        )
    }, [data, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = data.length
        const pending = data.filter(i => i.status === 'pending').length
        const completed = data.filter(i => i.status === 'completed').length
        const totalValue = data.reduce((sum, i) => sum + (i.totalAmount || 0), 0)

        return { total, pending, completed, totalValue }
    }, [data])

    const handleDelete = async (item: GoodsReceipt) => {
        if (confirm('Are you sure you want to delete this receipt?')) {
            // API call would go here
            setData(prev => prev.filter(i => i.id !== item.id))
            addToast({ type: 'success', title: 'Receipt deleted' })
        }
    }

    const columns: TanStackColumn<GoodsReceipt>[] = useMemo(() => [
        {
            id: 'receiptNumber',
            header: 'Receipt #',
            accessorKey: 'receiptNumber',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/goods-receipt/${row.original.id}`}
                        className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.receiptNumber || row.original.id.substring(0, 8)}
                    </Link>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <HugeiconsIcon icon={Invoice01Icon} className="h-3 w-3" />
                        PO: {row.original.poNumber || row.original.purchase_order_id}
                    </span>
                </div>
            )
        },
        {
            id: 'supplier',
            header: 'Supplier',
            accessorKey: 'supplierName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.supplierName}</span>
                    <span className="text-xs text-muted-foreground">{row.original.warehouse}</span>
                </div>
            )
        },
        {
            id: 'date',
            header: 'Date',
            accessorKey: 'receipt_date',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                    {row.original.receipt_date ? new Date(row.original.receipt_date).toLocaleDateString() : '-'}
                </div>
            )
        },
        {
            id: 'items',
            header: 'Items',
            accessorKey: 'totalItems',
            cell: ({ row }) => (
                <div className="text-center text-sm font-medium">
                    {row.original.totalItems}
                </div>
            )
        },
        {
            id: 'value',
            header: 'Value',
            accessorKey: 'totalAmount',
            cell: ({ row }) => (
                <div className="font-medium text-sm">
                    {((row.original.totalAmount || 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
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
                    <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
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
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Receipts</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">
                                    {(stats.totalValue / 1000000).toLocaleString('id-ID')}M
                                </p>
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
                            placeholder="Search receipts..."
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
                    onEdit={(item) => router.push(`/inventory/goods-receipt/${item.id}/edit`)}
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
