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
    AlertCircleIcon,
    QuotesIcon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface Quotation {
    id: string
    quotation_number: string
    quotation_date: string
    customer_id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    sales_person: string
    quotation_type: 'standard' | 'custom' | 'bulk' | 'export'
    delivery_address: string
    items: QuotationItem[]
    subtotal: number
    tax_amount: number
    discount_amount: number
    shipping_cost: number
    total_amount: number
    status: 'draft' | 'sent' | 'reviewed' | 'approved' | 'rejected' | 'expired' | 'converted'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    payment_terms: string
    valid_until: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface QuotationItem {
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
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    reviewed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

interface QuotationsListProps {
    initialData: Quotation[]
}

export default function QuotationsList({ initialData }: QuotationsListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [quotations, setQuotations] = useState<Quotation[]>(initialData)

    // Filtered Data
    const filteredQuotations = useMemo(() => {
        if (!searchQuery) return quotations
        const lowerQuery = searchQuery.toLowerCase()
        return quotations.filter(
            (q) =>
                q.quotation_number.toLowerCase().includes(lowerQuery) ||
                q.customer_name.toLowerCase().includes(lowerQuery)
        )
    }, [quotations, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = quotations.length
        const approved = quotations.filter(q => q.status === 'approved').length
        const totalValue = quotations.filter(q => q.status !== 'rejected' && q.status !== 'expired').reduce((sum, q) => sum + q.total_amount, 0)
        const urgent = quotations.filter(q => q.priority === 'urgent').length

        return { total, approved, totalValue, urgent }
    }, [quotations])

    // Handlers
    const handleEdit = (quotation: Quotation) => {
        router.push(`/sales/quotations/${quotation.id}/edit`)
    }

    const handleDelete = (quotation: Quotation) => {
        if (confirm('Are you sure you want to delete this quotation?')) {
            setQuotations(prev => prev.filter(q => q.id !== quotation.id))
            addToast({ type: 'success', title: 'Quotation deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<Quotation>[] = useMemo(() => [
        {
            id: 'quotation_number',
            header: 'Quotation Number',
            accessorKey: 'quotation_number',
            cell: ({ row }) => (
                <Link
                    href={`/sales/quotations/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.quotation_number}
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
            id: 'quotation_date',
            header: 'Date',
            accessorKey: 'quotation_date',
            cell: ({ row }) => new Date(row.original.quotation_date).toLocaleDateString('id-ID'),
        },
        {
            id: 'valid_until',
            header: 'Valid Until',
            accessorKey: 'valid_until',
            cell: ({ row }) => new Date(row.original.valid_until).toLocaleDateString('id-ID'),
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
        { label: 'Quotations' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Quotations"
                description="Manage customer quotations and sales proposals"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/quotations/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Quotation
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
                                <HugeiconsIcon icon={QuotesIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Quotations</p>
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
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                                <p className="text-2xl font-bold">{stats.approved}</p>
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
                            placeholder="Search quotations..."
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
                    data={filteredQuotations}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredQuotations.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
