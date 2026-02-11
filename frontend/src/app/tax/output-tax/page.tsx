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
    TaxesIcon,
    FileExportIcon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
type InvoiceStatus = 'draft' | 'approved' | 'paid' | 'cancelled'

interface TaxInvoice {
    id: string
    invoiceDate: string
    invoiceNumber: string
    customerName: string
    taxBase: number // DPP
    vatAmount: number // PPN
    status: InvoiceStatus
}

// --- Mock Data ---
const mockInvoices: TaxInvoice[] = [
    { id: '1', invoiceDate: '2024-02-01', invoiceNumber: 'INV/2024/001', customerName: 'PT. Maju Mundur', taxBase: 10000000, vatAmount: 1100000, status: 'approved' },
    { id: '2', invoiceDate: '2024-02-02', invoiceNumber: 'INV/2024/002', customerName: 'CV. Sejahtera', taxBase: 5000000, vatAmount: 550000, status: 'paid' },
    { id: '3', invoiceDate: '2024-02-03', invoiceNumber: 'INV/2024/003', customerName: 'PT. Teknologi Baru', taxBase: 25000000, vatAmount: 2750000, status: 'draft' },
    { id: '4', invoiceDate: '2024-02-04', invoiceNumber: 'INV/2024/004', customerName: 'Toko Abadi', taxBase: 7500000, vatAmount: 825000, status: 'approved' },
    { id: '5', invoiceDate: '2024-02-05', invoiceNumber: 'INV/2024/005', customerName: 'PT. Global Sukses', taxBase: 15000000, vatAmount: 1650000, status: 'paid' },
]

export default function OutputTaxPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // --- Stats ---
    const stats = useMemo(() => {
        const totalVAT = mockInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0)
        const totalBase = mockInvoices.reduce((sum, inv) => sum + inv.taxBase, 0)
        const invoiceCount = mockInvoices.length
        return { totalVAT, totalBase, invoiceCount }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockInvoices
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.invoiceNumber.toLowerCase().includes(lower) ||
                item.customerName.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            data = data.filter(item => item.status === statusFilter)
        }
        return data
    }, [searchTerm, statusFilter])

    // --- Columns ---
    const columns: TanStackColumn<TaxInvoice>[] = [
        {
            id: 'invoiceDate',
            header: 'Date',
            accessorKey: 'invoiceDate',
            cell: ({ row }) => <span className="text-sm">{new Date(row.original.invoiceDate).toLocaleDateString()}</span>
        },
        {
            id: 'invoiceNumber',
            header: 'Invoice No.',
            accessorKey: 'invoiceNumber',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.invoiceNumber}</span>
        },
        {
            id: 'customerName',
            header: 'Customer',
            accessorKey: 'customerName',
            cell: ({ row }) => <span className="text-sm">{row.original.customerName}</span>
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
                    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
                    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                    paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.invoiceNumber)}>
                            Copy Invoice No
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Invoice</DropdownMenuItem>
                        <DropdownMenuItem>Download e-Faktur</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Output Tax (VAT Out)"
                description="Manage PPN Keluaran from sales transactions"
                breadcrumbs={[
                    { label: 'Tax', href: '/tax' },
                    { label: 'Output Tax' }
                ]}
                actions={
                    <Button>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        Create Tax Invoice
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total VAT Collected</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalVAT / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={FileExportIcon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Tax Base</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalBase / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={TaxesIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Invoices Issued</p>
                                <p className="text-2xl font-bold">{stats.invoiceCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={FileExportIcon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search invoice or customer..."
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
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
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
