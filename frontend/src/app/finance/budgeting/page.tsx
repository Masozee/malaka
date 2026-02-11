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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PieChartIcon,
    ChartLineData02Icon,
    AlertCircleIcon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    PencilEdit01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
type BudgetStatus = 'on_track' | 'warning' | 'exceeded'

interface BudgetAttributes {
    id: string
    department: string
    category: string // e.g. "Marketing - Q1", "IT - Hardware"
    fiscalYear: string
    allocated: number
    spent: number
    status: BudgetStatus
}

// --- Mock Data ---
const mockBudgets: BudgetAttributes[] = [
    { id: '1', department: 'Sales', category: 'Travel Expenses', fiscalYear: '2024', allocated: 500000000, spent: 125000000, status: 'on_track' },
    { id: '2', department: 'Marketing', category: 'Digital Ads', fiscalYear: '2024', allocated: 1200000000, spent: 1150000000, status: 'warning' },
    { id: '3', department: 'IT', category: 'Software Licenses', fiscalYear: '2024', allocated: 800000000, spent: 850000000, status: 'exceeded' },
    { id: '4', department: 'HR', category: 'Recruitment', fiscalYear: '2024', allocated: 300000000, spent: 50000000, status: 'on_track' },
    { id: '5', department: 'Operations', category: 'Maintenance', fiscalYear: '2024', allocated: 600000000, spent: 200000000, status: 'on_track' },
]

export default function BudgetingPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [deptFilter, setDeptFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // --- Stats ---
    const stats = useMemo(() => {
        const totalAllocated = mockBudgets.reduce((sum, b) => sum + b.allocated, 0)
        const totalSpent = mockBudgets.reduce((sum, b) => sum + b.spent, 0)
        const utilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
        const alertCount = mockBudgets.filter(b => b.status === 'warning' || b.status === 'exceeded').length
        return { totalAllocated, totalSpent, utilization, alertCount }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockBudgets
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.category.toLowerCase().includes(lower) ||
                item.department.toLowerCase().includes(lower)
            )
        }
        if (deptFilter !== 'all') {
            data = data.filter(item => item.department === deptFilter)
        }
        return data
    }, [searchTerm, deptFilter])

    // --- Columns ---
    const columns: TanStackColumn<BudgetAttributes>[] = [
        {
            id: 'category',
            header: 'Budget Category',
            accessorKey: 'category',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.category}</span>
                    <span className="text-xs text-muted-foreground">{row.original.department} - FY{row.original.fiscalYear}</span>
                </div>
            )
        },
        {
            id: 'allocated',
            header: 'Allocated',
            accessorKey: 'allocated',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {(row.original.allocated / 1000000).toFixed(0)}M</span>
        },
        {
            id: 'spent',
            header: 'Spent',
            accessorKey: 'spent',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">Rp {(row.original.spent / 1000000).toFixed(0)}M</span>
        },
        {
            id: 'progress',
            header: 'Utilization',
            cell: ({ row }) => {
                const pct = (row.original.spent / row.original.allocated) * 100
                const colorClass = pct > 100 ? 'bg-red-500' : pct > 90 ? 'bg-yellow-500' : 'bg-blue-600'
                return (
                    <div className="w-[140px] space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="font-medium">{pct.toFixed(1)}%</span>
                        </div>
                        <Progress value={Math.min(pct, 100)} className="h-2" indicatorClassName={colorClass} />
                    </div>
                )
            }
        },
        {
            id: 'remaining',
            header: 'Remaining',
            cell: ({ row }) => {
                const remaining = row.original.allocated - row.original.spent
                return (
                    <span className={`text-sm font-medium ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        Rp {(remaining / 1000000).toFixed(0)}M
                    </span>
                )
            }
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = {
                    on_track: { label: 'On Track', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
                    warning: { label: 'Warning', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
                    exceeded: { label: 'Exceeded', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' }
                }
                const s = config[row.original.status]
                return <Badge className={`${s.color} border-0 whitespace-nowrap`}>{s.label}</Badge>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Budget</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Budgeting"
                description="Track and manage departmental budgets and spending"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Budgeting' }
                ]}
                actions={
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        New Budget
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Budget (FY24)</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalAllocated / 1000000000).toFixed(1)}B</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={PieChartIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Overall Utilization</p>
                                <p className="text-2xl font-bold">{stats.utilization.toFixed(1)}%</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ChartLineData02Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                                <p className="text-2xl font-bold text-red-600">{stats.alertCount}</p>
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
                            placeholder="Search budgets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Depts</SelectItem>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="IT">IT</SelectItem>
                                <SelectItem value="HR">HR</SelectItem>
                                <SelectItem value="Operations">Operations</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-9">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export
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

            {/* Create Modal Placeholder */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Budget Allocation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sales">Sales</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input placeholder="e.g. Q1 Marketing Campaign" />
                        </div>
                        <div className="space-y-2">
                            <Label>Allocated Amount</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                addToast({ type: 'success', title: 'Budget created' })
                                setIsCreateModalOpen(false)
                            }}>Create Budget</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
