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
    CancelIcon,
    AlertCircleIcon,
    Clock01Icon,
    Package01Icon,
    Archive01Icon
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface SalesOrder {
    id: string
    order_number: string
    order_date: string
    customer_id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    sales_person: string
    order_type: 'wholesale' | 'retail' | 'distributor' | 'export'
    delivery_address: string
    items: OrderItem[]
    subtotal: number
    tax_amount: number
    discount_amount: number
    shipping_cost: number
    total_amount: number
    status: 'draft' | 'confirmed' | 'production' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    payment_terms: string
    due_date: string
    estimated_delivery: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface OrderItem {
    id: string
    product_code: string
    product_name: string
    size: string
    color: string
    quantity: number
    unit_price: number
    discount_percentage: number
    line_total: number
}

// Status Colors
const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    production: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ready: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    shipped: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

interface OrdersListProps {
    initialData: SalesOrder[]
}

export default function OrdersList({ initialData }: OrdersListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [orders, setOrders] = useState<SalesOrder[]>(initialData)
    const [loading, setLoading] = useState(false)

    // Filtered Data
    const filteredOrders = useMemo(() => {
        if (!searchQuery) return orders
        const lowerQuery = searchQuery.toLowerCase()
        return orders.filter(
            (order) =>
                order.order_number.toLowerCase().includes(lowerQuery) ||
                order.customer_name.toLowerCase().includes(lowerQuery)
        )
    }, [orders, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = orders.length
        const confirmed = orders.filter(o => o.status === 'confirmed').length
        const totalValue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        const urgent = orders.filter(o => o.priority === 'urgent').length

        return { total, confirmed, totalValue, urgent }
    }, [orders])

    // Handlers
    const handleEdit = (order: SalesOrder) => {
        router.push(`/sales/orders/${order.id}/edit`)
    }

    const handleDelete = (order: SalesOrder) => {
        if (confirm('Are you sure you want to delete this order?')) {
            setOrders(prev => prev.filter(o => o.id !== order.id))
            addToast({ type: 'success', title: 'Order deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<SalesOrder>[] = useMemo(() => [
        {
            id: 'order_number',
            header: 'Order Number',
            accessorKey: 'order_number',
            cell: ({ row }) => (
                <Link
                    href={`/sales/orders/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.order_number}
                </Link>
            ),
        },
        {
            id: 'customer_name',
            header: 'Customer',
            accessorKey: 'customer_name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.customer_name}</div>
                    <div className="text-sm text-gray-500">{row.original.customer_email}</div>
                </div>
            ),
        },
        {
            id: 'order_date',
            header: 'Date',
            accessorKey: 'order_date',
            cell: ({ row }) => new Date(row.original.order_date).toLocaleDateString('id-ID'),
        },
        {
            id: 'total_amount',
            header: 'Total Amount',
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
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] || statusColors.draft}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            ),
        },
        {
            id: 'priority',
            header: 'Priority',
            accessorKey: 'priority',
            cell: ({ row }) => (
                <Badge className={priorityColors[row.original.priority] || priorityColors.normal}>
                    {row.original.priority.charAt(0).toUpperCase() + row.original.priority.slice(1)}
                </Badge>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Orders' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Sales Orders"
                description="Manage customer orders and sales processes"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/orders/new">
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
                                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
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

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                                <p className="text-2xl font-bold">{stats.urgent}</p>
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
                    data={filteredOrders}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredOrders.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
