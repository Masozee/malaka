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
    DocumentValidationIcon,
    Calendar01Icon,
    ChartLineData01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
type ReportStatus = 'draft' | 'submitted' | 'paid' | 'overdue'

interface TaxReport {
    id: string
    period: string // e.g. "January 2024"
    taxType: string // e.g. "SPT Masa PPN"
    dueDate: string
    liabilityAmount: number
    status: ReportStatus
    filingRef?: string
}

// --- Mock Data ---
const mockReports: TaxReport[] = [
    { id: '1', period: 'January 2024', taxType: 'SPT Masa PPN', dueDate: '2024-02-28', liabilityAmount: 135000000, status: 'draft' },
    { id: '2', period: 'January 2024', taxType: 'SPT Masa PPh 21', dueDate: '2024-02-20', liabilityAmount: 15000000, status: 'submitted', filingRef: 'S-240220-001' },
    { id: '3', period: 'January 2024', taxType: 'SPT Masa PPh 23', dueDate: '2024-02-20', liabilityAmount: 5000000, status: 'paid', filingRef: 'S-240220-002' },
    { id: '4', period: 'Annual 2023', taxType: 'SPT Tahunan Badan', dueDate: '2024-04-30', liabilityAmount: 550000000, status: 'draft' },
    { id: '5', period: 'December 2023', taxType: 'SPT Masa PPN', dueDate: '2024-01-31', liabilityAmount: 120000000, status: 'paid', filingRef: 'S-240131-005' },
]

export default function TaxReportingPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // --- Stats ---
    const stats = useMemo(() => {
        const totalLiability = mockReports.reduce((sum, r) => sum + r.liabilityAmount, 0)
        const pending = mockReports.filter(r => r.status === 'draft' || r.status === 'overdue').length
        const completed = mockReports.filter(r => r.status === 'submitted' || r.status === 'paid').length
        return { totalLiability, pending, completed }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockReports
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.taxType.toLowerCase().includes(lower) ||
                item.period.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            data = data.filter(item => item.status === statusFilter)
        }
        return data
    }, [searchTerm, statusFilter])

    // --- Columns ---
    const columns: TanStackColumn<TaxReport>[] = [
        {
            id: 'period',
            header: 'Tax Period',
            accessorKey: 'period',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.period}</span>
        },
        {
            id: 'taxType',
            header: 'Type',
            accessorKey: 'taxType',
            cell: ({ row }) => <span className="text-sm">{row.original.taxType}</span>
        },
        {
            id: 'dueDate',
            header: 'Due Date',
            accessorKey: 'dueDate',
            cell: ({ row }) => <span className="text-sm">{new Date(row.original.dueDate).toLocaleDateString()}</span>
        },
        {
            id: 'liabilityAmount',
            header: 'Tax Liability',
            accessorKey: 'liabilityAmount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.liabilityAmount.toLocaleString()}</span>
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const colors = {
                    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                    paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                }
                return (
                    <Badge className={`${colors[row.original.status]} border-0 whitespace-nowrap capitalize`}>
                        {row.original.status}
                    </Badge>
                )
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
                        <DropdownMenuItem>Review Report</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                        {row.original.filingRef && (
                            <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Tax Reporting"
                description="Manage tax returns and filing status"
                breadcrumbs={[
                    { label: 'Tax', href: '/tax' },
                    { label: 'Reporting' }
                ]}
                actions={
                    <Button>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        Prepare Report
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Filings</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                            </div>
                            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={DocumentValidationIcon} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Liability</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalLiability / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ChartLineData01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Filed Reports</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search report type..."
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
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-9">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            History
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
