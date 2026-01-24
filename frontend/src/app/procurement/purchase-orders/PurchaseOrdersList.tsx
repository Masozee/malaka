'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn, CustomAction } from '@/components/ui/tanstack-data-table'
import { purchaseOrderService } from '@/services/procurement'
import { useToast } from '@/components/ui/toast'
import type { PurchaseOrder } from '@/types/procurement'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PlusSignIcon,
    ShoppingCartIcon,
    Clock01Icon,
    CheckmarkCircle01Icon,
    Dollar01Icon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    CancelIcon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Status color mappings
const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    pending_approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    sent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    confirmed: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const paymentStatusColors: Record<string, string> = {
    unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

interface PurchaseOrdersListProps {
    initialData: PurchaseOrder[]
    userId?: string
}

export default function PurchaseOrdersList({ initialData, userId }: PurchaseOrdersListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialData)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Note: For true server-side pagination, we would need to fetch on page change.
    // Current implementation in page.tsx seemed to do client-side pagination on the fetched set 
    // OR fetched all data. The service `getAll` accepts pagination params. 
    // Optimizing to client-side filtering of initial data for simplicity if data set is small, 
    // otherwise we should re-fetch from server actions or API.
    // Assuming hybrid: Initial data is page 1.

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: initialData.length, // This might be inaccurate if valid pagination total wasn't passed, but fits current simple migration
    })

    // Refetch when search/page changes (Client Interaction)
    const loadPurchaseOrders = async (page = 1, search = '') => {
        try {
            setLoading(true)
            setError(null)
            const response = await purchaseOrderService.getAll({
                page,
                limit: pagination.limit,
                search,
            })
            setPurchaseOrders(response.data || [])
            setPagination(prev => ({
                ...prev,
                page: response.page,
                total: response.total,
            }))
        } catch (err) {
            console.error('Failed to load purchase orders:', err)
            setError('Failed to load purchase orders. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (value: string) => {
        setSearchQuery(value)
        loadPurchaseOrders(1, value)
    }

    const handlePageChange = (pageIndex: number) => {
        loadPurchaseOrders(pageIndex + 1, searchQuery)
    }

    const handleEdit = (po: PurchaseOrder) => {
        router.push(`/procurement/purchase-orders/${po.id}/edit`)
    }

    const handleDelete = async (po: PurchaseOrder) => {
        if (!confirm(`Are you sure you want to delete PO ${po.po_number}?`)) return

        try {
            await purchaseOrderService.delete(po.id)
            addToast({ type: 'success', title: 'Purchase order deleted successfully' })
            loadPurchaseOrders(pagination.page, searchQuery)
        } catch (err) {
            console.error('Failed to delete purchase order:', err)
            addToast({ type: 'error', title: 'Failed to delete purchase order' })
        }
    }

    const handleDownloadPDF = async (po: PurchaseOrder) => {
        try {
            const { downloadPurchaseOrderPDF } = await import('@/components/procurement/purchase-order-pdf')
            await downloadPurchaseOrderPDF(po)
            addToast({ type: 'success', title: 'PDF downloaded successfully' })
        } catch (err) {
            console.error('Failed to download PDF:', err)
            addToast({ type: 'error', title: 'Failed to download PDF' })
        }
    }

    // Custom actions for the table
    const customActions: CustomAction<PurchaseOrder>[] = useMemo(() => [
        {
            label: 'Download PDF',
            icon: Download01Icon,
            onClick: handleDownloadPDF,
        },
    ], [])

    // Calculate statistics
    const stats = useMemo(() => {
        const total = purchaseOrders.length
        const draft = purchaseOrders.filter(po => po.status === 'draft').length
        const sent = purchaseOrders.filter(po => po.status === 'sent' || po.status === 'pending_approval' || po.status === 'approved').length
        const confirmed = purchaseOrders.filter(po => po.status === 'confirmed').length
        const totalValue = purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0)

        return { total, draft, sent, confirmed, totalValue }
    }, [purchaseOrders])

    // Table columns
    const columns: TanStackColumn<PurchaseOrder>[] = useMemo(() => [
        {
            id: 'po_number',
            header: 'PO Number',
            accessorKey: 'po_number',
            cell: ({ row }) => (
                <Link
                    href={`/procurement/purchase-orders/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.po_number || `PO-${row.original.id.slice(-6).toUpperCase()}`}
                </Link>
            ),
        },
        {
            id: 'supplier_name',
            header: 'Supplier',
            accessorKey: 'supplier_name',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.supplier_name || '-'}</span>
            ),
        },
        {
            id: 'order_date',
            header: 'Order Date',
            accessorKey: 'order_date',
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.order_date
                        ? new Date(row.original.order_date).toLocaleDateString('id-ID')
                        : '-'}
                </span>
            ),
        },
        {
            id: 'expected_delivery_date',
            header: 'Expected Delivery',
            accessorKey: 'expected_delivery_date',
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.expected_delivery_date
                        ? new Date(row.original.expected_delivery_date).toLocaleDateString('id-ID')
                        : '-'}
                </span>
            ),
        },
        {
            id: 'total_amount',
            header: 'Total Amount',
            accessorKey: 'total_amount',
            cell: ({ row }) => (
                <span className="text-sm font-medium">
                    {row.original.total_amount
                        ? row.original.total_amount.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: row.original.currency || 'IDR',
                            maximumFractionDigits: 0,
                        })
                        : '-'}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const status = row.original.status || 'draft'
                return (
                    <Badge className={statusColors[status] || statusColors.draft}>
                        {status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                )
            },
        },
        {
            id: 'payment_status',
            header: 'Payment',
            accessorKey: 'payment_status',
            cell: ({ row }) => {
                const paymentStatus = row.original.payment_status || 'unpaid'
                return (
                    <Badge className={paymentStatusColors[paymentStatus] || paymentStatusColors.unpaid}>
                        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                    </Badge>
                )
            },
        },
    ], [])

    const breadcrumbs = [
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Orders' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Purchase Orders"
                description="Manage purchase orders and supplier transactions"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/procurement/purchase-orders/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            Create PO
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Statistics Cards - Max 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ShoppingCartIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold">{pagination.total || stats.total}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">{stats.sent}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                                <p className="text-2xl font-bold">{stats.confirmed}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">
                                    {(stats.totalValue / 1000000).toFixed(1)}M
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-end gap-2">
                    <div className="relative">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        />
                        <Input
                            placeholder="Search purchase orders..."
                            className="pl-9 w-64"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
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

                {/* Data Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={CancelIcon} className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">Error Loading Purchase Orders</p>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={() => loadPurchaseOrders()}>Try Again</Button>
                        </div>
                    </div>
                ) : purchaseOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={ShoppingCartIcon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">No Purchase Orders Found</p>
                            <p className="text-muted-foreground mb-4">Get started by creating your first purchase order.</p>
                            <Link href="/procurement/purchase-orders/new">
                                <Button>
                                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                                    Create PO
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={purchaseOrders}
                        columns={columns}
                        pagination={{
                            pageIndex: pagination.page - 1,
                            pageSize: pagination.limit,
                            totalRows: pagination.total,
                            onPageChange: handlePageChange,
                        }}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        customActions={customActions}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
