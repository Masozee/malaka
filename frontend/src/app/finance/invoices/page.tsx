'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Invoice01Icon,
    Dollar01Icon,
    PercentSquareIcon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { financeInvoiceService, type Invoice } from '@/services/finance'

export default function InvoicesPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [data, setData] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const [form, setForm] = useState({
        invoice_number: '',
        invoice_date: '',
        due_date: '',
        total_amount: 0,
        tax_amount: 0,
        customer_id: '',
        supplier_id: '',
    })

    useEffect(() => { setMounted(true) }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await financeInvoiceService.getAll()
            setData(result)
        } catch (err) {
            console.error('Failed to fetch invoices:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const stats = useMemo(() => {
        const totalAmount = data.reduce((sum, inv) => sum + inv.grand_total, 0)
        const totalTax = data.reduce((sum, inv) => sum + inv.tax_amount, 0)
        return { totalCount: data.length, totalAmount, totalTax }
    }, [data])

    const filteredData = useMemo(() => {
        if (!searchTerm) return data
        const lower = searchTerm.toLowerCase()
        return data.filter(item =>
            item.invoice_number.toLowerCase().includes(lower)
        )
    }, [searchTerm, data])

    const handleCreate = async () => {
        try {
            await financeInvoiceService.create({
                ...form,
                grand_total: form.total_amount + form.tax_amount,
            })
            addToast({ type: 'success', title: 'Invoice created' })
            setIsCreateModalOpen(false)
            setForm({ invoice_number: '', invoice_date: '', due_date: '', total_amount: 0, tax_amount: 0, customer_id: '', supplier_id: '' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to create invoice' })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await financeInvoiceService.delete(id)
            addToast({ type: 'success', title: 'Invoice deleted' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to delete invoice' })
        }
    }

    const columns: TanStackColumn<Invoice>[] = [
        {
            id: 'invoice_number',
            header: 'Invoice Number',
            accessorKey: 'invoice_number',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.invoice_number || '-'}</span>,
        },
        {
            id: 'invoice_date',
            header: 'Invoice Date',
            accessorKey: 'invoice_date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {mounted && row.original.invoice_date ? new Date(row.original.invoice_date).toLocaleDateString('id-ID') : '-'}
                </span>
            ),
        },
        {
            id: 'due_date',
            header: 'Due Date',
            accessorKey: 'due_date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {mounted && row.original.due_date ? new Date(row.original.due_date).toLocaleDateString('id-ID') : '-'}
                </span>
            ),
        },
        {
            id: 'total_amount',
            header: 'Amount',
            accessorKey: 'total_amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.total_amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'tax_amount',
            header: 'Tax',
            accessorKey: 'tax_amount',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">Rp {row.original.tax_amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'grand_total',
            header: 'Grand Total',
            accessorKey: 'grand_total',
            cell: ({ row }) => <span className="text-sm font-bold">Rp {row.original.grand_total.toLocaleString('id-ID')}</span>,
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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.invoice_number)}>
                            Copy Invoice Number
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Invoices"
                description="Manage financial invoices and billing"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Invoices' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="invoices" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Invoice
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                                <p className="text-2xl font-bold">{stats.totalCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalAmount / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Tax</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalTax / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={PercentSquareIcon} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search invoices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
                    </div>
                    <Button variant="outline" className="h-9">
                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading...</div>
                ) : (
                    <TanStackDataTable data={filteredData} columns={columns} enableRowSelection showColumnToggle={false} />
                )}
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Invoice</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Invoice Number</Label>
                            <Input placeholder="INV-001" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Invoice Date</Label>
                                <Input type="date" value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer ID</Label>
                                <Input placeholder="Customer ref" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Supplier ID</Label>
                                <Input placeholder="Supplier ref" value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" placeholder="0" value={form.total_amount || ''} onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tax</Label>
                                <Input type="number" placeholder="0" value={form.tax_amount || ''} onChange={(e) => setForm({ ...form, tax_amount: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
