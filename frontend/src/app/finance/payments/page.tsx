'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    CreditCardIcon,
    Dollar01Icon,
    CheckmarkCircle01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { paymentService, type Payment } from '@/services/finance'

export default function PaymentsPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [methodFilter, setMethodFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [data, setData] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const [form, setForm] = useState({
        invoice_id: '',
        payment_date: '',
        amount: 0,
        payment_method: 'TRANSFER',
        cash_bank_id: '',
    })

    useEffect(() => { setMounted(true) }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await paymentService.getAll()
            setData(result)
        } catch (err) {
            console.error('Failed to fetch payments:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const stats = useMemo(() => {
        const totalAmount = data.reduce((sum, p) => sum + p.amount, 0)
        const methods = new Set(data.map(p => p.payment_method))
        return { totalCount: data.length, totalAmount, methodCount: methods.size }
    }, [data])

    const filteredData = useMemo(() => {
        let result = data
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            result = result.filter(item =>
                item.invoice_id.toLowerCase().includes(lower) ||
                item.payment_method.toLowerCase().includes(lower)
            )
        }
        if (methodFilter !== 'all') {
            result = result.filter(item => item.payment_method === methodFilter)
        }
        return result
    }, [searchTerm, methodFilter, data])

    const handleCreate = async () => {
        try {
            await paymentService.create(form)
            addToast({ type: 'success', title: 'Payment recorded' })
            setIsCreateModalOpen(false)
            setForm({ invoice_id: '', payment_date: '', amount: 0, payment_method: 'TRANSFER', cash_bank_id: '' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to record payment' })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await paymentService.delete(id)
            addToast({ type: 'success', title: 'Payment deleted' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to delete payment' })
        }
    }

    const columns: TanStackColumn<Payment>[] = [
        {
            id: 'invoice_id',
            header: 'Invoice',
            accessorKey: 'invoice_id',
            cell: ({ row }) => <span className="font-medium text-sm">{row.original.invoice_id.slice(0, 8)}...</span>,
        },
        {
            id: 'payment_date',
            header: 'Payment Date',
            accessorKey: 'payment_date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {mounted && row.original.payment_date ? new Date(row.original.payment_date).toLocaleDateString('id-ID') : '-'}
                </span>
            ),
        },
        {
            id: 'amount',
            header: 'Amount',
            accessorKey: 'amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'payment_method',
            header: 'Method',
            accessorKey: 'payment_method',
            cell: ({ row }) => (
                <span className="text-sm px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {row.original.payment_method}
                </span>
            ),
        },
        {
            id: 'cash_bank_id',
            header: 'Account',
            accessorKey: 'cash_bank_id',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.cash_bank_id ? row.original.cash_bank_id.slice(0, 8) + '...' : '-'}
                </span>
            ),
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
                        <DropdownMenuItem>Edit Payment</DropdownMenuItem>
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
                title="Payments"
                description="Track and manage payment transactions"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Payments' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="payments" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Payment
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                                <p className="text-2xl font-bold">{stats.totalCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                                <p className="text-sm font-medium text-muted-foreground">Payment Methods</p>
                                <p className="text-2xl font-bold">{stats.methodCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search payments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={methodFilter} onValueChange={setMethodFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Methods</SelectItem>
                                <SelectItem value="TRANSFER">Transfer</SelectItem>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="CHECK">Check</SelectItem>
                                <SelectItem value="GIRO">Giro</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-9">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
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
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Invoice ID</Label>
                            <Input placeholder="Invoice reference" value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payment Date</Label>
                                <Input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" placeholder="0" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CHECK">Check</SelectItem>
                                    <SelectItem value="GIRO">Giro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Cash/Bank Account ID</Label>
                            <Input placeholder="Account reference" value={form.cash_bank_id} onChange={(e) => setForm({ ...form, cash_bank_id: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Record Payment</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
