'use client'

import React, { useState, useMemo } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    FileSearchIcon,
    AlertCircleIcon,
    Search01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
interface RecoItem {
    id: string
    date: string
    description: string
    glAmount: number
    taxAmount: number
    variance: number
    status: 'matched' | 'unmatched'
}

// --- Mock Data ---
const mockReco: RecoItem[] = [
    { id: '1', date: '2024-01-15', description: 'Sales Invoice INV-001 VAT', glAmount: 1100000, taxAmount: 1100000, variance: 0, status: 'matched' },
    { id: '2', date: '2024-01-18', description: 'Purchase INV-SUP-005 VAT', glAmount: 550000, taxAmount: 550000, variance: 0, status: 'matched' },
    { id: '3', date: '2024-01-20', description: 'Adjustment Entry PPN', glAmount: 1200000, taxAmount: 1000000, variance: 200000, status: 'unmatched' },
    { id: '4', date: '2024-01-22', description: 'Correction VAT INV-003', glAmount: 0, taxAmount: 2750000, variance: -2750000, status: 'unmatched' },
]

export default function TaxReconciliationPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // --- Stats ---
    const stats = useMemo(() => {
        const unmatchedCount = mockReco.filter(i => i.status === 'unmatched').length
        const totalVariance = mockReco.reduce((sum, i) => sum + Math.abs(i.variance), 0)
        return { unmatchedCount, totalVariance }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockReco
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item => item.description.toLowerCase().includes(lower))
        }
        if (statusFilter !== 'all') {
            data = data.filter(item => item.status === statusFilter)
        }
        return data
    }, [searchTerm, statusFilter])

    // --- Columns ---
    const columns: TanStackColumn<RecoItem>[] = [
        {
            id: 'date',
            header: 'Date',
            accessorKey: 'date',
            cell: ({ row }) => <span className="text-sm">{new Date(row.original.date).toLocaleDateString()}</span>
        },
        {
            id: 'description',
            header: 'Description',
            accessorKey: 'description',
            cell: ({ row }) => <span className="text-sm font-medium">{row.original.description}</span>
        },
        {
            id: 'glAmount',
            header: 'GL Amount',
            accessorKey: 'glAmount',
            cell: ({ row }) => <span className="text-sm">Rp {row.original.glAmount.toLocaleString()}</span>
        },
        {
            id: 'taxAmount',
            header: 'Tax Rec Amount',
            accessorKey: 'taxAmount',
            cell: ({ row }) => <span className="text-sm">Rp {row.original.taxAmount.toLocaleString()}</span>
        },
        {
            id: 'variance',
            header: 'Variance',
            accessorKey: 'variance',
            cell: ({ row }) => (
                <span className={`text-sm font-medium ${row.original.variance !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Rp {row.original.variance.toLocaleString()}
                </span>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge className={row.original.status === 'matched'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-0 capitalize'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-0 capitalize'
                }>
                    {row.original.status}
                </Badge>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: () => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Entries</DropdownMenuItem>
                        <DropdownMenuItem>Create Adjustment</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Tax Reconciliation"
                description="Reconcile GL accounts with tax reports"
                breadcrumbs={[
                    { label: 'Tax', href: '/tax' },
                    { label: 'Reconciliation' }
                ]}
                actions={
                    <Button>
                        <HugeiconsIcon icon={FileSearchIcon} className="w-4 h-4 mr-2" />
                        Run Auto-Reconcile
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Unmatched Items</p>
                                <p className="text-2xl font-bold text-red-600">{stats.unmatchedCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Variance</p>
                                <p className="text-2xl font-bold">Rp {stats.totalVariance.toLocaleString()}</p>
                            </div>
                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={FileSearchIcon} className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] h-9">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="matched">Matched</SelectItem>
                            <SelectItem value="unmatched">Unmatched</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <TanStackDataTable
                    data={filteredData}
                    columns={columns}
                    enableRowSelection
                    showColumnToggle={false}
                />
            </div>
        </TwoLevelLayout>
    )
}
