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
    Presentation01Icon,
    AlertCircleIcon,
    CheckmarkCircle01Icon,
    Dollar01Icon,
    ChartHistogramIcon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface SalesReconciliation {
    id: string
    reconciliation_number: string
    reconciliation_date: string
    reconciliation_period: string
    location: string
    location_type: 'store' | 'warehouse' | 'region' | 'online'
    reconciliation_type: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    total_sales_recorded: number
    variance_amount: number
    variance_percentage: number
    issues_found: number
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed'
}

// Colors
const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    completed: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
}

const locationColors: Record<string, string> = {
    store: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    warehouse: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    region: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    online: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

interface ReconciliationListProps {
    initialData: SalesReconciliation[]
}

export default function ReconciliationList({ initialData }: ReconciliationListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [reconciliations, setReconciliations] = useState<SalesReconciliation[]>(initialData)

    // Filtered Data
    const filteredReconciliations = useMemo(() => {
        if (!searchQuery) return reconciliations
        const lowerQuery = searchQuery.toLowerCase()
        return reconciliations.filter(
            (r) =>
                r.reconciliation_number.toLowerCase().includes(lowerQuery) ||
                r.location.toLowerCase().includes(lowerQuery)
        )
    }, [reconciliations, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = reconciliations.length
        const pending = reconciliations.filter(r => ['pending', 'in_review'].includes(r.status)).length
        const totalSales = reconciliations.reduce((sum, r) => sum + r.total_sales_recorded, 0)
        const totalVariance = reconciliations.reduce((sum, r) => sum + Math.abs(r.variance_amount), 0)

        // Calculate Average Variance Percentage (absolute values)
        const avgVariance = reconciliations.length > 0
            ? (reconciliations.reduce((sum, r) => sum + Math.abs(r.variance_percentage), 0) / reconciliations.length)
            : 0;

        return { total, pending, totalSales, totalVariance, avgVariance }
    }, [reconciliations])

    // Handlers
    const handleEdit = (rec: SalesReconciliation) => {
        router.push(`/sales/reconciliation/${rec.id}/edit`)
    }

    const handleDelete = (rec: SalesReconciliation) => {
        if (confirm('Are you sure you want to delete this reconciliation?')) {
            setReconciliations(prev => prev.filter(r => r.id !== rec.id))
            addToast({ type: 'success', title: 'Reconciliation deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<SalesReconciliation>[] = useMemo(() => [
        {
            id: 'reconciliation_number',
            header: 'Reconciliation #',
            accessorKey: 'reconciliation_number',
            cell: ({ row }) => (
                <Link
                    href={`/sales/reconciliation/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.reconciliation_number}
                </Link>
            ),
        },
        {
            id: 'location',
            header: 'Location',
            accessorKey: 'location',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.location}</div>
                    <div className="text-xs text-gray-500">{row.original.reconciliation_period}</div>
                </div>
            ),
        },
        {
            id: 'location_type',
            header: 'Type',
            accessorKey: 'location_type',
            cell: ({ row }) => (
                <Badge className={locationColors[row.original.location_type] || locationColors.store}>
                    {row.original.location_type.charAt(0).toUpperCase() + row.original.location_type.slice(1)}
                </Badge>
            ),
        },
        {
            id: 'sales_amount',
            header: 'Sales Recorded',
            accessorKey: 'total_sales_recorded',
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.total_sales_recorded.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                    })}
                </span>
            ),
        },
        {
            id: 'variance',
            header: 'Variance',
            accessorKey: 'variance_amount',
            cell: ({ row }) => {
                const variance = row.original.variance_amount;
                const percentage = row.original.variance_percentage;
                const isPositive = variance > 0;
                const isZero = variance === 0;

                const colorClass = isZero ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600';

                return (
                    <div className={`text-right ${colorClass}`}>
                        <div className="font-medium">
                            {Math.abs(variance).toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                            })}
                        </div>
                        <div className="text-xs">
                            {isZero ? '' : (isPositive ? '+' : '')}{percentage.toFixed(2)}%
                        </div>
                    </div>
                )
            }
        },
        {
            id: 'issues',
            header: 'Issues',
            accessorKey: 'issues_found',
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.issues_found > 0 ? (
                        <span className="text-red-600 font-bold">{row.original.issues_found}</span>
                    ) : (
                        <span className="text-green-600">0</span>
                    )}
                </div>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] || statusColors.pending}>
                    {row.original.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Reconciliation' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Sales Reconciliation"
                description="Reconcile sales transactions and resolve discrepancies"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/reconciliation/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Reconciliation
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
                                <HugeiconsIcon icon={Presentation01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
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
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                                <p className="text-2xl font-bold">
                                    {(stats.totalSales / 1000000000).toFixed(1)}B
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ChartHistogramIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg Variance</p>
                                <p className="text-2xl font-bold">{stats.avgVariance.toFixed(2)}%</p>
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
                            placeholder="Search reconciliations..."
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
                    data={filteredReconciliations}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredReconciliations.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
