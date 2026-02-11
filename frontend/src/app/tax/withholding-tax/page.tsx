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
    Invoice01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
type WithholdingType = 'PPh 21' | 'PPh 23' | 'PPh 4(2)' | 'PPh 26'

interface WithholdingTax {
    id: string
    date: string
    entityName: string // Employee or Vendor
    type: WithholdingType
    taxBase: number
    taxAmount: number
    proofNumber: string
    status: 'draft' | 'finalized'
}

// --- Mock Data ---
const mockWithholdings: WithholdingTax[] = [
    { id: '1', date: '2024-02-01', entityName: 'Budi Santoso (Emp)', type: 'PPh 21', taxBase: 12000000, taxAmount: 350000, proofNumber: '1721-A1-001', status: 'finalized' },
    { id: '2', date: '2024-02-05', entityName: 'PT. Jasa Konsultan', type: 'PPh 23', taxBase: 10000000, taxAmount: 200000, proofNumber: 'BUPOT-23-001', status: 'finalized' },
    { id: '3', date: '2024-02-05', entityName: 'John Doe (Foreign Cons)', type: 'PPh 26', taxBase: 25000000, taxAmount: 5000000, proofNumber: 'BUPOT-26-001', status: 'draft' },
    { id: '4', date: '2024-02-10', entityName: 'Office Rental Owner', type: 'PPh 4(2)', taxBase: 50000000, taxAmount: 5000000, proofNumber: 'BUPOT-42-001', status: 'finalized' },
]

export default function WithholdingTaxPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    // --- Stats ---
    const stats = useMemo(() => {
        const totalTax = mockWithholdings.reduce((sum, item) => sum + item.taxAmount, 0)
        const pph21 = mockWithholdings.filter(i => i.type === 'PPh 21').reduce((sum, i) => sum + i.taxAmount, 0)
        const pph23 = mockWithholdings.filter(i => i.type === 'PPh 23').reduce((sum, i) => sum + i.taxAmount, 0)
        return { totalTax, pph21, pph23 }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockWithholdings
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.entityName.toLowerCase().includes(lower) ||
                item.proofNumber.toLowerCase().includes(lower)
            )
        }
        if (typeFilter !== 'all') {
            data = data.filter(item => item.type === typeFilter)
        }
        return data
    }, [searchTerm, typeFilter])

    // --- Columns ---
    const columns: TanStackColumn<WithholdingTax>[] = [
        {
            id: 'date',
            header: 'Date',
            accessorKey: 'date',
            cell: ({ row }) => <span className="text-sm">{new Date(row.original.date).toLocaleDateString()}</span>
        },
        {
            id: 'proofNumber',
            header: 'Proof No.',
            accessorKey: 'proofNumber',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.proofNumber}</span>
        },
        {
            id: 'entityName',
            header: 'Entity / Subject',
            accessorKey: 'entityName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{row.original.entityName}</span>
                    <Badge variant="outline" className="w-fit text-[10px] mt-0.5">{row.original.type}</Badge>
                </div>
            )
        },
        {
            id: 'taxBase',
            header: 'Tax Base',
            accessorKey: 'taxBase',
            cell: ({ row }) => <span className="text-sm">Rp {row.original.taxBase.toLocaleString()}</span>
        },
        {
            id: 'taxAmount',
            header: 'Tax Amount',
            accessorKey: 'taxAmount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.taxAmount.toLocaleString()}</span>
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const colors = {
                    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                    finalized: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
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
                                <p className="text-sm font-medium text-muted-foreground">PPh 21 (Employee)</p>
                                <p className="text-2xl font-bold">Rp {(stats.pph21 / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">PPh 23 (Services)</p>
                                <p className="text-2xl font-bold">Rp {(stats.pph23 / 1000000).toFixed(1)}M</p>
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
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Tax Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="PPh 21">PPh 21</SelectItem>
                                <SelectItem value="PPh 23">PPh 23</SelectItem>
                                <SelectItem value="PPh 4(2)">PPh 4(2)</SelectItem>
                                <SelectItem value="PPh 26">PPh 26</SelectItem>
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
        </TwoLevelLayout>
    )
}
