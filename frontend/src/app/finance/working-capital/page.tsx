'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    ArrowRight01Icon,
    Search01Icon,
    Download01Icon,
    ChartLineData02Icon,
    Calendar02Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import {
    accountsPayableService,
    accountsReceivableService,
    type AccountsPayable,
    type AccountsReceivable
} from '@/services/finance'

// --- Combined row type for table ---
type WCComponentType = 'Receivable' | 'Payable'

interface WCRow {
    id: string
    name: string
    type: WCComponentType
    amount: number
    status: string
    due_date: string
    invoice_id: string
}

export default function WorkingCapitalPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [apData, setApData] = useState<AccountsPayable[]>([])
    const [arData, setArData] = useState<AccountsReceivable[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const [ap, ar] = await Promise.all([
                    accountsPayableService.getAll(),
                    accountsReceivableService.getAll()
                ])
                setApData(ap)
                setArData(ar)
            } catch (err) {
                console.error('Failed to fetch working capital data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // --- Combined rows ---
    const combinedRows: WCRow[] = useMemo(() => {
        const arRows: WCRow[] = arData.map(r => ({
            id: r.id,
            name: 'AR - ' + (r.invoice_id || r.customer_id),
            type: 'Receivable' as WCComponentType,
            amount: r.balance,
            status: r.status,
            due_date: r.due_date,
            invoice_id: r.invoice_id,
        }))
        const apRows: WCRow[] = apData.map(p => ({
            id: p.id,
            name: 'AP - ' + (p.invoice_id || p.supplier_id),
            type: 'Payable' as WCComponentType,
            amount: p.balance,
            status: p.status,
            due_date: p.due_date,
            invoice_id: p.invoice_id,
        }))
        return [...arRows, ...apRows]
    }, [apData, arData])

    // --- Stats ---
    const stats = useMemo(() => {
        const receivables = arData.reduce((sum, r) => sum + r.balance, 0)
        const payables = apData.reduce((sum, p) => sum + p.balance, 0)
        const workingCapital = receivables - payables
        return { receivables, payables, workingCapital, totalItems: combinedRows.length }
    }, [apData, arData, combinedRows])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = combinedRows
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item => item.name.toLowerCase().includes(lower))
        }
        if (typeFilter !== 'all') {
            data = data.filter(item => item.type === typeFilter)
        }
        return data
    }, [searchTerm, typeFilter, combinedRows])

    // --- Columns ---
    const columns: TanStackColumn<WCRow>[] = [
        {
            id: 'name',
            header: 'Component',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.type}</span>
                </div>
            )
        },
        {
            id: 'amount',
            header: 'Balance',
            accessorKey: 'amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.amount.toLocaleString('id-ID')}</span>
        },
        {
            id: 'due_date',
            header: 'Due Date',
            accessorKey: 'due_date',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar02Icon} className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">
                        {mounted && row.original.due_date ? new Date(row.original.due_date).toLocaleDateString() : '-'}
                    </span>
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const s = row.original.status
                const colorMap: Record<string, string> = {
                    open: 'bg-blue-100 text-blue-800',
                    partial: 'bg-yellow-100 text-yellow-800',
                    paid: 'bg-green-100 text-green-800',
                    overdue: 'bg-red-100 text-red-800',
                }
                const color = colorMap[s] || 'bg-gray-100 text-gray-800'
                return <Badge className={`${color} border-0 capitalize`}>{s}</Badge>
            }
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
                        <DropdownMenuItem>View Analysis</DropdownMenuItem>
                        <DropdownMenuItem>History</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Working Capital"
                description="Optimize liquidity through receivables, payables, and inventory management"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Working Capital' }
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="working-capital" />
                        <Button variant="outline">
                            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                            Export Data
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Net Working Capital</p>
                                <p className="text-xl font-bold mt-1">Rp {stats.workingCapital.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={MoneySendSquareIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Receivables</p>
                                <p className="text-xl font-bold mt-1">Rp {stats.receivables.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 text-green-600 dark:text-green-400 transform rotate-180" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payables</p>
                                <p className="text-xl font-bold mt-1">Rp {stats.payables.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                                <p className="text-xl font-bold mt-1">{stats.totalItems}</p>
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
                            placeholder="Search data..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Receivable">Receivables</SelectItem>
                                <SelectItem value="Payable">Payables</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading working capital data...</p>
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
