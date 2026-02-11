'use client'

import React, { useState, useMemo } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
    AlertCircleIcon,
    Search01Icon,
    Download01Icon,
    FilterIcon,
    PiggyBankIcon,
    ChartLineData02Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
type SpendingStatus = 'under_limit' | 'near_limit' | 'over_limit'

interface ExpenseItem {
    id: string
    category: string
    department: string
    monthlyLimit: number
    currentSpend: number
    status: SpendingStatus
    lastExpenseDate: string
}

// --- Mock Data ---
const mockExpenses: ExpenseItem[] = [
    { id: '1', category: 'Software Subscriptions', department: 'IT', monthlyLimit: 50000000, currentSpend: 48000000, status: 'near_limit', lastExpenseDate: '2024-02-10' },
    { id: '2', category: 'Office Supplies', department: 'Admin', monthlyLimit: 15000000, currentSpend: 5000000, status: 'under_limit', lastExpenseDate: '2024-02-08' },
    { id: '3', category: 'Travel & Entertainment', department: 'Sales', monthlyLimit: 100000000, currentSpend: 110000000, status: 'over_limit', lastExpenseDate: '2024-02-11' },
    { id: '4', category: 'Cloud Infrastructure', department: 'Engineering', monthlyLimit: 200000000, currentSpend: 150000000, status: 'under_limit', lastExpenseDate: '2024-02-10' },
    { id: '5', category: 'Digital Ads', department: 'Marketing', monthlyLimit: 300000000, currentSpend: 280000000, status: 'near_limit', lastExpenseDate: '2024-02-09' },
]

export default function CostControlPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // --- Stats ---
    const stats = useMemo(() => {
        const totalLimit = mockExpenses.reduce((sum, item) => sum + item.monthlyLimit, 0)
        const totalSpend = mockExpenses.reduce((sum, item) => sum + item.currentSpend, 0)
        const savings = totalLimit - totalSpend
        const overLimitCount = mockExpenses.filter(item => item.status === 'over_limit').length
        return { totalSpend, savings, overLimitCount }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockExpenses
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.category.toLowerCase().includes(lower) ||
                item.department.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            data = data.filter(item => item.status === statusFilter)
        }
        return data
    }, [searchTerm, statusFilter])

    // --- Columns ---
    const columns: TanStackColumn<ExpenseItem>[] = [
        {
            id: 'category',
            header: 'Expense Category',
            accessorKey: 'category',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.category}</span>
                    <span className="text-xs text-muted-foreground">{row.original.department}</span>
                </div>
            )
        },
        {
            id: 'spend',
            header: 'Current Spend',
            accessorKey: 'currentSpend',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {(row.original.currentSpend / 1000000).toFixed(1)}M</span>
        },
        {
            id: 'limit',
            header: 'Monthly Limit',
            accessorKey: 'monthlyLimit',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">Rp {(row.original.monthlyLimit / 1000000).toFixed(1)}M</span>
        },
        {
            id: 'utilization',
            header: 'Utilization',
            cell: ({ row }) => {
                const pct = (row.original.currentSpend / row.original.monthlyLimit) * 100
                // Use explicit utility classes instead of prop if component logic is custom
                // But since we patched Progress, we can use indicatorClassName
                const colorClass = pct > 100 ? 'bg-red-500' : pct > 90 ? 'bg-yellow-500' : 'bg-green-500'

                return (
                    <div className="w-[140px] space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="font-medium">{pct.toFixed(0)}%</span>
                        </div>
                        <Progress value={Math.min(pct, 100)} className="h-2" indicatorClassName={colorClass} />
                    </div>
                )
            }
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = {
                    under_limit: { label: 'Good', color: 'bg-green-100 text-green-800' },
                    near_limit: { label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
                    over_limit: { label: 'Over Limit', color: 'bg-red-100 text-red-800' }
                }
                const s = config[row.original.status]
                return <Badge className={`${s.color} border-0 whitespace-nowrap`}>{s.label}</Badge>
            }
        },
        {
            id: 'lastDate',
            header: 'Last Expense',
            accessorKey: 'lastExpenseDate',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.lastExpenseDate}</span>
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
                        <DropdownMenuItem>Adjust Limit</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Cost Control"
                description="Monitor expenses and enforce spending limits"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Cost Control' }
                ]}
                actions={
                    <Button variant="outline">
                        <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Monthly Spend</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalSpend / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={MoneySendSquareIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Est. Monthly Savings</p>
                                <p className="text-2xl font-bold text-green-600">Rp {(stats.savings / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={PiggyBankIcon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Over Limit Categories</p>
                                <p className="text-2xl font-bold text-red-600">{stats.overLimitCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="under_limit">Good</SelectItem>
                                <SelectItem value="near_limit">Review</SelectItem>
                                <SelectItem value="over_limit">Over Limit</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
                        </Button>
                    </div>
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
