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
    FileImportIcon,
    AlertCircleIcon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
type CreditStatus = 'creditable' | 'non-creditable' | 'refund'

interface InputTaxInvoice {
    id: string
    date: string
    supplierName: string
    invoiceNumber: string
    taxBase: number
    vatAmount: number
    status: CreditStatus
}

// --- Mock Data ---
const mockInputInvoices: InputTaxInvoice[] = [
    { id: '1', date: '2024-02-01', supplierName: 'PT. Supplier A', invoiceNumber: 'SUP/INV/001', taxBase: 20000000, vatAmount: 2200000, status: 'creditable' },
    { id: '2', date: '2024-02-02', supplierName: 'CV. Vendor B', invoiceNumber: 'SUP/INV/002', taxBase: 5000000, vatAmount: 550000, status: 'creditable' },
    { id: '3', date: '2024-02-03', supplierName: 'Restoran Enak', invoiceNumber: 'RCP/003', taxBase: 1000000, vatAmount: 110000, status: 'non-creditable' },
    { id: '4', date: '2024-02-04', supplierName: 'PT. Logistik C', invoiceNumber: 'SUP/INV/004', taxBase: 15000000, vatAmount: 1650000, status: 'creditable' },
    { id: '5', date: '2024-02-05', supplierName: 'Toko ATK', invoiceNumber: 'STR/005', taxBase: 500000, vatAmount: 55000, status: 'non-creditable' },
]

export default function InputTaxPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // --- Stats ---
    const stats = useMemo(() => {
        const totalVAT = mockInputInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0)
        const creditableVAT = mockInputInvoices.filter(i => i.status === 'creditable').reduce((sum, inv) => sum + inv.vatAmount, 0)
        const nonCreditableVAT = totalVAT - creditableVAT
        return { totalVAT, creditableVAT, nonCreditableVAT }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockInputInvoices
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.invoiceNumber.toLowerCase().includes(lower) ||
                item.supplierName.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            data = data.filter(item => item.status === statusFilter)
        }
        return data
    }, [searchTerm, statusFilter])

    // --- Columns ---
    const columns: TanStackColumn<InputTaxInvoice>[] = [
        {
            id: 'date',
            header: 'Date',
            accessorKey: 'date',
            cell: ({ row }) => <span className="text-sm">{new Date(row.original.date).toLocaleDateString()}</span>
        },
        {
            id: 'supplierName',
            header: 'Supplier',
            accessorKey: 'supplierName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.supplierName}</span>
                    <span className="text-xs text-muted-foreground">{row.original.invoiceNumber}</span>
                </div>
            )
        },
        {
            id: 'taxBase',
            header: 'Tax Base (DPP)',
            accessorKey: 'taxBase',
            cell: ({ row }) => <span className="text-sm">Rp {row.original.taxBase.toLocaleString()}</span>
        },
        {
            id: 'vatAmount',
            header: 'VAT (PPN)',
            accessorKey: 'vatAmount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.vatAmount.toLocaleString()}</span>
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const colors = {
                    creditable: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    'non-creditable': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    refund: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                }
                return (
                    <Badge className={`${colors[row.original.status]} border-0 whitespace-nowrap capitalize`}>
                        {row.original.status.replace('-', ' ')}
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Scan QR Code</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Input Tax (VAT In)"
                description="Track PPN Masukan from purchases"
                breadcrumbs={[
                    { label: 'Tax', href: '/tax' },
                    { label: 'Input Tax' }
                ]}
                actions={
                    <Button>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        Scan Invoice
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Input VAT</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalVAT / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={FileImportIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Creditable VAT</p>
                                <p className="text-2xl font-bold text-green-600">Rp {(stats.creditableVAT / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={FileImportIcon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Non-Creditable</p>
                                <p className="text-2xl font-bold text-red-600">Rp {(stats.nonCreditableVAT / 1000000).toFixed(1)}M</p>
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
                            placeholder="Search invoice or supplier..."
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
                                <SelectItem value="creditable">Creditable</SelectItem>
                                <SelectItem value="non-creditable">Non-Creditable</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-9">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export CSV
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
