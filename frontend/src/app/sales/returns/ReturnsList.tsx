'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
    PlusSignIcon,
    RotateClockwiseIcon,
    Dollar01Icon,
    CheckmarkCircle01Icon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    AlertCircleIcon,
    Clock01Icon,
    CancelIcon,
    Package01Icon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface Return {
    id: string
    return_number: string
    return_date: string
    original_transaction: string
    customer_name: string
    customer_phone?: string
    customer_email?: string
    return_type: 'defective' | 'wrong_size' | 'wrong_color' | 'customer_change' | 'damaged' | 'other'
    return_reason: string
    processed_by: string
    items: ReturnItem[]
    subtotal: number
    refund_amount: number
    refund_method: 'cash' | 'card' | 'transfer' | 'store_credit' | 'exchange'
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
    approval_date?: string
    refund_date?: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface ReturnItem {
    id: string
    product_code: string
    product_name: string
    size: string
    color: string
    quantity: number
    unit_price: number
    line_total: number
    condition: 'good' | 'damaged' | 'defective'
}

// Status Colors
const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

const returnTypeColors: Record<string, string> = {
    defective: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    wrong_size: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    wrong_color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    customer_change: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    damaged: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    other: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

interface ReturnsListProps {
    initialData: Return[]
}

export default function ReturnsList({ initialData }: ReturnsListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [returns, setReturns] = useState<Return[]>(initialData)

    // Filtered Data
    const filteredReturns = useMemo(() => {
        if (!searchQuery) return returns
        const lowerQuery = searchQuery.toLowerCase()
        return returns.filter(
            (r) =>
                r.return_number.toLowerCase().includes(lowerQuery) ||
                r.customer_name.toLowerCase().includes(lowerQuery) ||
                r.original_transaction.toLowerCase().includes(lowerQuery)
        )
    }, [returns, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = returns.length
        const pending = returns.filter(r => r.status === 'pending').length
        const completed = returns.filter(r => r.status === 'completed').length
        const totalRefund = returns.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.refund_amount, 0)

        return { total, pending, completed, totalRefund }
    }, [returns])

    // Handlers
    const handleEdit = (returnItem: Return) => {
        router.push(`/sales/returns/${returnItem.id}/edit`)
    }

    const handleDelete = (returnItem: Return) => {
        if (confirm('Are you sure you want to delete this return?')) {
            setReturns(prev => prev.filter(r => r.id !== returnItem.id))
            addToast({ type: 'success', title: 'Return deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<Return>[] = useMemo(() => [
        {
            id: 'return_number',
            header: 'Return Number',
            accessorKey: 'return_number',
            cell: ({ row }) => (
                <Link
                    href={`/sales/returns/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.return_number}
                </Link>
            ),
        },
        {
            id: 'return_date',
            header: 'Date',
            accessorKey: 'return_date',
            cell: ({ row }) => new Date(row.original.return_date).toLocaleDateString('id-ID'),
        },
        {
            id: 'original_transaction',
            header: 'Original Order',
            accessorKey: 'original_transaction',
            cell: ({ row }) => <span className="font-mono text-sm">{row.original.original_transaction}</span>,
        },
        {
            id: 'customer_name',
            header: 'Customer',
            accessorKey: 'customer_name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.customer_name}</div>
                </div>
            ),
        },
        {
            id: 'return_type',
            header: 'Type',
            accessorKey: 'return_type',
            cell: ({ row }) => (
                <Badge className={returnTypeColors[row.original.return_type] || returnTypeColors.other}>
                    {row.original.return_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
            ),
        },
        {
            id: 'refund_amount',
            header: 'Refund Amount',
            accessorKey: 'refund_amount',
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.refund_amount > 0
                        ? row.original.refund_amount.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                        })
                        : 'Exchange'}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] || statusColors.pending}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Returns', href: '/sales/returns' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Returns & Refunds"
                description="Manage product returns and customer refunds"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/returns/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Return
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={RotateClockwiseIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Refunded</p>
                                <p className="text-2xl font-bold">
                                    {(stats.totalRefund / 1000000).toFixed(1)}M
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
                            placeholder="Search returns..."
                            className="pl-9 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    data={filteredReturns}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredReturns.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
