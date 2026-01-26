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
    ShoppingCartIcon,
    Dollar01Icon,
    CheckmarkCircle01Icon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    Clock01Icon,
    Package01Icon,
    TruckIcon,
    AlertCircleIcon,
    Globe02Icon,
    SmartPhone01Icon,
    Store01Icon,
    InstagramIcon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface OnlineSale {
    id: string
    order_number: string
    order_date: string
    platform: 'website' | 'marketplace' | 'social_media' | 'mobile_app'
    platform_name: string
    customer_name: string
    customer_email: string
    items_count: number
    total_amount: number
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    created_at: string
}

// Colors
const orderStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const paymentColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

const platformIcons: Record<string, any> = {
    website: Globe02Icon,
    marketplace: Store01Icon,
    social_media: InstagramIcon,
    mobile_app: SmartPhone01Icon,
}

interface OnlineSalesListProps {
    initialData: OnlineSale[]
}

export default function OnlineSalesList({ initialData }: OnlineSalesListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [sales, setSales] = useState<OnlineSale[]>(initialData)

    // Filtered Data
    const filteredSales = useMemo(() => {
        if (!searchQuery) return sales
        const lowerQuery = searchQuery.toLowerCase()
        return sales.filter(
            (s) =>
                s.order_number.toLowerCase().includes(lowerQuery) ||
                s.customer_name.toLowerCase().includes(lowerQuery) ||
                s.platform_name.toLowerCase().includes(lowerQuery)
        )
    }, [sales, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = sales.length
        const totalRevenue = sales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0)
        const pending = sales.filter(s => s.order_status === 'pending' || s.order_status === 'confirmed').length
        const shipped = sales.filter(s => s.order_status === 'shipped').length

        return { total, totalRevenue, pending, shipped }
    }, [sales])

    // Handlers
    const handleEdit = (sale: OnlineSale) => {
        router.push(`/sales/online/${sale.id}/edit`)
    }

    const handleDelete = (sale: OnlineSale) => {
        if (confirm('Are you sure you want to delete this order?')) {
            setSales(prev => prev.filter(s => s.id !== sale.id))
            addToast({ type: 'success', title: 'Order deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<OnlineSale>[] = useMemo(() => [
        {
            id: 'order_number',
            header: 'Order Number',
            accessorKey: 'order_number',
            cell: ({ row }) => (
                <Link
                    href={`/sales/online/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.order_number}
                </Link>
            ),
        },
        {
            id: 'order_date',
            header: 'Date',
            accessorKey: 'order_date',
            cell: ({ row }) => new Date(row.original.order_date).toLocaleDateString('id-ID'),
        },
        {
            id: 'platform',
            header: 'Platform',
            accessorKey: 'platform',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={platformIcons[row.original.platform] || Globe02Icon} className="h-4 w-4 text-gray-500" />
                    <span>{row.original.platform_name}</span>
                </div>
            ),
        },
        {
            id: 'customer',
            header: 'Customer',
            accessorKey: 'customer_name',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.customer_name}</div>
                    <div className="text-xs text-gray-500">{row.original.customer_email}</div>
                </div>
            ),
        },
        {
            id: 'items',
            header: 'Items',
            accessorKey: 'items_count',
            cell: ({ row }) => <span className="text-center block">{row.original.items_count}</span>,
        },
        {
            id: 'total_amount',
            header: 'Total',
            accessorKey: 'total_amount',
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.original.total_amount.toLocaleString('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                    })}
                </span>
            ),
        },
        {
            id: 'payment_status',
            header: 'Payment',
            accessorKey: 'payment_status',
            cell: ({ row }) => (
                <Badge className={paymentColors[row.original.payment_status] || paymentColors.pending}>
                    {row.original.payment_status.charAt(0).toUpperCase() + row.original.payment_status.slice(1)}
                </Badge>
            ),
        },
        {
            id: 'order_status',
            header: 'Status',
            accessorKey: 'order_status',
            cell: ({ row }) => (
                <Badge className={orderStatusColors[row.original.order_status] || orderStatusColors.pending}>
                    {row.original.order_status.charAt(0).toUpperCase() + row.original.order_status.slice(1)}
                </Badge>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Online Sales' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Online Sales"
                description="Manage e-commerce and digital channel sales"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/online/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Order
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
                                <HugeiconsIcon icon={ShoppingCartIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Today's Orders</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">
                                    {(stats.totalRevenue / 1000000).toFixed(1)}M
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
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={TruckIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                                <p className="text-2xl font-bold">{stats.shipped}</p>
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
                            placeholder="Search orders..."
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
                    data={filteredSales}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredSales.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
