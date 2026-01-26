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
    Agreement01Icon,
    CheckmarkCircle01Icon,
    ChartColumnIcon,
    AnalyticsUpIcon,
    Dollar01Icon,
    FilterIcon,
    Search01Icon,
    Download01Icon,
    StoreIcon,
    Package01Icon,
    UserIcon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface ConsignmentDeal {
    id: string
    consignment_number: string
    partner_type: 'store' | 'distributor' | 'agent' | 'individual'
    partner_name: string
    partner_location: string
    contact_person: string
    start_date: string
    end_date?: string
    status: 'active' | 'pending' | 'completed' | 'cancelled' | 'expired'
    commission_rate: number
    payment_terms: 'monthly' | 'quarterly' | 'on_sale' | 'custom'
    total_items: number
    total_quantity: number
    total_value: number
    sold_quantity: number
    sold_value: number
    commission_earned: number
}

// Colors
const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

const partnerColors: Record<string, string> = {
    store: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    distributor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    agent: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    individual: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

const partnerIcons: Record<string, any> = {
    store: StoreIcon,
    distributor: Package01Icon,
    agent: UserIcon,
    individual: UserIcon,
}

interface ConsignmentListProps {
    initialData: ConsignmentDeal[]
}

export default function ConsignmentList({ initialData }: ConsignmentListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [consignments, setConsignments] = useState<ConsignmentDeal[]>(initialData)

    // Filtered Data
    const filteredConsignments = useMemo(() => {
        if (!searchQuery) return consignments
        const lowerQuery = searchQuery.toLowerCase()
        return consignments.filter(
            (c) =>
                c.consignment_number.toLowerCase().includes(lowerQuery) ||
                c.partner_name.toLowerCase().includes(lowerQuery) ||
                c.contact_person.toLowerCase().includes(lowerQuery)
        )
    }, [consignments, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = consignments.length
        const active = consignments.filter(c => c.status === 'active').length
        const completed = consignments.filter(c => c.status === 'completed').length
        const totalValue = consignments.reduce((sum, c) => sum + c.total_value, 0)
        const soldValue = consignments.reduce((sum, c) => sum + c.sold_value, 0)
        const commission = consignments.reduce((sum, c) => sum + c.commission_earned, 0)
        const avgRate = consignments.length > 0 ? (consignments.reduce((sum, c) => sum + c.commission_rate, 0) / consignments.length) : 0

        return { total, active, completed, totalValue, soldValue, commission, avgRate }
    }, [consignments])

    // Handlers
    const handleEdit = (deal: ConsignmentDeal) => {
        router.push(`/sales/consignment/${deal.id}/edit`)
    }

    const handleDelete = (deal: ConsignmentDeal) => {
        if (confirm('Are you sure you want to delete this consignment deal?')) {
            setConsignments(prev => prev.filter(c => c.id !== deal.id))
            addToast({ type: 'success', title: 'Deal deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<ConsignmentDeal>[] = useMemo(() => [
        {
            id: 'consignment_number',
            header: 'Consignment #',
            accessorKey: 'consignment_number',
            cell: ({ row }) => (
                <Link
                    href={`/sales/consignment/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.consignment_number}
                </Link>
            ),
        },
        {
            id: 'partner',
            header: 'Partner',
            accessorKey: 'partner_name',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.partner_name}</div>
                    <div className="text-xs text-gray-500">{row.original.partner_location}</div>
                </div>
            ),
        },
        {
            id: 'partner_type',
            header: 'Type',
            accessorKey: 'partner_type',
            cell: ({ row }) => {
                const Icon = partnerIcons[row.original.partner_type] || UserIcon
                return (
                    <Badge className={`flex items-center gap-1 w-fit ${partnerColors[row.original.partner_type] || partnerColors.store}`}>
                        <HugeiconsIcon icon={Icon} className="h-3 w-3" />
                        {row.original.partner_type.charAt(0).toUpperCase() + row.original.partner_type.slice(1)}
                    </Badge>
                )
            },
        },
        {
            id: 'payment_terms',
            header: 'Terms',
            accessorKey: 'payment_terms',
            cell: ({ row }) => (
                <span className="capitalize">{row.original.payment_terms.replace('_', ' ')}</span>
            ),
        },
        {
            id: 'commission_rate',
            header: 'Commission',
            accessorKey: 'commission_rate',
            cell: ({ row }) => (
                <div className="text-center">
                    <div className="font-medium text-green-600">{row.original.commission_rate}%</div>
                    <div className="text-xs text-gray-500">
                        {row.original.commission_earned.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                        })}
                    </div>
                </div>
            ),
        },
        {
            id: 'performance',
            header: 'Performance',
            accessorKey: 'sold_quantity',
            cell: ({ row }) => {
                const percentage = row.original.total_quantity > 0
                    ? (row.original.sold_quantity / row.original.total_quantity * 100)
                    : 0
                return (
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{row.original.sold_quantity} / {row.original.total_quantity}</span>
                        <div className="h-1.5 w-16 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                            <div
                                className={`h-full ${percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                )
            },
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] || statusColors.expired}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Consignment' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Consignment Sales"
                description="Manage consignment partnerships and track performance"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/consignment/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Deal
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
                                <HugeiconsIcon icon={Agreement01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ChartColumnIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                                <p className="text-2xl font-bold">
                                    {(stats.totalValue / 1000000000).toFixed(1)}B
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Commission</p>
                                <p className="text-2xl font-bold">
                                    {(stats.commission / 1000000).toFixed(1)}M
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
                            placeholder="Search consignments..."
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
                    data={filteredConsignments}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredConsignments.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
