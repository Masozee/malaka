'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    MoneySendSquareIcon,
    Search01Icon,
    Download01Icon,
    FilterIcon,
    PiggyBankIcon,
    ChartLineData02Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { cashDisbursementService, type CashDisbursement } from '@/services/finance'

export default function CostControlPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [disbursements, setDisbursements] = useState<CashDisbursement[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const data = await cashDisbursementService.getAll()
                setDisbursements(data)
            } catch (err) {
                console.error('Failed to fetch disbursements:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // --- Stats ---
    const stats = useMemo(() => {
        const totalSpend = disbursements.reduce((sum, item) => sum + item.amount, 0)
        const count = disbursements.length
        const avgAmount = count > 0 ? totalSpend / count : 0
        return { totalSpend, count, avgAmount }
    }, [disbursements])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = disbursements
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.description.toLowerCase().includes(lower) ||
                item.cash_bank_id.toLowerCase().includes(lower)
            )
        }
        return data
    }, [searchTerm, disbursements])

    // --- Columns ---
    const columns: TanStackColumn<CashDisbursement>[] = [
        {
            id: 'description',
            header: 'Description',
            accessorKey: 'description',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.description || '-'}</span>
                    <span className="text-xs text-muted-foreground">{row.original.id.slice(0, 8)}...</span>
                </div>
            )
        },
        {
            id: 'amount',
            header: 'Amount',
            accessorKey: 'amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.amount.toLocaleString('id-ID')}</span>
        },
        {
            id: 'disbursement_date',
            header: 'Date',
            accessorKey: 'disbursement_date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {mounted && row.original.disbursement_date ? new Date(row.original.disbursement_date).toLocaleDateString() : '-'}
                </span>
            )
        },
        {
            id: 'cash_bank_id',
            header: 'Cash/Bank Account',
            accessorKey: 'cash_bank_id',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.cash_bank_id.slice(0, 8)}...</span>
        },
        {
            id: 'created_at',
            header: 'Created',
            accessorKey: 'created_at',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {mounted && row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '-'}
                </span>
            )
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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Cost Control"
                description="Monitor expenses and track cash disbursements"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Cost Control' }
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="cost-control" />
                        <Button variant="outline">
                            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Disbursements</p>
                                <p className="text-2xl font-bold">Rp {stats.totalSpend.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={MoneySendSquareIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Disbursement Count</p>
                                <p className="text-2xl font-bold">{stats.count}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={PiggyBankIcon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Average Amount</p>
                                <p className="text-2xl font-bold">Rp {stats.avgAmount.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ChartLineData02Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search disbursements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading disbursement data...</p>
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
