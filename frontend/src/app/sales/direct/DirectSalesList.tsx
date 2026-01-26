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
    AlertCircleIcon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface DirectSale {
    id: string
    sale_number: string
    sale_date: string
    sales_person: string
    customer_name: string
    customer_phone: string
    visit_type: 'showroom' | 'home_visit' | 'office_visit' | 'exhibition'
    location: string
    items: DirectSaleItem[]
    total_amount: number
    commission_amount: number
    commission_rate: number
    payment_status: 'pending' | 'paid' | 'partial' | 'failed'
    delivery_status: 'pending' | 'delivered' | 'cancelled'
    created_at: string
}

export interface DirectSaleItem {
    id: string
    product_name: string
    quantity: number
    line_total: number
}

// Colors
const paymentColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const visitTypeColors: Record<string, string> = {
    showroom: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    home_visit: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    office_visit: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    exhibition: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

interface DirectSalesListProps {
    initialData: DirectSale[]
}

export default function DirectSalesList({ initialData }: DirectSalesListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [sales, setSales] = useState<DirectSale[]>(initialData)

    // Filtered Data
    const filteredSales = useMemo(() => {
        if (!searchQuery) return sales
        const lowerQuery = searchQuery.toLowerCase()
        return sales.filter(
            (s) =>
                s.sale_number.toLowerCase().includes(lowerQuery) ||
                s.customer_name.toLowerCase().includes(lowerQuery) ||
                s.sales_person.toLowerCase().includes(lowerQuery)
        )
    }, [sales, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = sales.length
        const totalRevenue = sales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0)
        const pending = sales.filter(s => s.payment_status === 'pending').length
        const commission = sales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.commission_amount, 0)

        return { total, totalRevenue, pending, commission }
    }, [sales])

    // Handlers
    const handleEdit = (sale: DirectSale) => {
        router.push(`/sales/direct/${sale.id}/edit`)
    }

    const handleDelete = (sale: DirectSale) => {
        if (confirm('Are you sure you want to delete this sale?')) {
            setSales(prev => prev.filter(s => s.id !== sale.id))
            addToast({ type: 'success', title: 'Sale deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<DirectSale>[] = useMemo(() => [
        {
            id: 'sale_number',
            header: 'Sale Number',
            accessorKey: 'sale_number',
            cell: ({ row }) => (
                <Link
                    href={`/sales/direct/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.sale_number}
                </Link>
            ),
        },
        {
            id: 'date',
            header: 'Date',
            accessorKey: 'sale_date',
            cell: ({ row }) => new Date(row.original.sale_date).toLocaleDateString('id-ID'),
        },
        {
            id: 'sales_person',
            header: 'Sales Person',
            accessorKey: 'sales_person',
            cell: ({ row }) => <span className="font-medium">{row.original.sales_person}</span>,
        },
        {
            id: 'customer',
            header: 'Customer',
            accessorKey: 'customer_name',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.customer_name}</div>
                    <div className="text-xs text-gray-500">{row.original.customer_phone}</div>
                </div>
            ),
        },
        {
            id: 'visit_type',
            header: 'Type',
            accessorKey: 'visit_type',
            cell: ({ row }) => (
                <Badge className={visitTypeColors[row.original.visit_type] || visitTypeColors.showroom}>
                    {row.original.visit_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
            ),
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
            id: 'commission',
            header: 'Commission',
            accessorKey: 'commission_amount',
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="text-green-600 font-medium">
                        {row.original.commission_amount.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                        })}
                    </div>
                    <div className="text-xs text-gray-500">{row.original.commission_rate}%</div>
                </div>
            ),
        },
        {
            id: 'payment_status',
            header: 'Status',
            accessorKey: 'payment_status',
            cell: ({ row }) => (
                <Badge className={paymentColors[row.original.payment_status] || paymentColors.pending}>
                    {row.original.payment_status.charAt(0).toUpperCase() + row.original.payment_status.slice(1)}
                </Badge>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Direct Sales' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Direct Sales"
                description="Manage direct sales and field sales activities"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/direct/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Sale
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
                                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
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
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Commission</p>
                                <p className="text-2xl font-bold">
                                    {(stats.commission / 1000).toFixed(0)}K
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
                            placeholder="Search sales..."
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
