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
    GiftIcon,
    CheckmarkCircle01Icon,
    Dollar01Icon,
    UserMultiple02Icon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    Tag01Icon,
    PercentIcon,
    Package01Icon,
    TargetIcon,
    Clock01Icon,
    AlertCircleIcon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface SalesPromotion {
    id: string
    promotion_code: string
    promotion_name: string
    promotion_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'bundle' | 'free_shipping' | 'cashback'
    discount_value: number
    minimum_purchase?: number
    maximum_discount?: number
    target_audience: 'all_customers' | 'new_customers' | 'vip_customers' | 'specific_group'
    target_products: 'all_products' | 'specific_categories' | 'specific_items'
    start_date: string
    end_date: string
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
    usage_limit?: number
    usage_count: number
    total_sales: number
    total_discount_given: number
    conversion_rate: number
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
}

// Colors and Icons
const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const typeIcons: Record<string, any> = {
    percentage: PercentIcon,
    fixed_amount: Dollar01Icon,
    buy_one_get_one: GiftIcon,
    bundle: Package01Icon,
    free_shipping: TargetIcon,
    cashback: Dollar01Icon,
}

interface PromotionsListProps {
    initialData: SalesPromotion[]
}

export default function PromotionsList({ initialData }: PromotionsListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [promotions, setPromotions] = useState<SalesPromotion[]>(initialData)

    // Filtered Data
    const filteredPromotions = useMemo(() => {
        if (!searchQuery) return promotions
        const lowerQuery = searchQuery.toLowerCase()
        return promotions.filter(
            (p) =>
                p.promotion_code.toLowerCase().includes(lowerQuery) ||
                p.promotion_name.toLowerCase().includes(lowerQuery)
        )
    }, [promotions, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = promotions.length
        const active = promotions.filter(p => p.status === 'active').length
        const totalSales = promotions.reduce((sum, p) => sum + p.total_sales, 0)
        const totalUsage = promotions.reduce((sum, p) => sum + p.usage_count, 0)

        return { total, active, totalSales, totalUsage }
    }, [promotions])

    // Handlers
    const handleEdit = (promotion: SalesPromotion) => {
        router.push(`/sales/promotions/${promotion.id}/edit`)
    }

    const handleDelete = (promotion: SalesPromotion) => {
        if (confirm('Are you sure you want to delete this promotion?')) {
            setPromotions(prev => prev.filter(p => p.id !== promotion.id))
            addToast({ type: 'success', title: 'Promotion deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<SalesPromotion>[] = useMemo(() => [
        {
            id: 'promotion_code',
            header: 'Code',
            accessorKey: 'promotion_code',
            cell: ({ row }) => (
                <Link
                    href={`/sales/promotions/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.promotion_code}
                </Link>
            ),
        },
        {
            id: 'promotion_name',
            header: 'Name',
            accessorKey: 'promotion_name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.promotion_name}</div>
                    <div className="text-sm text-gray-500">
                        {row.original.promotion_type.replace(/_/g, ' ').toUpperCase()}
                        {row.original.discount_value > 0 && ` - ${row.original.discount_value}${row.original.promotion_type === 'percentage' ? '%' : ''}`}
                    </div>
                </div>
            ),
        },
        {
            id: 'start_date',
            header: 'Start Date',
            accessorKey: 'start_date',
            cell: ({ row }) => new Date(row.original.start_date).toLocaleDateString('id-ID'),
        },
        {
            id: 'end_date',
            header: 'End Date',
            accessorKey: 'end_date',
            cell: ({ row }) => new Date(row.original.end_date).toLocaleDateString('id-ID'),
        },
        {
            id: 'usage_count',
            header: 'Usage',
            accessorKey: 'usage_count',
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.usage_count}
                    {row.original.usage_limit ? ` / ${row.original.usage_limit}` : ''}
                </div>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] || statusColors.draft}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Promotions' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Sales Promotions"
                description="Manage promotional campaigns and track performance"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/promotions/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Promotion
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
                                <HugeiconsIcon icon={GiftIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Sales Generated</p>
                                <p className="text-2xl font-bold">
                                    {(stats.totalSales / 1000000000).toFixed(1)}B
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={UserMultiple02Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                                <p className="text-2xl font-bold">{(stats.totalUsage / 1000).toFixed(1)}K</p>
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
                            placeholder="Search promotions..."
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
                    data={filteredPromotions}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredPromotions.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
