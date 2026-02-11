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

// --- Types ---
type WCComponentType = 'Receivable' | 'Payable' | 'Inventory'

interface WCComponent {
    id: string
    name: string
    type: WCComponentType
    amount: number
    daysOutstanding: number // DSO, DPO, DIO
    status: 'healthy' | 'attention' | 'critical'
    trend: 'improving' | 'stable' | 'worsening'
}

// --- Mock Data ---
const mockComponents: WCComponent[] = [
    { id: '1', name: 'Trade Receivables', type: 'Receivable', amount: 1200000000, daysOutstanding: 45, status: 'attention', trend: 'worsening' },
    { id: '2', name: 'Trade Payables', type: 'Payable', amount: 800000000, daysOutstanding: 60, status: 'healthy', trend: 'stable' },
    { id: '3', name: 'Finished Goods Inventory', type: 'Inventory', amount: 1500000000, daysOutstanding: 30, status: 'healthy', trend: 'improving' },
    { id: '4', name: 'Raw Material Inventory', type: 'Inventory', amount: 500000000, daysOutstanding: 45, status: 'attention', trend: 'stable' },
    { id: '5', name: 'Short-term Loans', type: 'Payable', amount: 300000000, daysOutstanding: 0, status: 'healthy', trend: 'stable' },
]

export default function WorkingCapitalPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    // --- Stats ---
    const stats = useMemo(() => {
        const receivables = mockComponents.filter(c => c.type === 'Receivable').reduce((sum, c) => sum + c.amount, 0)
        const payables = mockComponents.filter(c => c.type === 'Payable').reduce((sum, c) => sum + c.amount, 0)
        const inventory = mockComponents.filter(c => c.type === 'Inventory').reduce((sum, c) => sum + c.amount, 0)
        const workingCapital = receivables + inventory - payables
        return { receivables, payables, inventory, workingCapital }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockComponents
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item => item.name.toLowerCase().includes(lower))
        }
        if (typeFilter !== 'all') {
            data = data.filter(item => item.type === typeFilter)
        }
        return data
    }, [searchTerm, typeFilter])

    // --- Columns ---
    const columns: TanStackColumn<WCComponent>[] = [
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
            header: 'Amount',
            accessorKey: 'amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {(row.original.amount / 1000000).toLocaleString()}M</span>
        },
        {
            id: 'days',
            header: 'Days Outstanding',
            accessorKey: 'daysOutstanding',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar02Icon} className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{row.original.daysOutstanding} days</span>
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = {
                    healthy: { label: 'Healthy', color: 'bg-green-100 text-green-800' },
                    attention: { label: 'Attention', color: 'bg-yellow-100 text-yellow-800' },
                    critical: { label: 'Critical', color: 'bg-red-100 text-red-800' }
                }
                const s = config[row.original.status]
                return <Badge className={`${s.color} border-0 capitalize`}>{s.label}</Badge>
            }
        },
        {
            id: 'trend',
            header: 'Trend',
            accessorKey: 'trend',
            cell: ({ row }) => {
                const config = {
                    improving: { label: 'Improving', color: 'text-green-600' },
                    stable: { label: 'Stable', color: 'text-gray-600' },
                    worsening: { label: 'Worsening', color: 'text-red-600' }
                }
                const s = config[row.original.trend]
                return <span className={`text-sm font-medium ${s.color} capitalize`}>{s.label}</span>
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
                    <Button variant="outline">
                        <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                        Export Data
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Net Working Capital</p>
                                <p className="text-xl font-bold mt-1">Rp {(stats.workingCapital / 1000000000).toFixed(2)}B</p>
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
                                <p className="text-xl font-bold mt-1">Rp {(stats.receivables / 1000000000).toFixed(2)}B</p>
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
                                <p className="text-xl font-bold mt-1">Rp {(stats.payables / 1000000000).toFixed(2)}B</p>
                            </div>
                            <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                                <p className="text-xl font-bold mt-1">Rp {(stats.inventory / 1000000000).toFixed(2)}B</p>
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
                                <SelectItem value="Inventory">Inventory</SelectItem>
                            </SelectContent>
                        </Select>
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
