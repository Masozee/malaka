'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// Select removed - no longer used for type filter
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
    Invoice01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'
import { taxTransactionService, type TaxTransaction } from '@/services/tax'

export default function WithholdingTaxPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [transactions, setTransactions] = useState<TaxTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const data = await taxTransactionService.getAll('withholding')
                setTransactions(data)
            } catch (error) {
                console.error('Failed to fetch withholding tax transactions:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // --- Stats ---
    const stats = useMemo(() => {
        const totalTax = transactions.reduce((sum, item) => sum + item.tax_amount, 0)
        const totalBase = transactions.reduce((sum, item) => sum + item.base_amount, 0)
        const transactionCount = transactions.length
        return { totalTax, totalBase, transactionCount }
    }, [transactions])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = transactions
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.reference_number.toLowerCase().includes(lower) ||
                item.reference_type.toLowerCase().includes(lower)
            )
        }
        return data
    }, [transactions, searchTerm])

    // --- Columns ---
    const columns: TanStackColumn<TaxTransaction>[] = [
        {
            id: 'transaction_date',
            header: 'Date',
            accessorKey: 'transaction_date',
            cell: ({ row }) => <span className="text-sm">{mounted && row.original.transaction_date ? new Date(row.original.transaction_date).toLocaleDateString() : '-'}</span>
        },
        {
            id: 'reference_number',
            header: 'Proof No.',
            accessorKey: 'reference_number',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.reference_number}</span>
        },
        {
            id: 'reference_type',
            header: 'Entity / Subject',
            accessorKey: 'reference_type',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{row.original.reference_type}</span>
                    <Badge variant="outline" className="w-fit text-[10px] mt-0.5">{row.original.transaction_type}</Badge>
                </div>
            )
        },
        {
            id: 'base_amount',
            header: 'Tax Base',
            accessorKey: 'base_amount',
            cell: ({ row }) => <span className="text-sm">Rp {row.original.base_amount.toLocaleString()}</span>
        },
        {
            id: 'tax_amount',
            header: 'Tax Amount',
            accessorKey: 'tax_amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.tax_amount.toLocaleString()}</span>
        },
        {
            id: 'total_amount',
            header: 'Total',
            accessorKey: 'total_amount',
            cell: ({ row }) => <span className="text-sm">Rp {row.original.total_amount.toLocaleString()}</span>
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Proof (Bukti Potong)</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Withholding Tax (PPh)"
                description="Manage PPh 21, 23, 4(2), and others"
                breadcrumbs={[
                    { label: 'Tax', href: '/tax' },
                    { label: 'Withholding' }
                ]}
                actions={
                    <Button>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        New Entry
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Withheld</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalTax / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Tax Base</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalBase / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                                <p className="text-2xl font-bold">{stats.transactionCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search name or proof no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-9">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading withholding tax data...</p>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={filteredData}
                        columns={columns}
                        enableRowSelection
                        showColumnToggle={false}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
